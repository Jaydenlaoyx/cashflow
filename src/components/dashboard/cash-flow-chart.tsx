"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrency } from "@/lib/finance/format";

type CashFlowDataPoint = {
  month: string;
  income: number;
  expenses: number;
};

type CashFlowChartProps = {
  data: CashFlowDataPoint[];
  currencyCode: string;
};

function formatCompactAmount(amount: number) {
  return new Intl.NumberFormat("en-AU", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
}

export function CashFlowChart({
  data,
  currencyCode,
}: CashFlowChartProps) {
  const hasActivity = data.some(
    (item) => item.income > 0 || item.expenses > 0,
  );

  if (!hasActivity) {
    return (
      <div className="flex h-72 items-center justify-center rounded-xl bg-slate-50">
        <p className="text-sm text-slate-500">
          Add transactions to see your cash-flow trend.
        </p>
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: -10,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient
              id="incomeGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="5%"
                stopColor="#059669"
                stopOpacity={0.25}
              />
              <stop
                offset="95%"
                stopColor="#059669"
                stopOpacity={0}
              />
            </linearGradient>

            <linearGradient
              id="expenseGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="5%"
                stopColor="#F43F5E"
                stopOpacity={0.2}
              />
              <stop
                offset="95%"
                stopColor="#F43F5E"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            stroke="#E2E8F0"
            strokeDasharray="4 4"
            vertical={false}
          />

          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "#64748B",
              fontSize: 12,
            }}
            dy={10}
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
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
            }}
          />

          <Area
            type="monotone"
            dataKey="income"
            stroke="#059669"
            strokeWidth={2.5}
            fill="url(#incomeGradient)"
            activeDot={{
              r: 5,
            }}
          />

          <Area
            type="monotone"
            dataKey="expenses"
            stroke="#F43F5E"
            strokeWidth={2.5}
            fill="url(#expenseGradient)"
            activeDot={{
              r: 5,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}