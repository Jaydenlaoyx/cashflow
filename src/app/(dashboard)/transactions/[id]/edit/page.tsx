import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { TransactionForm } from "@/components/transactions/transaction-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Edit transaction",
};

type EditTransactionPageProps = {
  params: Promise<{
    id: string;
  }>;
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

export default async function EditTransactionPage({
  params,
}: EditTransactionPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub;

  if (claimsError || typeof userId !== "string") {
    redirect("/login");
  }

  const [
    { data: transaction, error: transactionError },
    { data: accounts, error: accountsError },
    { data: categories, error: categoriesError },
  ] = await Promise.all([
    supabase
      .from("transactions")
      .select(
        `
          id,
          type,
          amount,
          description,
          merchant,
          transaction_date,
          account_id,
          category_id,
          notes
        `,
      )
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle(),

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

  if (transactionError) {
    console.error("Transaction query failed:", transactionError);
  }

  if (!transaction) {
    notFound();
  }

  if (accountsError || categoriesError) {
    throw new Error("Unable to load transaction options.");
  }

  return (
    <section className="mx-auto max-w-3xl">
      <div className="mb-6">
        <p className="text-sm font-medium text-emerald-700">
          Transaction management
        </p>

        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
          Edit transaction
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Update the details of this financial record.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <TransactionForm
          accounts={accounts ?? []}
          categories={categories ?? []}
          today={getMelbourneDate()}
          transaction={{
            id: transaction.id,
            type: transaction.type,
            amount: Number(transaction.amount),
            description: transaction.description,
            merchant: transaction.merchant,
            transactionDate: transaction.transaction_date,
            accountId: transaction.account_id,
            categoryId: transaction.category_id,
            notes: transaction.notes,
          }}
        />
      </div>
    </section>
  );
}