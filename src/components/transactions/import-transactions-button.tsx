import Link from "next/link";
import { Upload } from "lucide-react";

export function ImportTransactionsButton() {
  return (
    <Link
      href="/transactions/import"
      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
    >
      <Upload className="h-4 w-4" />
      Import CSV
    </Link>
  );
}