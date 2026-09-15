"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const budgetSchema = z.object({
  categoryId: z.string().uuid("Select an expense category."),
  amount: z.coerce
    .number()
    .positive("Budget amount must be greater than zero.")
    .max(999999999999.99, "Budget amount is too large."),
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "Select a valid month."),
});

export type BudgetActionState = {
  error?: string;
  fieldErrors?: {
    categoryId?: string[];
    amount?: string[];
    month?: string[];
  };
};

function getMonthRange(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);

  const lastDay = new Date(
    Date.UTC(year, monthNumber, 0),
  ).getUTCDate();

  return {
    startDate: `${month}-01`,
    endDate: `${month}-${String(lastDay).padStart(2, "0")}`,
  };
}

export async function saveBudget(
  _previousState: BudgetActionState,
  formData: FormData,
): Promise<BudgetActionState> {
  const parsedBudget = budgetSchema.safeParse({
    categoryId: formData.get("categoryId"),
    amount: formData.get("amount"),
    month: formData.get("month"),
  });

  if (!parsedBudget.success) {
    return {
      error: "Please correct the highlighted fields.",
      fieldErrors: parsedBudget.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub;

  if (claimsError || typeof userId !== "string") {
    return {
      error: "Your session has expired. Please log in again.",
    };
  }

  const { categoryId, amount, month } = parsedBudget.data;

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id, type")
    .eq("id", categoryId)
    .eq("user_id", userId)
    .eq("is_archived", false)
    .maybeSingle();

  if (categoryError || !category || category.type !== "expense") {
    return {
      error: "The selected expense category is unavailable.",
    };
  }

  const { startDate, endDate } = getMonthRange(month);

  const { error } = await supabase.from("budgets").upsert(
    {
      user_id: userId,
      category_id: categoryId,
      amount,
      period: "monthly",
      start_date: startDate,
      end_date: endDate,
    },
    {
      onConflict: "user_id,category_id,period,start_date",
    },
  );

  if (error) {
    console.error("Budget save failed:", error);

    return {
      error: "We couldn’t save the budget. Please try again.",
    };
  }

  revalidatePath("/");
  revalidatePath("/budgets");

  redirect(`/budgets?month=${month}&saved=true`);
}

export async function deleteBudget(
  budgetId: string,
  month: string,
) {
  const idResult = z.string().uuid().safeParse(budgetId);
  const monthResult = z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .safeParse(month);

  if (!idResult.success || !monthResult.success) {
    redirect("/budgets?error=invalid-budget");
  }

  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub;

  if (claimsError || typeof userId !== "string") {
    redirect("/login");
  }

  const { error } = await supabase
    .from("budgets")
    .delete()
    .eq("id", budgetId)
    .eq("user_id", userId);

  if (error) {
    console.error("Budget deletion failed:", error);
    redirect(`/budgets?month=${month}&error=delete-failed`);
  }

  revalidatePath("/");
  revalidatePath("/budgets");

  redirect(`/budgets?month=${month}&deleted=true`);
}