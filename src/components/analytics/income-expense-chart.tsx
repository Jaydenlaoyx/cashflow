"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrency } from "@/lib/finance/format";

type AnalyticsDataPoint = {
  label: string;
  income: number;
  expenses: number;
};

type IncomeExpenseChartProps = {
  data: AnalyticsDataPoint[];
  currencyCode: string;
};

function formatCompactAmount(amount: number) {
  return new Intl.NumberFormat("en-AU", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
}

export function IncomeExpenseChart({
  data,
  currencyCode,
}: IncomeExpenseChartProps) {
  const hasActivity = data.some(
    (item) => item.income > 0 || item.expenses > 0,
  );

  if (!hasActivity) {
    return (
      <div className="flex h-80 items-center justify-center rounded-xl bg-slate-50">
        <p className="text-sm text-slate-500">
          No financial activity during this period.
        </p>
      </div>
    );
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: -10,
            bottom: 0,
          }}
        >
          <CartesianGrid
            stroke="#E2E8F0"
            strokeDasharray="4 4"
            vertical={false}
          />

          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "#64748B",
              fontSize: 12,
            }}
            dy={8}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "#64748B",
              fontSize: 12,
            }}
            tickFormatter={formatCompactAmount}
          />

          <Tooltip
            formatter={(value, name) => [
              formatCurrency(Number(value), currencyCode),
              name === "income" ? "Income" : "Expenses",
            ]}
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #E2E8F0",
              boxShadow:
                "0 8px 24px rgba(15, 23, 42, 0.08)",
            }}
          />

          <Legend
            formatter={(value) =>
              value === "income" ? "Income" : "Expenses"
            }
          />

          <Bar
            dataKey="income"
            fill="#059669"
            radius={[5, 5, 0, 0]}
            maxBarSize={34}
          />

          <Bar
            dataKey="expenses"
            fill="#F43F5E"
            radius={[5, 5, 0, 0]}
            maxBarSize={34}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}