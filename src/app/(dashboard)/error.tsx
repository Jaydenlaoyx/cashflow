"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, House, RefreshCw } from "lucide-react";

type DashboardErrorProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function DashboardError({
  error,
  reset,
}: DashboardErrorProps) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm dark:border-red-900 dark:bg-slate-900">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
          <AlertTriangle className="h-6 w-6" />
        </div>

        <h1 className="mt-5 text-xl font-bold text-slate-950 dark:text-white">
          Something went wrong
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
          CashFlow couldn&apos;t load this page. Your existing financial data
          has not been changed.
        </p>

        {error.digest ? (
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Reference: {error.digest}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>

          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <House className="h-4 w-4" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}