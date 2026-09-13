import {
  ArrowDownRight,
  ArrowUpRight,
  Landmark,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { redirect } from "next/navigation";

import { CashFlowChart } from "@/components/dashboard/cash-flow-chart";
import { CategorySpendingChart } from "@/components/dashboard/category-spending-chart";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { formatCurrency } from "@/lib/finance/format";
import { createClient } from "@/lib/supabase/server";

function getMelbourneDateParts() {
  const parts = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Melbourne",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  return {
    year: Number(
      parts.find((part) => part.type === "year")?.value,
    ),
    month: Number(
      parts.find((part) => part.type === "month")?.value,
    ),
    day: Number(
      parts.find((part) => part.type === "day")?.value,
    ),
  };
}

function formatDate(
  year: number,
  month: number,
  day: number,
) {
  return [
    String(year).padStart(4, "0"),
    String(month).padStart(2, "0"),
    String(day).padStart(2, "0"),
  ].join("-");
}

function getDashboardDates() {
  const { year, month } = getMelbourneDateParts();

  const currentMonthStart = formatDate(year, month, 1);

  const currentMonthEndDate = new Date(
    Date.UTC(year, month, 0),
  );

  const currentMonthEnd = formatDate(
    currentMonthEndDate.getUTCFullYear(),
    currentMonthEndDate.getUTCMonth() + 1,
    currentMonthEndDate.getUTCDate(),
  );

  const cashFlowStartDate = new Date(
    Date.UTC(year, month - 6, 1),
  );

  const cashFlowStart = formatDate(
    cashFlowStartDate.getUTCFullYear(),
    cashFlowStartDate.getUTCMonth() + 1,
    1,
  );

  return {
    currentMonthStart,
    currentMonthEnd,
    cashFlowStart,
  };
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub;

  if (claimsError || typeof userId !== "string") {
    redirect("/login");
  }

  const {
    currentMonthStart,
    currentMonthEnd,
    cashFlowStart,
  } = getDashboardDates();

  const [
    { data: summary, error: summaryError },
    { data: cashFlow, error: cashFlowError },
    { data: categorySpending, error: categoryError },
  ] = await Promise.all([
    supabase
      .rpc("get_dashboard_summary", {
        p_period_start: currentMonthStart,
        p_period_end: currentMonthEnd,
      })
      .maybeSingle(),

    supabase.rpc("get_monthly_cash_flow", {
      p_start_month: cashFlowStart,
      p_end_month: currentMonthStart,
    }),

    supabase.rpc("get_spending_by_category", {
      p_period_start: currentMonthStart,
      p_period_end: currentMonthEnd,
    }),
  ]);

  if (summaryError || cashFlowError || categoryError) {
    console.error("Dashboard query failed:", {
      summaryError,
      cashFlowError,
      categoryError,
    });

    throw new Error("Unable to load dashboard data.");
  }

  const currencyCode = summary?.currency_code ?? "AUD";
  const currentBalance = Number(summary?.current_balance ?? 0);
  const monthlyIncome = Number(summary?.period_income ?? 0);
  const monthlyExpenses = Number(
    summary?.period_expenses ?? 0,
  );
  const netCashFlow = monthlyIncome - monthlyExpenses;

  const monthLabel = new Intl.DateTimeFormat("en-AU", {
    month: "long",
    year: "numeric",
    timeZone: "Australia/Melbourne",
  }).format(new Date());

  const cashFlowData = (cashFlow ?? []).map((item) => ({
    month: new Intl.DateTimeFormat("en-AU", {
      month: "short",
      timeZone: "UTC",
    }).format(new Date(`${item.month_start}T00:00:00Z`)),
    income: Number(item.income),
    expenses: Number(item.expenses),
  }));

  const categoryData = (categorySpending ?? []).map(
    (category) => ({
      id: category.category_id,
      name: category.category_name,
      color: category.category_color,
      total: Number(category.total),
    }),
  );

  return (
    <>
      <section>
        <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-700">
              {monthLabel}
            </p>

            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
              Financial overview
            </h2>
          </div>

          <p className="text-sm text-slate-500">
            All accounts · {currencyCode}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Current balance"
            amount={formatCurrency(
              currentBalance,
              currencyCode,
            )}
            description="Across included accounts"
            icon={Landmark}
          />

          <SummaryCard
            title="Monthly income"
            amount={formatCurrency(
              monthlyIncome,
              currencyCode,
            )}
            description={`Income recorded in ${monthLabel}`}
            icon={ArrowUpRight}
            variant="income"
          />

          <SummaryCard
            title="Monthly expenses"
            amount={formatCurrency(
              monthlyExpenses,
              currencyCode,
            )}
            description={`Spending recorded in ${monthLabel}`}
            icon={ArrowDownRight}
            variant="expense"
          />

          <SummaryCard
            title="Net cash flow"
            amount={`${netCashFlow >= 0 ? "+" : "−"}${formatCurrency(
              Math.abs(netCashFlow),
              currencyCode,
            )}`}
            description={
              netCashFlow >= 0
                ? "You earned more than you spent"
                : "You spent more than you earned"
            }
            icon={
              netCashFlow >= 0 ? TrendingUp : TrendingDown
            }
            variant={
              netCashFlow >= 0 ? "income" : "expense"
            }
          />
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-6">
            <h2 className="font-semibold text-slate-950">
              Cash-flow overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Income and expenses over the last six months
            </p>
          </div>

          <CashFlowChart
            data={cashFlowData}
            currencyCode={currencyCode}
          />
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h2 className="font-semibold text-slate-950">
              Spending by category
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your expenses in {monthLabel}
            </p>
          </div>

          <CategorySpendingChart
            data={categoryData}
            currencyCode={currencyCode}
          />
        </article>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <article className="min-h-72 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-950">
            Budget progress
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Monthly category spending limits
          </p>

          <div className="mt-6 flex h-44 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50">
            <p className="text-sm text-slate-500">
              Budget tracking coming next
            </p>
          </div>
        </article>

        <article className="min-h-72 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-950">
            Savings goals
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Progress toward your financial targets
          </p>

          <div className="mt-6 flex h-44 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50">
            <p className="text-sm text-slate-500">
              Savings planning coming later
            </p>
          </div>
        </article>
      </section>
    </>
  );
}