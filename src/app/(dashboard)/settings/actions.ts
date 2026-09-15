"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const currencySchema = z.enum([
  "AUD",
  "USD",
  "NZD",
  "GBP",
  "EUR",
  "CAD",
  "JPY",
  "MYR",
  "SGD",
  "CNY",
]);

const accountSchema = z.object({
  name: z.string().trim().min(1).max(80),
  type: z.enum([
    "cash",
    "checking",
    "savings",
    "credit",
    "investment",
    "other",
  ]),
  startingBalance: z.coerce
    .number()
    .min(-999999999999.99)
    .max(999999999999.99),
  includeInTotal: z.boolean(),
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

export async function updateCurrency(formData: FormData) {
  const result = currencySchema.safeParse(
    formData.get("currencyCode"),
  );

  if (!result.success) {
    redirect("/settings?error=invalid-currency");
  }

  const { supabase, userId } =
    await getAuthenticatedUser();

  const { error } = await supabase
    .from("profiles")
    .update({
      currency_code: result.data,
    })
    .eq("id", userId);

  if (error) {
    console.error("Currency update failed:", error);
    redirect("/settings?error=currency-update-failed");
  }

  revalidatePath("/", "layout");

  redirect("/settings?currencyUpdated=true");
}

export async function createAccount(formData: FormData) {
  const result = accountSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    startingBalance: formData.get("startingBalance"),
    includeInTotal:
      formData.get("includeInTotal") === "on",
  });

  if (!result.success) {
    redirect("/settings?error=invalid-account");
  }

  const { supabase, userId } =
    await getAuthenticatedUser();

  const account = result.data;

  const { error } = await supabase
    .from("accounts")
    .insert({
      user_id: userId,
      name: account.name,
      type: account.type,
      starting_balance: account.startingBalance,
      include_in_total: account.includeInTotal,
      is_archived: false,
    });

  if (error) {
    console.error("Account creation failed:", error);
    redirect("/settings?error=account-create-failed");
  }

  revalidatePath("/", "layout");

  redirect("/settings?accountCreated=true");
}

export async function setAccountIncluded(
  accountId: string,
  included: boolean,
) {
  if (!z.string().uuid().safeParse(accountId).success) {
    redirect("/settings?error=invalid-account");
  }

  const { supabase, userId } =
    await getAuthenticatedUser();

  const { error } = await supabase
    .from("accounts")
    .update({
      include_in_total: included,
    })
    .eq("id", accountId)
    .eq("user_id", userId);

  if (error) {
    console.error("Account inclusion update failed:", error);
    redirect("/settings?error=account-update-failed");
  }

  revalidatePath("/", "layout");

  redirect("/settings?accountUpdated=true");
}

export async function setAccountArchived(
  accountId: string,
  archived: boolean,
) {
  if (!z.string().uuid().safeParse(accountId).success) {
    redirect("/settings?error=invalid-account");
  }

  const { supabase, userId } =
    await getAuthenticatedUser();

  if (archived) {
    const { count, error: countError } = await supabase
      .from("accounts")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("user_id", userId)
      .eq("is_archived", false);

    if (countError) {
      console.error("Active account count failed:", countError);
      redirect("/settings?error=account-update-failed");
    }

    if ((count ?? 0) <= 1) {
      redirect("/settings?error=last-active-account");
    }
  }

  const { error } = await supabase
    .from("accounts")
    .update({
      is_archived: archived,
    })
    .eq("id", accountId)
    .eq("user_id", userId);

  if (error) {
    console.error("Account archive update failed:", error);
    redirect("/settings?error=account-update-failed");
  }

  revalidatePath("/", "layout");

  redirect(
    archived
      ? "/settings?accountArchived=true"
      : "/settings?accountRestored=true",
  );
}

export async function createCategory(formData: FormData) {
  const result = z
    .object({
      name: z.string().trim().min(1).max(50),
      type: z.enum(["income", "expense"]),
      color: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/),
    })
    .safeParse({
      name: formData.get("name"),
      type: formData.get("type"),
      color: formData.get("color"),
    });

  if (!result.success) {
    redirect("/settings?error=invalid-category");
  }

  const { supabase, userId } =
    await getAuthenticatedUser();

  const { error } = await supabase
    .from("categories")
    .insert({
      user_id: userId,
      name: result.data.name,
      type: result.data.type,
      color: result.data.color,
      icon: "circle",
      is_default: false,
      is_archived: false,
    });

  if (error) {
    if (error.code === "23505") {
      redirect("/settings?error=duplicate-category");
    }

    console.error("Category creation failed:", error);
    redirect("/settings?error=category-create-failed");
  }

  revalidatePath("/", "layout");

  redirect("/settings?categoryCreated=true");
}

export async function setCategoryArchived(
  categoryId: string,
  archived: boolean,
) {
  if (!z.string().uuid().safeParse(categoryId).success) {
    redirect("/settings?error=invalid-category");
  }

  const { supabase, userId } =
    await getAuthenticatedUser();

  const { data: category, error: categoryError } =
    await supabase
      .from("categories")
      .select("id, type")
      .eq("id", categoryId)
      .eq("user_id", userId)
      .maybeSingle();

  if (categoryError || !category) {
    redirect("/settings?error=invalid-category");
  }

  if (archived) {
    const [
      { count: activeCategoryCount, error: countError },
      { count: recurringCount, error: recurringError },
    ] = await Promise.all([
      supabase
        .from("categories")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("user_id", userId)
        .eq("type", category.type)
        .eq("is_archived", false),

      supabase
        .from("recurring_transactions")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("user_id", userId)
        .eq("category_id", categoryId)
        .eq("is_active", true),
    ]);

    if (countError || recurringError) {
      redirect("/settings?error=category-update-failed");
    }

    if ((activeCategoryCount ?? 0) <= 1) {
      redirect("/settings?error=last-active-category");
    }

    if ((recurringCount ?? 0) > 0) {
      redirect("/settings?error=category-in-recurring-use");
    }
  }

  const { error } = await supabase
    .from("categories")
    .update({
      is_archived: archived,
    })
    .eq("id", categoryId)
    .eq("user_id", userId);

  if (error) {
    console.error("Category archive update failed:", error);
    redirect("/settings?error=category-update-failed");
  }

  revalidatePath("/", "layout");

  redirect(
    archived
      ? "/settings?categoryArchived=true"
      : "/settings?categoryRestored=true",
  );
}