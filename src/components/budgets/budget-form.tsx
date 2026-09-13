"use client";

import { useActionState } from "react";
import { LoaderCircle, Plus } from "lucide-react";

import {
  saveBudget,
  type BudgetActionState,
} from "@/app/(dashboard)/budgets/actions";

const initialState: BudgetActionState = {};

type ExpenseCategory = {
  id: string;
  name: string;
  color: string;
};

type BudgetFormProps = {
  categories: ExpenseCategory[];
  month: string;
};

function FieldError({ messages }: { messages?: string[] }) {
  return messages?.length ? (
    <p className="mt-1.5 text-xs text-rose-600">
      {messages[0]}
    </p>
  ) : null;
}

export function BudgetForm({
  categories,
  month,
}: BudgetFormProps) {
  const [state, formAction, pending] = useActionState(
    saveBudget,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="month" value={month} />

      {state.error ? (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {state.error}
        </div>
      ) : null}

      <div>
        <label
          htmlFor="categoryId"
          className="text-sm font-medium text-slate-700"
        >
          Expense category
        </label>

        <select
          id="categoryId"
          name="categoryId"
          required
          defaultValue=""
          className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
        >
          <option value="" disabled>
            Select a category
          </option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <FieldError messages={state.fieldErrors?.categoryId} />
      </div>

      <div>
        <label
          htmlFor="amount"
          className="text-sm font-medium text-slate-700"
        >
          Monthly limit
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
            placeholder="500.00"
            className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-8 pr-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />
        </div>

        <FieldError messages={state.fieldErrors?.amount} />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? (
          <>
            <LoaderCircle
              aria-hidden="true"
              className="size-4 animate-spin"
            />
            Saving...
          </>
        ) : (
          <>
            <Plus aria-hidden="true" className="size-4" />
            Set category budget
          </>
        )}
      </button>

      <p className="text-xs leading-5 text-slate-400">
        Selecting a category that already has a budget will update its
        existing limit.
      </p>
    </form>
  );
}