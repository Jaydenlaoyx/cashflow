"use client";

import { Trash2 } from "lucide-react";

import { deleteTransaction } from "@/app/(dashboard)/transactions/actions";

type DeleteTransactionButtonProps = {
  transactionId: string;
  description: string;
  compact?: boolean;
};

export function DeleteTransactionButton({
  transactionId,
  description,
  compact = false,
}: DeleteTransactionButtonProps) {
  const deleteAction = deleteTransaction.bind(null, transactionId);

  return (
    <form
      action={deleteAction}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          `Delete “${description}”? This action cannot be undone.`,
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        aria-label={`Delete ${description}`}
        title="Delete transaction"
        className={
          compact
            ? "flex size-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
            : "flex h-9 items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
        }
      >
        <Trash2 aria-hidden="true" className="size-4" />
        {compact ? null : "Delete"}
      </button>
    </form>
  );
}