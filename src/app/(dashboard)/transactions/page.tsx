import type { Metadata } from "next";
import Link from "next/link";
import { Plus, ReceiptText } from "lucide-react";

export const metadata: Metadata = {
  title: "Transactions",
};

type TransactionsPageProps = {
  searchParams: Promise<{
    created?: string;
  }>;
};

export default async function TransactionsPage({
  searchParams,
}: TransactionsPageProps) {
  const { created } = await searchParams;

  return (
    <section>
      {created === "true" ? (
        <div
          role="status"
          className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          Transaction saved successfully.
        </div>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-700">
            Financial activity
          </p>

          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
            All transactions
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Review your income and expenses in one place.
          </p>
        </div>

        <Link
          href="/transactions/new"
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          <Plus aria-hidden="true" className="size-4" />
          Add transaction
        </Link>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
          <ReceiptText aria-hidden="true" className="size-7" />
        </div>

        <h3 className="mt-5 font-semibold text-slate-950">
          Transaction list coming next
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          Your saved records are now in Supabase. The next checkpoint will
          display them here with search and filtering.
        </p>
      </div>
    </section>
  );
}