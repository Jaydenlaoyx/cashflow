"use client";

import { Trash2 } from "lucide-react";

import { deleteGoal } from "@/app/(dashboard)/goals/actions";

type DeleteGoalButtonProps = {
  goalId: string;
  goalName: string;
};

export function DeleteGoalButton({
  goalId,
  goalName,
}: DeleteGoalButtonProps) {
  const deleteAction = deleteGoal.bind(null, goalId);

  return (
    <form
      action={deleteAction}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          `Delete “${goalName}” and all of its contributions?`,
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        aria-label={`Delete ${goalName}`}
        title="Delete goal"
        className="flex size-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
      >
        <Trash2 aria-hidden="true" className="size-4" />
      </button>
    </form>
  );
}