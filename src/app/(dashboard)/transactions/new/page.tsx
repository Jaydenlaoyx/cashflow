import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { TransactionForm } from "@/components/transactions/transaction-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Add transaction",
};

function getMelbourneDate() {
  const parts = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Melbourne",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

export default async function NewTransactionPage() {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub;

  if (claimsError || typeof userId !== "string") {
    redirect("/login");
  }

  const [
    { data: accounts, error: accountsError },
    { data: categories, error: categoriesError },
  ] = await Promise.all([
    supabase
      .from("accounts")
      .select("id, name")
      .eq("user_id", userId)
      .eq("is_archived", false)
      .order("name"),

    supabase
      .from("categories")
      .select("id, name, type, color")
      .eq("user_id", userId)
      .eq("is_archived", false)
      .order("name"),
  ]);

  if (accountsError) {
    console.error("Accounts query failed:", {
        message: accountsError.message,
        details: accountsError.details,
        hint: accountsError.hint,
        code: accountsError.code,
    });
    }

    if (categoriesError) {
    console.error("Categories query failed:", {
        message: categoriesError.message,
        details: categoriesError.details,
        hint: categoriesError.hint,
        code: categoriesError.code,
    });
    }

    if (accountsError || categoriesError) {
    throw new Error(
        accountsError?.message ??
        categoriesError?.message ??
        "Unable to load transaction options.",
    );
    }

  return (
    <section className="mx-auto max-w-3xl">
      <div className="mb-6">
        <p className="text-sm font-medium text-emerald-700">
          Money movement
        </p>

        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
          Add transaction
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Record income or spending against one of your accounts.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <TransactionForm
          accounts={accounts ?? []}
          categories={categories ?? []}
          today={getMelbourneDate()}
        />
      </div>
    </section>
  );
}