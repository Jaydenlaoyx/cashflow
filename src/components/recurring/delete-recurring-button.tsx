"use client";

import { Trash2 } from "lucide-react";

import { deleteRecurringTransaction } from "@/app/(dashboard)/recurring/actions";

type DeleteRecurringButtonProps = {
  recurringId: string;
  description: string;
};

export function DeleteRecurringButton({
  recurringId,
  description,
}: DeleteRecurringButtonProps) {
  const action = deleteRecurringTransaction.bind(
    null,
    recurringId,
  );

  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (
          !window.confirm(
            `Delete the recurring schedule “${description}”?`,
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        aria-label={`Delete ${description}`}
        className="flex size-9 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
      >
        <Trash2 className="size-4" />
      </button>
    </form>
  );
}