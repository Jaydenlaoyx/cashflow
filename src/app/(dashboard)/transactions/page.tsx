import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { redirect } from "next/navigation";

import { TransactionFilters } from "@/components/transactions/transaction-filters";
import {
  TransactionList,
  type TransactionListItem,
} from "@/components/transactions/transaction-list";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Transactions",
};

const PAGE_SIZE = 10;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

type TransactionsPageProps = {
  searchParams: Promise<{
    created?: string;
    search?: string;
    type?: string;
    from?: string;
    to?: string;
    page?: string;
  }>;
};

function getPageNumber(value?: string) {
  const parsedPage = Number.parseInt(value ?? "1", 10);

  return Number.isFinite(parsedPage) && parsedPage > 0
    ? parsedPage
    : 1;
}

function cleanSearch(value?: string) {
  return (value ?? "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .slice(0, 100);
}

function cleanDate(value?: string) {
  return value && DATE_PATTERN.test(value) ? value : "";
}

function createPageUrl(
  page: number,
  filters: {
    search: string;
    type: string;
    from: string;
    to: string;
  },
) {
  const params = new URLSearchParams();

  if (filters.search) {
    params.set("search", filters.search);
  }

  if (filters.type) {
    params.set("type", filters.type);
  }

  if (filters.from) {
    params.set("from", filters.from);
  }

  if (filters.to) {
    params.set("to", filters.to);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();

  return query ? `/transactions?${query}` : "/transactions";
}

export default async function TransactionsPage({
  searchParams,
}: TransactionsPageProps) {
  const params = await searchParams;

  const page = getPageNumber(params.page);
  const search = cleanSearch(params.search);
  const type =
    params.type === "income" || params.type === "expense"
      ? params.type
      : "";
  const from = cleanDate(params.from);
  const to = cleanDate(params.to);

  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub;

  if (claimsError || typeof userId !== "string") {
    redirect("/login");
  }

  const fromRow = (page - 1) * PAGE_SIZE;
  const toRow = fromRow + PAGE_SIZE - 1;

  let transactionsQuery = supabase
    .from("transactions")
    .select(
      `
        id,
        type,
        amount,
        description,
        merchant,
        transaction_date,
        account:accounts!transactions_account_owner_fk (
          name
        ),
        category:categories!transactions_category_owner_fk (
          name,
          color
        )
      `,
      {
        count: "exact",
      },
    )
    .eq("user_id", userId)
    .order("transaction_date", {
      ascending: false,
    })
    .order("created_at", {
      ascending: false,
    });

  if (type) {
    transactionsQuery = transactionsQuery.eq("type", type);
  }

  if (from) {
    transactionsQuery = transactionsQuery.gte(
      "transaction_date",
      from,
    );
  }

  if (to) {
    transactionsQuery = transactionsQuery.lte(
      "transaction_date",
      to,
    );
  }

  if (search) {
    transactionsQuery = transactionsQuery.or(
      `description.ilike.%${search}%,merchant.ilike.%${search}%`,
    );
  }

  const [
    {
      data: transactions,
      error: transactionsError,
      count,
    },
    { data: profile, error: profileError },
  ] = await Promise.all([
    transactionsQuery.range(fromRow, toRow),

    supabase
      .from("profiles")
      .select("currency_code")
      .eq("id", userId)
      .single(),
  ]);

  if (transactionsError) {
    console.error("Transactions query failed:", transactionsError);
    throw new Error("Unable to load transactions.");
  }

  if (profileError) {
    console.error("Profile query failed:", profileError);
  }

  const totalTransactions = count ?? 0;
  const totalPages = Math.max(
    1,
    Math.ceil(totalTransactions / PAGE_SIZE),
  );

  const filters = {
    search,
    type,
    from,
    to,
  };

  const hasFilters = Boolean(search || type || from || to);

  return (
    <section>
      {params.created === "true" ? (
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
            {totalTransactions === 1
              ? "1 transaction found"
              : `${totalTransactions} transactions found`}
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

      <div className="mt-6">
        <TransactionFilters
          search={search}
          type={type}
          from={from}
          to={to}
        />
      </div>

      <div className="mt-6">
        <TransactionList
          transactions={
            (transactions ?? []) as TransactionListItem[]
          }
          currencyCode={profile?.currency_code ?? "AUD"}
          hasFilters={hasFilters}
        />
      </div>

      {totalTransactions > 0 ? (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Page {page} of {totalPages}
          </p>

          <div className="flex gap-2">
            {page > 1 ? (
              <Link
                href={createPageUrl(page - 1, filters)}
                className="flex h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <ChevronLeft
                  aria-hidden="true"
                  className="size-4"
                />
                Previous
              </Link>
            ) : (
              <span className="flex h-10 cursor-not-allowed items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 text-sm font-semibold text-slate-400">
                <ChevronLeft
                  aria-hidden="true"
                  className="size-4"
                />
                Previous
              </span>
            )}

            {page < totalPages ? (
              <Link
                href={createPageUrl(page + 1, filters)}
                className="flex h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Next
                <ChevronRight
                  aria-hidden="true"
                  className="size-4"
                />
              </Link>
            ) : (
              <span className="flex h-10 cursor-not-allowed items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 text-sm font-semibold text-slate-400">
                Next
                <ChevronRight
                  aria-hidden="true"
                  className="size-4"
                />
              </span>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}