"use server";

import { revalidatePath } from "next/cache";

import type {
  ImportTransactionInput,
  ImportTransactionsResult,
} from "@/lib/transactions/import-types";
import { createClient } from "@/lib/supabase/server";

const MAX_IMPORT_ROWS = 1000;

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

function normaliseName(value: string) {
  return value.trim().toLocaleLowerCase();
}

export async function importTransactions(
  rows: ImportTransactionInput[],
): Promise<ImportTransactionsResult> {
  if (!Array.isArray(rows) || rows.length === 0) {
    return {
      success: false,
      message: "There are no transactions to import.",
    };
  }

  if (rows.length > MAX_IMPORT_ROWS) {
    return {
      success: false,
      message: `A maximum of ${MAX_IMPORT_ROWS} transactions can be imported at once.`,
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      message: "You must be signed in to import transactions.",
    };
  }

  const invalidRowIndex = rows.findIndex((row) => {
    const amount = Number(row.amount);
    const type = row.type.trim().toLowerCase();

    return (
      !isValidDate(row.date.trim()) ||
      (type !== "income" && type !== "expense") ||
      !row.description.trim() ||
      !row.category.trim() ||
      !row.account.trim() ||
      !Number.isFinite(amount) ||
      amount <= 0
    );
  });

  if (invalidRowIndex !== -1) {
    return {
      success: false,
      message: `Row ${invalidRowIndex + 2} contains invalid transaction data.`,
    };
  }

  const [
    { data: accounts, error: accountsError },
    { data: categories, error: categoriesError },
  ] = await Promise.all([
    supabase
      .from("accounts")
      .select("id, name")
      .eq("is_archived", false),
    supabase
      .from("categories")
      .select("id, name, type")
      .eq("is_archived", false),
  ]);

  if (accountsError || categoriesError) {
    console.error("Unable to load CSV import options:", {
      accountsError,
      categoriesError,
    });

    return {
      success: false,
      message: "Unable to validate accounts and categories.",
    };
  }

  const accountMap = new Map(
    (accounts ?? []).map((account) => [
      normaliseName(account.name),
      account.id,
    ]),
  );

  const categoryMap = new Map(
    (categories ?? []).map((category) => [
      `${category.type}:${normaliseName(category.name)}`,
      category.id,
    ]),
  );

  const transactions = [];

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    const type = row.type.trim().toLowerCase() as "income" | "expense";

    const accountId = accountMap.get(normaliseName(row.account));
    const categoryId = categoryMap.get(
      `${type}:${normaliseName(row.category)}`,
    );

    if (!accountId) {
      return {
        success: false,
        message: `Row ${index + 2}: account "${row.account}" was not found or is archived.`,
      };
    }

    if (!categoryId) {
      return {
        success: false,
        message: `Row ${index + 2}: ${type} category "${row.category}" was not found or is archived.`,
      };
    }

    transactions.push({
      user_id: user.id,
      account_id: accountId,
      category_id: categoryId,
      type,
      amount: Number(row.amount),
      description: row.description.trim(),
      transaction_date: row.date.trim(),
      notes: row.notes.trim() || null,
    });
  }

  const { error: insertError } = await supabase
    .from("transactions")
    .insert(transactions);

  if (insertError) {
    console.error("Unable to import transactions:", insertError);

    return {
      success: false,
      message: "The transactions could not be imported.",
    };
  }

  revalidatePath("/");
  revalidatePath("/analytics");
  revalidatePath("/budgets");
  revalidatePath("/transactions");

  return {
    success: true,
    message: `${transactions.length} transactions imported successfully.`,
    importedCount: transactions.length,
  };
}