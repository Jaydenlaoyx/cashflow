"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { ArrowDownRight, ArrowUpRight, LoaderCircle } from "lucide-react";

import {
  createTransaction,
  type TransactionActionState,
  updateTransaction
} from "@/app/(dashboard)/transactions/actions";

const initialTransactionState: TransactionActionState = {};

type AccountOption = {
  id: string;
  name: string;
};

type CategoryOption = {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
};

type TransactionFormProps = {
  accounts: AccountOption[];
  categories: CategoryOption[];
  today: string;
  transaction?: ExistingTransaction;
};

type ExistingTransaction = {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  merchant: string | null;
  transactionDate: string;
  accountId: string;
  categoryId: string;
  notes: string | null;
};

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) {
    return null;
  }

  return (
    <p className="mt-1.5 text-xs text-rose-600">
      {messages[0]}
    </p>
  );
}

export function TransactionForm({
  accounts,
  categories,
  today,
  transaction,
}: TransactionFormProps) {
  const editing = Boolean(transaction);

  const [transactionType, setTransactionType] = useState<
    "income" | "expense"
  >("expense");

  const transactionAction = transaction
    ? updateTransaction.bind(null, transaction.id)
    : createTransaction;

  const [state, formAction, pending] = useActionState(
    transactionAction,
    initialTransactionState,
  );

  const matchingCategories = categories.filter(
    (category) => category.type === transactionType,
  );

  return (
    <form action={formAction} className="space-y-6">
      {state.error ? (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {state.error}
        </div>
      ) : null}

      <fieldset>
        <legend className="text-sm font-medium text-slate-700">
          Transaction type
        </legend>

        <div className="mt-2 grid grid-cols-2 gap-3">
          <label
            className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
              transactionType === "expense"
                ? "border-rose-500 bg-rose-50 text-rose-700 ring-4 ring-rose-500/10"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <input
              type="radio"
              name="type"
              value="expense"
              checked={transactionType === "expense"}
              onChange={() => setTransactionType("expense")}
              className="sr-only"
            />

            <ArrowDownRight aria-hidden="true" className="size-5" />
            Expense
          </label>

          <label
            className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
              transactionType === "income"
                ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-4 ring-emerald-500/10"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <input
              type="radio"
              name="type"
              value="income"
              checked={transactionType === "income"}
              onChange={() => setTransactionType("income")}
              className="sr-only"
            />

            <ArrowUpRight aria-hidden="true" className="size-5" />
            Income
          </label>
        </div>

        <FieldError messages={state.fieldErrors?.type} />
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="amount"
            className="text-sm font-medium text-slate-700"
          >
            Amount
          </label>

          <div className="relative mt-2">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm font-medium text-slate-500">
              $
            </span>

            <input
              id="amount"
              name="amount"
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              required
              placeholder="0.00"
              defaultValue={transaction?.amount}
              className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-8 pr-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          <FieldError messages={state.fieldErrors?.amount} />
        </div>

        <div>
          <label
            htmlFor="transactionDate"
            className="text-sm font-medium text-slate-700"
          >
            Date
          </label>

          <input
            id="transactionDate"
            name="transactionDate"
            type="date"
            required
            defaultValue={transaction?.transactionDate ?? today}
            className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />

          <FieldError messages={state.fieldErrors?.transactionDate} />
        </div>
      </div>

      <div>
        <label
          htmlFor="description"
          className="text-sm font-medium text-slate-700"
        >
          Description
        </label>

        <input
          id="description"
          name="description"
          type="text"
          required
          maxLength={150}
          placeholder={
            transactionType === "expense"
              ? "For example, weekly groceries"
              : "For example, fortnightly salary"
          }
          defaultValue={transaction?.description}
          className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
        />

        <FieldError messages={state.fieldErrors?.description} />
      </div>

      <div>
        <label
          htmlFor="merchant"
          className="text-sm font-medium text-slate-700"
        >
          Merchant or source{" "}
          <span className="font-normal text-slate-400">(optional)</span>
        </label>

        <input
          id="merchant"
          name="merchant"
          type="text"
          maxLength={100}
          placeholder={
            transactionType === "expense"
              ? "For example, Woolworths"
              : "For example, Employer"
          }
          defaultValue={transaction?.merchant ?? ""}
          className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
        />

        <FieldError messages={state.fieldErrors?.merchant} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="accountId"
            className="text-sm font-medium text-slate-700"
          >
            Account
          </label>

          <select
            id="accountId"
            name="accountId"
            required
            defaultValue={transaction?.accountId ?? ""}
            className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          >
            <option value="" disabled>
              Select an account
            </option>

            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>

          <FieldError messages={state.fieldErrors?.accountId} />
        </div>

        <div>
          <label
            htmlFor="categoryId"
            className="text-sm font-medium text-slate-700"
          >
            Category
          </label>

          <select
            key={transactionType}
            id="categoryId"
            name="categoryId"
            required
            defaultValue={transaction?.categoryId ?? ""}
            className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          >
            <option value="" disabled>
              Select a category
            </option>

            {matchingCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <FieldError messages={state.fieldErrors?.categoryId} />
        </div>
      </div>

      <div>
        <label
          htmlFor="notes"
          className="text-sm font-medium text-slate-700"
        >
          Notes <span className="font-normal text-slate-400">(optional)</span>
        </label>

        <textarea
          id="notes"
          name="notes"
          rows={4}
          maxLength={1000}
          placeholder="Add any extra details..."
          defaultValue={transaction?.notes ?? ""}
          className="mt-2 w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
        />

        <FieldError messages={state.fieldErrors?.notes} />
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
        <Link
          href="/transactions"
          className="flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Cancel
        </Link>

        <button
          type="submit"
          disabled={pending}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? (
            <>
              <LoaderCircle
                aria-hidden="true"
                className="size-4 animate-spin"
              />
              {editing ? "Updating..." : "Saving..."}
            </>
          ) : editing ? (
            "Update transaction"
          ) : (
            "Save transaction"
          )}
        </button>
      </div>
    </form>
  );
}