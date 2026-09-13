"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { formatCurrency } from "@/lib/finance/format";

type CategoryDataPoint = {
  id: string;
  name: string;
  color: string;
  total: number;
};

type CategorySpendingChartProps = {
  data: CategoryDataPoint[];
  currencyCode: string;
  emptyMessage?: string;
};

export function CategorySpendingChart({
  data,
  currencyCode,
  emptyMessage = "No expenses recorded this month.",
}: CategorySpendingChartProps) {
  const overallTotal = data.reduce(
    (total, category) => total + category.total,
    0,
  );

  if (data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-xl bg-slate-50">
        <p className="text-sm text-slate-500">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="relative h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={88}
              paddingAngle={3}
              stroke="none"
            >
              {data.map((category) => (
                <Cell
                  key={category.id}
                  fill={category.color}
                />
              ))}
            </Pie>

            <Tooltip
              formatter={(value) =>
                formatCurrency(Number(value), currencyCode)
              }
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #E2E8F0",
                boxShadow:
                  "0 8px 24px rgba(15, 23, 42, 0.08)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs font-medium text-slate-500">
            Total spent
          </span>

          <span className="mt-1 text-lg font-bold text-slate-950">
            {formatCurrency(overallTotal, currencyCode)}
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {data.slice(0, 5).map((category) => {
          const percentage =
            overallTotal > 0
              ? (category.total / overallTotal) * 100
              : 0;

          return (
            <div
              key={category.id}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  aria-hidden="true"
                  className="size-2.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor: category.color,
                  }}
                />

                <span className="truncate text-sm text-slate-600">
                  {category.name}
                </span>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold text-slate-900">
                  {formatCurrency(
                    category.total,
                    currencyCode,
                  )}
                </p>

                <p className="text-xs text-slate-400">
                  {percentage.toFixed(1)}%
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}