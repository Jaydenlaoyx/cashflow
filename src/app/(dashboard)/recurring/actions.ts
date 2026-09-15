"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const recurringSchema = z.object({
  type: z.enum(["income", "expense"]),
  accountId: z.string().uuid(),
  categoryId: z.string().uuid(),
  amount: z.coerce.number().positive(),
  description: z.string().trim().min(1).max(150),
  merchant: z.string().trim().max(100),
  frequency: z.enum([
    "weekly",
    "fortnightly",
    "monthly",
    "yearly",
  ]),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.union([
    z.literal(""),
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  ]),
  notes: z.string().trim().max(1000),
});

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (error || typeof userId !== "string") {
    redirect("/login");
  }

  return {
    supabase,
    userId,
  };
}

export async function createRecurringTransaction(
  formData: FormData,
) {
  const result = recurringSchema.safeParse({
    type: formData.get("type"),
    accountId: formData.get("accountId"),
    categoryId: formData.get("categoryId"),
    amount: formData.get("amount"),
    description: formData.get("description"),
    merchant: formData.get("merchant") ?? "",
    frequency: formData.get("frequency"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate") ?? "",
    notes: formData.get("notes") ?? "",
  });

  if (!result.success) {
    redirect("/recurring?error=invalid-schedule");
  }

  const schedule = result.data;

  if (
    schedule.endDate &&
    schedule.endDate < schedule.startDate
  ) {
    redirect("/recurring?error=invalid-date-range");
  }

  const { supabase, userId } =
    await getAuthenticatedUser();

  const [
    { data: account, error: accountError },
    { data: category, error: categoryError },
  ] = await Promise.all([
    supabase
      .from("accounts")
      .select("id")
      .eq("id", schedule.accountId)
      .eq("user_id", userId)
      .eq("is_archived", false)
      .maybeSingle(),

    supabase
      .from("categories")
      .select("id, type")
      .eq("id", schedule.categoryId)
      .eq("user_id", userId)
      .eq("is_archived", false)
      .maybeSingle(),
  ]);

  if (accountError || !account) {
    redirect("/recurring?error=invalid-account");
  }

  if (
    categoryError ||
    !category ||
    category.type !== schedule.type
  ) {
    redirect("/recurring?error=invalid-category");
  }

  const { error } = await supabase
    .from("recurring_transactions")
    .insert({
      user_id: userId,
      account_id: schedule.accountId,
      category_id: schedule.categoryId,
      type: schedule.type,
      amount: schedule.amount,
      description: schedule.description,
      merchant: schedule.merchant || null,
      frequency: schedule.frequency,
      start_date: schedule.startDate,
      next_occurrence: schedule.startDate,
      end_date: schedule.endDate || null,
      notes: schedule.notes || null,
    });

  if (error) {
    console.error("Recurring schedule creation failed:", error);
    redirect("/recurring?error=create-failed");
  }

  revalidatePath("/recurring");

  redirect("/recurring?created=true");
}

export async function toggleRecurringTransaction(
  recurringId: string,
  nextActiveState: boolean,
) {
  if (!z.string().uuid().safeParse(recurringId).success) {
    redirect("/recurring?error=invalid-schedule");
  }

  const { supabase, userId } =
    await getAuthenticatedUser();

  const { error } = await supabase
    .from("recurring_transactions")
    .update({
      is_active: nextActiveState,
    })
    .eq("id", recurringId)
    .eq("user_id", userId);

  if (error) {
    console.error("Recurring schedule update failed:", error);
    redirect("/recurring?error=update-failed");
  }

  revalidatePath("/recurring");

  redirect("/recurring?updated=true");
}

export async function deleteRecurringTransaction(
  recurringId: string,
) {
  if (!z.string().uuid().safeParse(recurringId).success) {
    redirect("/recurring?error=invalid-schedule");
  }

  const { supabase, userId } =
    await getAuthenticatedUser();

  const { error } = await supabase
    .from("recurring_transactions")
    .delete()
    .eq("id", recurringId)
    .eq("user_id", userId);

  if (error) {
    console.error("Recurring schedule deletion failed:", error);
    redirect("/recurring?error=delete-failed");
  }

  revalidatePath("/recurring");

  redirect("/recurring?deleted=true");
}

export async function processDueRecurringTransactions() {
  const { supabase } = await getAuthenticatedUser();

  const parts = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Melbourne",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find(
    (part) => part.type === "year",
  )?.value;

  const month = parts.find(
    (part) => part.type === "month",
  )?.value;

  const day = parts.find(
    (part) => part.type === "day",
  )?.value;

  const today = `${year}-${month}-${day}`;

  const { data: generatedCount, error } = await supabase.rpc(
    "process_due_recurring_transactions",
    {
      p_through_date: today,
    },
  );

  if (error) {
    console.error(
      "Recurring transaction processing failed:",
      error,
    );

    redirect("/recurring?error=processing-failed");
  }

  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/analytics");
  revalidatePath("/budgets");
  revalidatePath("/recurring");

  redirect(
    `/recurring?processed=true&generated=${generatedCount ?? 0}`,
  );
}