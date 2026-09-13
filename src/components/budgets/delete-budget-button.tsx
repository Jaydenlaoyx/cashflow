"use client";

import { Trash2 } from "lucide-react";

import { deleteBudget } from "@/app/(dashboard)/budgets/actions";

type DeleteBudgetButtonProps = {
  budgetId: string;
  categoryName: string;
  month: string;
};

export function DeleteBudgetButton({
  budgetId,
  categoryName,
  month,
}: DeleteBudgetButtonProps) {
  const deleteAction = deleteBudget.bind(null, budgetId, month);

  return (
    <form
      action={deleteAction}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          `Remove the ${categoryName} budget for this month?`,
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        aria-label={`Delete ${categoryName} budget`}
        title="Delete budget"
        className="flex size-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
      >
        <Trash2 aria-hidden="true" className="size-4" />
      </button>
    </form>
  );
}