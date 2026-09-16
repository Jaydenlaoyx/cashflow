import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { CsvImportPreview } from "@/components/transactions/csv-import-preview";

export default function ImportTransactionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/transactions"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to transactions
        </Link>

        <h1 className="text-2xl font-bold text-slate-950 dark:text-white">
          Import transactions
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Upload a CashFlow CSV file and review every transaction before
          importing it.
        </p>
      </div>

      <CsvImportPreview />
    </div>
  );
}