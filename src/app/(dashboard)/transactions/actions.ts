"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  accountId: z.string().uuid("Select a valid account."),
  categoryId: z.string().uuid("Select a valid category."),
  amount: z.coerce
    .number()
    .positive("Amount must be greater than zero.")
    .max(999999999999.99, "Amount is too large."),
  description: z
    .string()
    .trim()
    .min(1, "Description is required.")
    .max(150, "Description cannot exceed 150 characters."),
  merchant: z
    .string()
    .trim()
    .max(100, "Merchant cannot exceed 100 characters."),
  transactionDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Select a valid date."),
  notes: z
    .string()
    .trim()
    .max(1000, "Notes cannot exceed 1000 characters."),
});

export type TransactionActionState = {
  error?: string;
  fieldErrors?: Partial<
    Record<
      | "type"
      | "accountId"
      | "categoryId"
      | "amount"
      | "description"
      | "merchant"
      | "transactionDate"
      | "notes",
      string[]
    >
  >;
};

export async function createTransaction(
  _previousState: TransactionActionState,
  formData: FormData,
): Promise<TransactionActionState> {
  const parsedTransaction = transactionSchema.safeParse({
    type: formData.get("type"),
    accountId: formData.get("accountId"),
    categoryId: formData.get("categoryId"),
    amount: formData.get("amount"),
    description: formData.get("description"),
    merchant: formData.get("merchant") ?? "",
    transactionDate: formData.get("transactionDate"),
    notes: formData.get("notes") ?? "",
  });

  if (!parsedTransaction.success) {
    return {
      error: "Please correct the highlighted fields.",
      fieldErrors: parsedTransaction.error.flatten().fieldErrors,
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

  const transaction = parsedTransaction.data;

  const [
    { data: account, error: accountError },
    { data: category, error: categoryError },
  ] = await Promise.all([
    supabase
      .from("accounts")
      .select("id")
      .eq("id", transaction.accountId)
      .eq("user_id", userId)
      .eq("is_archived", false)
      .maybeSingle(),

    supabase
      .from("categories")
      .select("id, type")
      .eq("id", transaction.categoryId)
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  if (accountError || !account) {
    return {
      error: "The selected account is unavailable.",
    };
  }

  if (categoryError || !category) {
    return {
      error: "The selected category is unavailable.",
    };
  }

  if (category.type !== transaction.type) {
    return {
      error: "The selected category does not match the transaction type.",
    };
  }

  const { error: insertError } = await supabase
    .from("transactions")
    .insert({
      user_id: userId,
      account_id: transaction.accountId,
      category_id: transaction.categoryId,
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      merchant: transaction.merchant || null,
      transaction_date: transaction.transactionDate,
      notes: transaction.notes || null,
    });

  if (insertError) {
    console.error("Transaction insert failed:", insertError.message);

    return {
      error: "We couldn’t save the transaction. Please try again.",
    };
  }

  revalidatePath("/");
  revalidatePath("/transactions");

  redirect("/transactions?created=true");
}