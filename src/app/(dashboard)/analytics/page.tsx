import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  PiggyBank,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { redirect } from "next/navigation";

import { IncomeExpenseChart } from "@/components/analytics/income-expense-chart";
import { CategorySpendingChart } from "@/components/dashboard/category-spending-chart";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { formatCurrency } from "@/lib/finance/format";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Analytics",
};

type AnalyticsPageProps = {
  searchParams: Promise<{
    view?: string;
    period?: string;
  }>;
};

type AnalyticsView = "monthly" | "yearly";

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const YEAR_PATTERN = /^\d{4}$/;

function getCurrentMelbournePeriod() {
  const parts = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Melbourne",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());

  const year =
    parts.find((part) => part.type === "year")?.value ??
    "2026";

  const month =
    parts.find((part) => part.type === "month")?.value ??
    "01";

  return {
    month: `${year}-${month}`,
    year,
  };
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

function getPeriodLabel(
  view: AnalyticsView,
  period: string,
) {
  if (view === "yearly") {
    return period;
  }

  return new Intl.DateTimeFormat("en-AU", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${period}-01T00:00:00Z`));
}

function createAnalyticsUrl(
  view: AnalyticsView,
  period: string,
) {
  return `/analytics?view=${view}&period=${period}`;
}

export default async function AnalyticsPage({
  searchParams,
}: AnalyticsPageProps) {
  const params = await searchParams;

  const view: AnalyticsView =
    params.view === "yearly" ? "yearly" : "monthly";

  const currentPeriod = getCurrentMelbournePeriod();

  const period =
    view === "monthly"
      ? params.period && MONTH_PATTERN.test(params.period)
        ? params.period
        : currentPeriod.month
      : params.period && YEAR_PATTERN.test(params.period)
        ? params.period
        : currentPeriod.year;

  const range =
    view === "monthly"
      ? getMonthRange(period)
      : {
          startDate: `${period}-01-01`,
          endDate: `${period}-12-31`,
        };

  const previousPeriod =
    view === "monthly"
      ? moveMonth(period, -1)
      : String(Number(period) - 1);

  const nextPeriod =
    view === "monthly"
      ? moveMonth(period, 1)
      : String(Number(period) + 1);

  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub;

  if (claimsError || typeof userId !== "string") {
    redirect("/login");
  }

  const [
    { data: summary, error: summaryError },
    { data: categories, error: categoryError },
    { data: profile, error: profileError },
  ] = await Promise.all([
    supabase
      .rpc("get_dashboard_summary", {
        p_period_start: range.startDate,
        p_period_end: range.endDate,
      })
      .maybeSingle(),

    supabase.rpc("get_spending_by_category", {
      p_period_start: range.startDate,
      p_period_end: range.endDate,
    }),

    supabase
      .from("profiles")
      .select("currency_code")
      .eq("id", userId)
      .single(),
  ]);

  const trendResult =
    view === "monthly"
      ? await supabase.rpc("get_daily_cash_flow", {
          p_start_date: range.startDate,
          p_end_date: range.endDate,
        })
      : await supabase.rpc("get_monthly_cash_flow", {
          p_start_month: range.startDate,
          p_end_month: range.endDate,
        });

  if (
    summaryError ||
    categoryError ||
    profileError ||
    trendResult.error
  ) {
    console.error("Analytics query failed:", {
      summaryError,
      categoryError,
      profileError,
      trendError: trendResult.error,
    });

    throw new Error("Unable to load analytics.");
  }

  const currencyCode =
    profile?.currency_code ??
    summary?.currency_code ??
    "AUD";

  const income = Number(summary?.period_income ?? 0);
  const expenses = Number(summary?.period_expenses ?? 0);
  const netCashFlow = income - expenses;

  const savingsRate =
    income > 0 ? (netCashFlow / income) * 100 : 0;

  const trendData =
    view === "monthly"
      ? (
          trendResult.data as Array<{
            activity_date: string;
            income: number;
            expenses: number;
          }>
        ).map((item) => ({
          label: String(
            Number(item.activity_date.slice(-2)),
          ),
          income: Number(item.income),
          expenses: Number(item.expenses),
        }))
      : (
          trendResult.data as Array<{
            month_start: string;
            income: number;
            expenses: number;
          }>
        ).map((item) => ({
          label: new Intl.DateTimeFormat("en-AU", {
            month: "short",
            timeZone: "UTC",
          }).format(
            new Date(`${item.month_start}T00:00:00Z`),
          ),
          income: Number(item.income),
          expenses: Number(item.expenses),
        }));

  const categoryData = (categories ?? []).map(
    (category) => ({
      id: category.category_id,
      name: category.category_name,
      color: category.category_color,
      total: Number(category.total),
    }),
  );

  const periodLabel = getPeriodLabel(view, period);

  return (
    <section>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-700">
            Financial analysis
          </p>

          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
            Income and expense breakdown
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Understand how your cash flow changes over time.
          </p>
        </div>

        <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <Link
            href={createAnalyticsUrl(
              "monthly",
              currentPeriod.month,
            )}
            className={`flex h-9 items-center rounded-lg px-4 text-sm font-semibold transition ${
              view === "monthly"
                ? "bg-emerald-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Monthly
          </Link>

          <Link
            href={createAnalyticsUrl(
              "yearly",
              currentPeriod.year,
            )}
            className={`flex h-9 items-center rounded-lg px-4 text-sm font-semibold transition ${
              view === "yearly"
                ? "bg-emerald-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Yearly
          </Link>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center">
        <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <Link
            href={createAnalyticsUrl(view, previousPeriod)}
            aria-label={`Previous ${view === "monthly" ? "month" : "year"}`}
            className="flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <ChevronLeft className="size-4" />
          </Link>

          <span className="min-w-44 px-4 text-center text-sm font-semibold text-slate-800">
            {periodLabel}
          </span>

          <Link
            href={createAnalyticsUrl(view, nextPeriod)}
            aria-label={`Next ${view === "monthly" ? "month" : "year"}`}
            className="flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title={`${view === "monthly" ? "Monthly" : "Yearly"} income`}
          amount={formatCurrency(income, currencyCode)}
          description={`Income during ${periodLabel}`}
          icon={ArrowUpRight}
          variant="income"
        />

        <SummaryCard
          title={`${view === "monthly" ? "Monthly" : "Yearly"} expenses`}
          amount={formatCurrency(expenses, currencyCode)}
          description={`Spending during ${periodLabel}`}
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
              ? "Positive cash flow"
              : "Negative cash flow"
          }
          icon={
            netCashFlow >= 0 ? TrendingUp : TrendingDown
          }
          variant={
            netCashFlow >= 0 ? "income" : "expense"
          }
        />

        <SummaryCard
          title="Savings rate"
          amount={`${savingsRate.toFixed(1)}%`}
          description="Net cash flow as a share of income"
          icon={PiggyBank}
          variant={
            savingsRate >= 0 ? "income" : "expense"
          }
        />
      </div>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,1fr)]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-950">
            {view === "monthly"
              ? "Daily cash flow"
              : "Monthly cash flow"}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Income compared with expenses during {periodLabel}
          </p>

          <div className="mt-6">
            <IncomeExpenseChart
              data={trendData}
              currencyCode={currencyCode}
            />
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-950">
            Expense categories
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Spending distribution during {periodLabel}
          </p>

          <CategorySpendingChart
            data={categoryData}
            currencyCode={currencyCode}
            emptyMessage={`No expenses recorded during ${periodLabel}.`}
          />
        </article>
      </div>
    </section>
  );
}