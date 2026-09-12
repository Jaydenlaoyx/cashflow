import {
  ArrowDownRight,
  ArrowUpRight,
  Landmark,
  TrendingUp,
} from "lucide-react";

import { SummaryCard } from "@/components/dashboard/summary-card";

export default function DashboardPage() {
  return (
    <>
      <section>
        <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-700">
              September 2026
            </p>

            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
              Financial overview
            </h2>
          </div>

          <p className="text-sm text-slate-500">All accounts · AUD</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Current balance"
            amount="$12,480.50"
            description="Across all accounts"
            icon={Landmark}
          />

          <SummaryCard
            title="Monthly income"
            amount="$6,240.00"
            description="8.4% higher than last month"
            icon={ArrowUpRight}
            variant="income"
          />

          <SummaryCard
            title="Monthly expenses"
            amount="$3,815.40"
            description="3.1% lower than last month"
            icon={ArrowDownRight}
            variant="expense"
          />

          <SummaryCard
            title="Net cash flow"
            amount="+$2,424.60"
            description="38.9% of income retained"
            icon={TrendingUp}
            variant="income"
          />
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,1fr)]">
        <article className="min-h-96 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-950">
            Cash flow overview
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Income and expenses over the last six months
          </p>

          <div className="mt-6 flex h-72 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50">
            <p className="text-sm text-slate-500">
              Cash flow chart coming next
            </p>
          </div>
        </article>

        <article className="min-h-96 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-950">
            Spending by category
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your expenses this month
          </p>

          <div className="mt-6 flex h-72 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50">
            <p className="text-sm text-slate-500">
              Category chart coming next
            </p>
          </div>
        </article>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <article className="min-h-72 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-950">Budget progress</h2>

          <p className="mt-1 text-sm text-slate-500">
            Your monthly spending limits
          </p>

          <div className="mt-6 flex h-44 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50">
            <p className="text-sm text-slate-500">
              Budget progress coming later
            </p>
          </div>
        </article>

        <article className="min-h-72 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-950">Savings goals</h2>

          <p className="mt-1 text-sm text-slate-500">
            Progress towards your targets
          </p>

          <div className="mt-6 flex h-44 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50">
            <p className="text-sm text-slate-500">
              Savings goals coming later
            </p>
          </div>
        </article>
      </section>
    </>
  );
}