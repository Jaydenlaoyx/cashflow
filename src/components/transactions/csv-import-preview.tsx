"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { FileUp, TriangleAlert, X } from "lucide-react";

import { importTransactions } from "@/app/(dashboard)/transactions/import/actions";
import type { ImportTransactionInput } from "@/lib/transactions/import-types";

import {
  requiredImportHeaders,
  validateImportRow,
  type CsvRow,
  type PreviewRow,
} from "@/lib/transactions/import-validation";

export function CsvImportPreview() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [importMessage, setImportMessage] = useState("");
  const [importSucceeded, setImportSucceeded] = useState(false);  

  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [fileError, setFileError] = useState("");

  function resetImport() {
    setFileName("");
    setRows([]);
    setFileError("");
    setImportMessage("");
    setImportSucceeded(false);
  }

  function handleFile(file: File | undefined) {
    resetImport();

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setFileError("Please select a CSV file.");
      return;
    }

    setFileName(file.name);

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (header) =>
        header.replace(/^\uFEFF/, "").trim().toLowerCase(),
      complete: (result) => {
        const headers = result.meta.fields ?? [];
        const missingHeaders = requiredImportHeaders.filter(
          (header) => !headers.includes(header),
        );

        if (missingHeaders.length > 0) {
          setFileError(
            `Missing required columns: ${missingHeaders.join(", ")}.`,
          );
          setRows([]);
          return;
        }

        if (result.data.length === 0) {
          setFileError("The CSV file does not contain any transactions.");
          return;
        }

        if (result.data.length > 1000) {
          setFileError("A maximum of 1,000 transactions can be imported at once.");
          return;
        }

        setRows(result.data.map(validateImportRow));
      },
      error: () => {
        setFileError("The CSV file could not be read.");
      },
    });
  }

  const invalidRows = rows.filter((row) => row.errors.length > 0).length;
  const validRows = rows.length - invalidRows;

  function handleImport() {
    if (rows.length === 0 || invalidRows > 0) {
        return;
    }

    const importRows: ImportTransactionInput[] = rows.map((row) => ({
        date: row.date,
        type: row.type,
        description: row.description,
        category: row.category,
        account: row.account,
        amount: row.amount,
        notes: row.notes,
    }));

    setImportMessage("");
    setImportSucceeded(false);

    startTransition(async () => {
        const result = await importTransactions(importRows);

        setImportMessage(result.message);
        setImportSucceeded(result.success);

        if (result.success) {
        setRows([]);
        setFileName("");
        router.refresh();
        }
    });
  }

  return (
    <div className="space-y-6">
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white px-6 py-12 text-center transition hover:border-blue-500 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-500 dark:hover:bg-blue-950/20">
        <FileUp className="mb-3 h-8 w-8 text-blue-600" />

        <span className="font-medium text-slate-900 dark:text-white">
          Choose a CSV file
        </span>

        <span className="mt-1 text-sm text-slate-500">
          Maximum 1,000 transactions
        </span>

        <input
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
      </label>

      {fileError ? (
        <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          <TriangleAlert className="h-5 w-5 shrink-0" />
          <p>{fileError}</p>
        </div>
      ) : null}

      {importMessage ? (
        <div
            className={
            importSucceeded
                ? "rounded-lg border border-green-300 bg-green-100 p-4 text-sm font-medium text-green-950 dark:border-green-700 dark:bg-green-950 dark:text-green-200"
                : "rounded-lg border border-red-300 bg-red-100 p-4 text-sm font-medium text-red-950 dark:border-red-700 dark:bg-red-950 dark:text-red-200"
            }
        >
            {importMessage}
        </div>
        ) : null}

      {rows.length > 0 ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Import preview
              </h2>

              <p className="text-sm text-slate-700 dark:text-slate-300">
                {fileName} · {validRows} valid · {invalidRows} invalid
              </p>
            </div>

            <button
              type="button"
              onClick={resetImport}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              <X className="h-4 w-4" />
              Clear
            </button>
          </div>

          {invalidRows > 0 ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
              Fix or remove invalid rows in the CSV before importing.
            </div>
          ) : (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300">
              All rows are valid and ready to import.
            </div>
          )}

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
              <thead className="bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                <tr>
                  {[
                    "Row",
                    "Date",
                    "Type",
                    "Description",
                    "Category",
                    "Account",
                    "Amount",
                    "Status",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 bg-white text-slate-900 dark:divide-slate-800 dark:bg-slate-950 dark:text-slate-100">
                {rows.map((row) => (
                  <tr key={row.rowNumber}>
                    <td className="px-4 py-3">{row.rowNumber}</td>
                    <td className="whitespace-nowrap px-4 py-3">{row.date}</td>
                    <td className="px-4 py-3 capitalize">{row.type}</td>
                    <td className="px-4 py-3">{row.description}</td>
                    <td className="px-4 py-3">{row.category}</td>
                    <td className="px-4 py-3">{row.account}</td>
                    <td className="px-4 py-3">{row.amount}</td>
                    <td className="min-w-64 px-4 py-3">
                      {row.errors.length === 0 ? (
                        <span className="text-green-600 dark:text-green-400">
                          Valid
                        </span>
                      ) : (
                        <ul className="list-disc space-y-1 pl-4 text-red-600 dark:text-red-400">
                          {row.errors.map((error) => (
                            <li key={error}>{error}</li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={handleImport}
                    disabled={invalidRows > 0 || isPending}
                    className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isPending
                    ? "Importing..."
                    : `Import ${validRows} transaction${validRows === 1 ? "" : "s"}`}
                </button>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}