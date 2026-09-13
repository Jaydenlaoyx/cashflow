"use client";

import { useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Plus,
} from "lucide-react";

import { createRecurringTransaction } from "@/app/(dashboard)/recurring/actions";

type AccountOption = {
  id: string;
  name: string;
};

type CategoryOption = {
  id: string;
  name: string;
  type: "income" | "expense";
};

type RecurringFormProps = {
  accounts: AccountOption[];
  categories: CategoryOption[];
  today: string;
};

export function RecurringForm({
  accounts,
  categories,
  today,
}: RecurringFormProps) {
  const [type, setType] = useState<
    "income" | "expense"
  >("expense");

  const availableCategories = categories.filter(
    (category) => category.type === type,
  );

  const inputStyles =
    "mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";

  return (
    <form
      action={createRecurringTransaction}
      className="space-y-5"
    >
      <fieldset>
        <legend className="text-sm font-medium text-slate-700">
          Transaction type
        </legend>

        <div className="mt-2 grid grid-cols-2 gap-3">
          <label
            className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold ${
              type === "expense"
                ? "border-rose-500 bg-rose-50 text-rose-700"
                : "border-slate-200 text-slate-600"
            }`}
          >
            <input
              type="radio"
              name="type"
              value="expense"
              checked={type === "expense"}
              onChange={() => setType("expense")}
              className="sr-only"
            />
            <ArrowDownRight className="size-4" />
            Expense
          </label>

          <label
            className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold ${
              type === "income"
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-slate-200 text-slate-600"
            }`}
          >
            <input
              type="radio"
              name="type"
              value="income"
              checked={type === "income"}
              onChange={() => setType("income")}
              className="sr-only"
            />
            <ArrowUpRight className="size-4" />
            Income
          </label>
        </div>
      </fieldset>

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
          required
          maxLength={150}
          placeholder={
            type === "expense"
              ? "Monthly rent"
              : "Fortnightly salary"
          }
          className={inputStyles}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="amount"
            className="text-sm font-medium text-slate-700"
          >
            Amount
          </label>

          <input
            id="amount"
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            required
            placeholder="0.00"
            className={inputStyles}
          />
        </div>

        <div>
          <label
            htmlFor="frequency"
            className="text-sm font-medium text-slate-700"
          >
            Frequency
          </label>

          <select
            id="frequency"
            name="frequency"
            defaultValue="monthly"
            className={inputStyles}
          >
            <option value="weekly">Weekly</option>
            <option value="fortnightly">
              Every two weeks
            </option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
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
            defaultValue=""
            className={inputStyles}
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
        </div>

        <div>
          <label
            htmlFor="categoryId"
            className="text-sm font-medium text-slate-700"
          >
            Category
          </label>

          <select
            key={type}
            id="categoryId"
            name="categoryId"
            required
            defaultValue=""
            className={inputStyles}
          >
            <option value="" disabled>
              Select a category
            </option>

            {availableCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="merchant"
          className="text-sm font-medium text-slate-700"
        >
          Merchant or source{" "}
          <span className="font-normal text-slate-400">
            (optional)
          </span>
        </label>

        <input
          id="merchant"
          name="merchant"
          maxLength={100}
          className={inputStyles}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="startDate"
            className="text-sm font-medium text-slate-700"
          >
            First occurrence
          </label>

          <input
            id="startDate"
            name="startDate"
            type="date"
            required
            defaultValue={today}
            className={inputStyles}
          />
        </div>

        <div>
          <label
            htmlFor="endDate"
            className="text-sm font-medium text-slate-700"
          >
            End date{" "}
            <span className="font-normal text-slate-400">
              (optional)
            </span>
          </label>

          <input
            id="endDate"
            name="endDate"
            type="date"
            className={inputStyles}
          />
        </div>
      </div>

      <input type="hidden" name="notes" value="" />

      <button
        type="submit"
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700"
      >
        <Plus className="size-4" />
        Create recurring schedule
      </button>
    </form>
  );
}