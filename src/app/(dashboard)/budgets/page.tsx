import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  WalletCards,
} from "lucide-react";
import { redirect } from "next/navigation";

import { BudgetForm } from "@/components/budgets/budget-form";
import { DeleteBudgetButton } from "@/components/budgets/delete-budget-button";
import { formatCurrency } from "@/lib/finance/format";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Budgets",
};

type BudgetsPageProps = {
  searchParams: Promise<{
    month?: string;
    saved?: string;
    deleted?: string;
    error?: string;
  }>;
};

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

function getCurrentMelbourneMonth() {
  const parts = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Melbourne",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;

  return `${year}-${month}`;
}

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

function moveMonth(month: string, offset: number) {
  const [year, monthNumber] = month.split("-").map(Number);

  const date = new Date(
    Date.UTC(year, monthNumber - 1 + offset, 1),
  );

  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
  ].join("-");
}

function getMonthLabel(month: string) {
  return new Intl.DateTimeFormat("en-AU", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${month}-01T00:00:00Z`));
}

export default async function BudgetsPage({
  searchParams,
}: BudgetsPageProps) {
  const params = await searchParams;

  const month =
    params.month && MONTH_PATTERN.test(params.month)
      ? params.month
      : getCurrentMelbourneMonth();

  const { startDate, endDate } = getMonthRange(month);

  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub;

  if (claimsError || typeof userId !== "string") {
    redirect("/login");
  }

  const [
    { data: progress, error: progressError },
    { data: categories, error: categoriesError },
    { data: profile, error: profileError },
  ] = await Promise.all([
    supabase.rpc("get_budget_progress", {
      p_month_start: startDate,
      p_month_end: endDate,
    }),

    supabase
      .from("categories")
      .select("id, name, color")
      .eq("user_id", userId)
      .eq("type", "expense")
      .eq("is_archived", false)
      .order("name"),

    supabase
      .from("profiles")
      .select("currency_code")
      .eq("id", userId)
      .single(),
  ]);

  if (progressError || categoriesError) {
    console.error("Budget page query failed:", {
      progressError,
      categoriesError,
    });

    throw new Error("Unable to load budgets.");
  }

  if (profileError) {
    console.error("Profile query failed:", profileError);
  }

  const currencyCode = profile?.currency_code ?? "AUD";

  const budgetRows = (progress ?? []).map((budget) => ({
    id: budget.budget_id,
    categoryId: budget.category_id,
    categoryName: budget.category_name,
    categoryColor: budget.category_color,
    budgetAmount: Number(budget.budget_amount),
    spentAmount: Number(budget.spent_amount),
    remainingAmount: Number(budget.remaining_amount),
    percentageUsed: Number(budget.percentage_used),
  }));

  const totalBudget = budgetRows.reduce(
    (total, budget) => total + budget.budgetAmount,
    0,
  );

  const totalSpent = budgetRows.reduce(
    (total, budget) => total + budget.spentAmount,
    0,
  );

  const totalRemaining = totalBudget - totalSpent;
  const monthLabel = getMonthLabel(month);

  return (
    <section>
      {params.saved === "true" ? (
        <div
          role="status"
          className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          Budget saved successfully.
        </div>
      ) : null}

      {params.deleted === "true" ? (
        <div
          role="status"
          className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          Budget removed successfully.
        </div>
      ) : null}

      {params.error ? (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          The budget operation could not be completed.
        </div>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-700">
            Spending plan
          </p>

          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
            Monthly budgets
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Set limits and monitor category spending.
          </p>
        </div>

        <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <Link
            href={`/budgets?month=${moveMonth(month, -1)}`}
            aria-label="Previous month"
            className="flex size-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
          >
            <ChevronLeft aria-hidden="true" className="size-4" />
          </Link>

          <span className="min-w-40 px-3 text-center text-sm font-semibold text-slate-800">
            {monthLabel}
          </span>

          <Link
            href={`/budgets?month=${moveMonth(month, 1)}`}
            aria-label="Next month"
            className="flex size-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
          >
            <ChevronRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total budget</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">
            {formatCurrency(totalBudget, currencyCode)}
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Spent</p>
          <p className="mt-2 text-2xl font-bold text-rose-700">
            {formatCurrency(totalSpent, currencyCode)}
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            {totalRemaining >= 0 ? "Remaining" : "Over budget"}
          </p>
          <p
            className={`mt-2 text-2xl font-bold ${
              totalRemaining >= 0
                ? "text-emerald-700"
                : "text-rose-700"
            }`}
          >
            {formatCurrency(
              Math.abs(totalRemaining),
              currencyCode,
            )}
          </p>
        </article>
      </div>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <WalletCards
                aria-hidden="true"
                className="size-5"
              />
            </div>

            <div>
              <h3 className="font-semibold text-slate-950">
                Set a budget
              </h3>
              <p className="text-xs text-slate-500">
                For {monthLabel}
              </p>
            </div>
          </div>

          <BudgetForm
            categories={categories ?? []}
            month={month}
          />
        </aside>

        <div>
          {budgetRows.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <CircleDollarSign
                  aria-hidden="true"
                  className="size-7"
                />
              </div>

              <h3 className="mt-5 font-semibold text-slate-950">
                No budgets for {monthLabel}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Select an expense category and set a monthly
                spending limit.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {budgetRows.map((budget) => {
                const overspent = budget.remainingAmount < 0;
                const warning =
                  !overspent && budget.percentageUsed >= 80;

                const progressWidth = Math.min(
                  Math.max(budget.percentageUsed, 0),
                  100,
                );

                return (
                  <article
                    key={budget.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          aria-hidden="true"
                          className="size-3 shrink-0 rounded-full"
                          style={{
                            backgroundColor:
                              budget.categoryColor,
                          }}
                        />

                        <div className="min-w-0">
                          <h3 className="truncate font-semibold text-slate-950">
                            {budget.categoryName}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            {formatCurrency(
                              budget.spentAmount,
                              currencyCode,
                            )}{" "}
                            of{" "}
                            {formatCurrency(
                              budget.budgetAmount,
                              currencyCode,
                            )}
                          </p>
                        </div>
                      </div>

                      <DeleteBudgetButton
                        budgetId={budget.id}
                        categoryName={budget.categoryName}
                        month={month}
                      />
                    </div>

                    <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all ${
                          overspent
                            ? "bg-rose-500"
                            : warning
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                        }`}
                        style={{
                          width: `${progressWidth}%`,
                        }}
                      />
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-4">
                      <p
                        className={`text-sm font-medium ${
                          overspent
                            ? "text-rose-700"
                            : warning
                              ? "text-amber-700"
                              : "text-slate-600"
                        }`}
                      >
                        {overspent
                          ? `${formatCurrency(
                              Math.abs(
                                budget.remainingAmount,
                              ),
                              currencyCode,
                            )} over budget`
                          : `${formatCurrency(
                              budget.remainingAmount,
                              currencyCode,
                            )} remaining`}
                      </p>

                      <span className="flex items-center gap-1 text-xs font-semibold text-slate-500">
                        {overspent || warning ? (
                          <AlertTriangle
                            aria-hidden="true"
                            className="size-3.5"
                          />
                        ) : null}

                        {budget.percentageUsed.toFixed(1)}%
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}