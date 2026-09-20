import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          <SearchX className="h-7 w-7" />
        </div>

        <p className="mt-6 text-sm font-semibold text-blue-600">404</p>

        <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
          Page not found
        </h1>

        <p className="mt-3 text-slate-700 dark:text-slate-300">
          The page may have moved, been deleted, or never existed.
        </p>

        <Link
          href="/"
          className="mt-7 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to CashFlow
        </Link>
      </div>
    </main>
  );
}