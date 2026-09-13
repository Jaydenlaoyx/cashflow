import {
  ArrowDownRight,
  ArrowUpRight,
  ReceiptText,
} from "lucide-react";

import {
  formatCurrency,
  formatTransactionDate,
} from "@/lib/finance/format";

export type TransactionListItem = {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  merchant: string | null;
  transaction_date: string;
  account: {
    name: string;
  } | null;
  category: {
    name: string;
    color: string;
  } | null;
};

type TransactionListProps = {
  transactions: TransactionListItem[];
  currencyCode: string;
  hasFilters: boolean;
};

function TransactionIcon({
  type,
}: {
  type: "income" | "expense";
}) {
  if (type === "income") {
    return (
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
        <ArrowUpRight aria-hidden="true" className="size-5" />
      </span>
    );
  }

  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
      <ArrowDownRight aria-hidden="true" className="size-5" />
    </span>
  );
}

export function TransactionList({
  transactions,
  currencyCode,
  hasFilters,
}: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
          <ReceiptText aria-hidden="true" className="size-7" />
        </div>

        <h3 className="mt-5 font-semibold text-slate-950">
          {hasFilters
            ? "No matching transactions"
            : "No transactions yet"}
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          {hasFilters
            ? "Try changing or clearing the current search filters."
            : "Add your first income or expense to begin tracking your cash flow."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
        <table className="w-full border-collapse text-left">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Transaction
              </th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Category
              </th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Account
              </th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Date
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Amount
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {transactions.map((transaction) => {
              const income = transaction.type === "income";

              return (
                <tr
                  key={transaction.id}
                  className="transition hover:bg-slate-50"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <TransactionIcon type={transaction.type} />

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {transaction.description}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {transaction.merchant || "No merchant"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-2 text-sm text-slate-700">
                      <span
                        aria-hidden="true"
                        className="size-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            transaction.category?.color ?? "#64748B",
                        }}
                      />

                      {transaction.category?.name ?? "Uncategorised"}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {transaction.account?.name ?? "Unknown account"}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                    {formatTransactionDate(
                      transaction.transaction_date,
                    )}
                  </td>

                  <td
                    className={`whitespace-nowrap px-5 py-4 text-right text-sm font-bold ${
                      income ? "text-emerald-700" : "text-slate-950"
                    }`}
                  >
                    {income ? "+" : "−"}
                    {formatCurrency(
                      Number(transaction.amount),
                      currencyCode,
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {transactions.map((transaction) => {
          const income = transaction.type === "income";

          return (
            <article
              key={transaction.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <TransactionIcon type={transaction.type} />

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-slate-900">
                        {transaction.description}
                      </h3>

                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {transaction.merchant || "No merchant"}
                      </p>
                    </div>

                    <p
                      className={`shrink-0 text-sm font-bold ${
                        income
                          ? "text-emerald-700"
                          : "text-slate-950"
                      }`}
                    >
                      {income ? "+" : "−"}
                      {formatCurrency(
                        Number(transaction.amount),
                        currencyCode,
                      )}
                    </p>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        aria-hidden="true"
                        className="size-2 rounded-full"
                        style={{
                          backgroundColor:
                            transaction.category?.color ?? "#64748B",
                        }}
                      />
                      {transaction.category?.name ?? "Uncategorised"}
                    </span>

                    <span>{transaction.account?.name}</span>

                    <span>
                      {formatTransactionDate(
                        transaction.transaction_date,
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}