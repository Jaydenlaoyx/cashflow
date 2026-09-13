import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  ReceiptText,
  Target,
  WalletCards,
} from "lucide-react";

import {
  formatCurrency,
  formatTransactionDate,
} from "@/lib/finance/format";

type BudgetOverviewItem = {
  id: string;
  name: string;
  color: string;
  spent: number;
  limit: number;
  percentage: number;
};

type GoalOverviewItem = {
  id: string;
  name: string;
  color: string;
  current: number;
  target: number;
  percentage: number;
};

type RecentTransaction = {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  transactionDate: string;
  categoryName: string;
  categoryColor: string;
};

type BudgetOverviewProps = {
  budgets: BudgetOverviewItem[];
  currencyCode: string;
};

type GoalOverviewProps = {
  goals: GoalOverviewItem[];
  currencyCode: string;
};

type RecentTransactionsProps = {
  transactions: RecentTransaction[];
  currencyCode: string;
};

function SectionLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
    >
      {children}
      <ArrowRight aria-hidden="true" className="size-4" />
    </Link>
  );
}

export function DashboardBudgetOverview({
  budgets,
  currencyCode,
}: BudgetOverviewProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold text-slate-950">
            Budget progress
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Monthly category limits
          </p>
        </div>

        <SectionLink href="/budgets">View all</SectionLink>
      </div>

      {budgets.length === 0 ? (
        <div className="mt-6 flex min-h-48 flex-col items-center justify-center rounded-xl bg-slate-50 px-5 text-center">
          <WalletCards className="size-8 text-slate-400" />

          <p className="mt-3 text-sm font-semibold text-slate-700">
            No budgets this month
          </p>

          <Link
            href="/budgets"
            className="mt-3 text-sm font-semibold text-emerald-700"
          >
            Set your first budget
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {budgets.slice(0, 4).map((budget) => {
            const overspent = budget.spent > budget.limit;
            const warning =
              !overspent && budget.percentage >= 80;

            return (
              <div key={budget.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor: budget.color,
                      }}
                    />

                    <p className="truncate text-sm font-medium text-slate-700">
                      {budget.name}
                    </p>
                  </div>

                  <p className="shrink-0 text-xs text-slate-500">
                    {formatCurrency(
                      budget.spent,
                      currencyCode,
                    )}{" "}
                    /{" "}
                    {formatCurrency(
                      budget.limit,
                      currencyCode,
                    )}
                  </p>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${
                      overspent
                        ? "bg-rose-500"
                        : warning
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                    }`}
                    style={{
                      width: `${Math.min(
                        Math.max(budget.percentage, 0),
                        100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}

export function DashboardGoalsOverview({
  goals,
  currencyCode,
}: GoalOverviewProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold text-slate-950">
            Savings goals
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Progress toward your targets
          </p>
        </div>

        <SectionLink href="/goals">View all</SectionLink>
      </div>

      {goals.length === 0 ? (
        <div className="mt-6 flex min-h-48 flex-col items-center justify-center rounded-xl bg-slate-50 px-5 text-center">
          <Target className="size-8 text-slate-400" />

          <p className="mt-3 text-sm font-semibold text-slate-700">
            No savings goals yet
          </p>

          <Link
            href="/goals"
            className="mt-3 text-sm font-semibold text-emerald-700"
          >
            Create your first goal
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {goals.slice(0, 4).map((goal) => (
            <div key={goal.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor: goal.color,
                    }}
                  />

                  <p className="truncate text-sm font-medium text-slate-700">
                    {goal.name}
                  </p>
                </div>

                <p className="shrink-0 text-xs text-slate-500">
                  {formatCurrency(goal.current, currencyCode)} /{" "}
                  {formatCurrency(goal.target, currencyCode)}
                </p>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(
                      Math.max(goal.percentage, 0),
                      100,
                    )}%`,
                    backgroundColor: goal.color,
                  }}
                />
              </div>

              <p className="mt-1.5 text-right text-xs font-medium text-slate-500">
                {goal.percentage.toFixed(1)}%
              </p>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

export function DashboardRecentTransactions({
  transactions,
  currencyCode,
}: RecentTransactionsProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold text-slate-950">
            Recent transactions
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your latest financial activity
          </p>
        </div>

        <SectionLink href="/transactions">
          View all
        </SectionLink>
      </div>

      {transactions.length === 0 ? (
        <div className="mt-6 flex min-h-48 flex-col items-center justify-center rounded-xl bg-slate-50 px-5 text-center">
          <ReceiptText className="size-8 text-slate-400" />

          <p className="mt-3 text-sm font-semibold text-slate-700">
            No transactions yet
          </p>

          <Link
            href="/transactions/new"
            className="mt-3 text-sm font-semibold text-emerald-700"
          >
            Add your first transaction
          </Link>
        </div>
      ) : (
        <div className="mt-5 divide-y divide-slate-100">
          {transactions.map((transaction) => {
            const income = transaction.type === "income";

            return (
              <div
                key={transaction.id}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                    income
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {income ? (
                    <ArrowUpRight className="size-5" />
                  ) : (
                    <ArrowDownRight className="size-5" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {transaction.description}
                  </p>

                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                    <span
                      className="size-2 rounded-full"
                      style={{
                        backgroundColor:
                          transaction.categoryColor,
                      }}
                    />
                    {transaction.categoryName}
                    <span>·</span>
                    {formatTransactionDate(
                      transaction.transactionDate,
                    )}
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
                    transaction.amount,
                    currencyCode,
                  )}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}