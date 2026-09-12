"use client";

import { usePathname } from "next/navigation";
import { Bell, PiggyBank, Plus } from "lucide-react";
import Link from "next/link";

const pageInformation: Record<
  string,
  {
    title: string;
    description: string;
  }
> = {
  "/": {
    title: "Dashboard",
    description: "Here’s an overview of your finances.",
  },
  "/transactions": {
    title: "Transactions",
    description: "Review and manage your financial activity.",
  },
  "/transactions/new": {
    title: "Add transaction",
    description: "Record new income or spending.",
  },
  "/analytics": {
    title: "Analytics",
    description: "Explore your income, spending and cash-flow trends.",
  },
  "/budgets": {
    title: "Budgets",
    description: "Set spending limits and monitor your progress.",
  },
  "/goals": {
    title: "Savings goals",
    description: "Plan and track your financial targets.",
  },
  "/recurring": {
    title: "Recurring transactions",
    description: "Manage routine income and expenses.",
  },
  "/settings": {
    title: "Settings",
    description: "Manage your preferences, categories and account.",
  },
};

export function AppHeader() {
  const pathname = usePathname();

  const currentPage = pageInformation[pathname] ?? {
    title: "CashFlow",
    description: "Manage your personal finances.",
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-slate-50/90 backdrop-blur">
      <div className="flex h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white lg:hidden">
            <PiggyBank aria-hidden="true" className="size-5" />
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold tracking-tight text-slate-950">
              {currentPage.title}
            </h1>

            <p className="hidden text-sm text-slate-500 sm:block">
              {currentPage.description}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-label="View notifications"
            className="flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
          >
            <Bell aria-hidden="true" className="size-5" />
          </button>

          <Link
            href="/transactions/new"
            className="flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-3 text-sm font-semibold text-white transition hover:bg-emerald-700 sm:px-4"
          >
            <Plus aria-hidden="true" className="size-4" />
            <span className="hidden sm:inline">Add transaction</span>
            <span className="sm:hidden">Add</span>
          </Link>
        </div>
      </div>
    </header>
  );
}