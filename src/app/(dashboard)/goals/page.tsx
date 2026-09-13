import type { Metadata } from "next";
import {
  CalendarDays,
  CircleCheck,
  CircleDollarSign,
  Plus,
  Target,
} from "lucide-react";
import { redirect } from "next/navigation";

import {
  addGoalContribution,
  createGoal,
} from "@/app/(dashboard)/goals/actions";
import { DeleteGoalButton } from "@/components/goals/delete-goal-button";
import { formatCurrency } from "@/lib/finance/format";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Savings goals",
};

type GoalsPageProps = {
  searchParams: Promise<{
    created?: string;
    contributed?: string;
    deleted?: string;
    error?: string;
  }>;
};

function getMelbourneDate() {
  const parts = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Melbourne",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

function getMonthsRemaining(targetDate: string | null) {
  if (!targetDate) {
    return null;
  }

  const today = new Date(`${getMelbourneDate()}T00:00:00Z`);
  const target = new Date(`${targetDate}T00:00:00Z`);

  if (target <= today) {
    return 0;
  }

  const yearDifference =
    target.getUTCFullYear() - today.getUTCFullYear();

  const monthDifference =
    target.getUTCMonth() - today.getUTCMonth();

  const months = yearDifference * 12 + monthDifference;

  return Math.max(1, months);
}

function formatGoalDate(date: string) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export default async function GoalsPage({
  searchParams,
}: GoalsPageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub;

  if (claimsError || typeof userId !== "string") {
    redirect("/login");
  }

  const [
    { data: goals, error: goalsError },
    { data: profile, error: profileError },
  ] = await Promise.all([
    supabase.rpc("get_savings_goal_progress"),

    supabase
      .from("profiles")
      .select("currency_code")
      .eq("id", userId)
      .single(),
  ]);

  if (goalsError) {
    console.error("Savings goals query failed:", goalsError);
    throw new Error("Unable to load savings goals.");
  }

  if (profileError) {
    console.error("Profile query failed:", profileError);
  }

  const currencyCode = profile?.currency_code ?? "AUD";
  const today = getMelbourneDate();

  const goalRows = (goals ?? []).map((goal) => ({
    id: goal.goal_id,
    name: goal.goal_name,
    targetAmount: Number(goal.target_amount),
    currentAmount: Number(goal.current_amount),
    remainingAmount: Number(goal.remaining_amount),
    percentageComplete: Number(goal.percentage_complete),
    targetDate: goal.target_date,
    color: goal.color,
    completed: goal.is_completed,
  }));

  return (
    <section>
      {(params.created === "true" ||
        params.contributed === "true" ||
        params.deleted === "true") && (
        <div
          role="status"
          className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          {params.created === "true"
            ? "Savings goal created successfully."
            : params.contributed === "true"
              ? "Contribution added successfully."
              : "Savings goal deleted successfully."}
        </div>
      )}

      {params.error ? (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          The savings-goal operation could not be completed.
        </div>
      ) : null}

      <div>
        <p className="text-sm font-medium text-emerald-700">
          Financial planning
        </p>

        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
          Savings goals
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Create targets and calculate how much you need to save.
        </p>
      </div>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[350px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Target aria-hidden="true" className="size-5" />
            </div>

            <div>
              <h3 className="font-semibold text-slate-950">
                Create a goal
              </h3>
              <p className="text-xs text-slate-500">
                Set a target and deadline
              </p>
            </div>
          </div>

          <form action={createGoal} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="text-sm font-medium text-slate-700"
              >
                Goal name
              </label>

              <input
                id="name"
                name="name"
                required
                maxLength={80}
                placeholder="Japan relocation fund"
                className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            <div>
              <label
                htmlFor="targetAmount"
                className="text-sm font-medium text-slate-700"
              >
                Target amount
              </label>

              <input
                id="targetAmount"
                name="targetAmount"
                type="number"
                min="0.01"
                step="0.01"
                required
                placeholder="10000"
                className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            <div>
              <label
                htmlFor="initialAmount"
                className="text-sm font-medium text-slate-700"
              >
                Already saved
              </label>

              <input
                id="initialAmount"
                name="initialAmount"
                type="number"
                min="0"
                step="0.01"
                required
                defaultValue="0"
                className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            <div>
              <label
                htmlFor="targetDate"
                className="text-sm font-medium text-slate-700"
              >
                Target date{" "}
                <span className="font-normal text-slate-400">
                  (optional)
                </span>
              </label>

              <input
                id="targetDate"
                name="targetDate"
                type="date"
                min={today}
                className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            <div>
              <label
                htmlFor="color"
                className="text-sm font-medium text-slate-700"
              >
                Goal colour
              </label>

              <input
                id="color"
                name="color"
                type="color"
                defaultValue="#059669"
                className="mt-2 h-11 w-full cursor-pointer rounded-xl border border-slate-300 bg-white p-1.5"
              />
            </div>

            <button
              type="submit"
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              <Plus aria-hidden="true" className="size-4" />
              Create savings goal
            </button>
          </form>
        </aside>

        <div className="space-y-4">
          {goalRows.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <CircleDollarSign className="mx-auto size-10 text-slate-400" />

              <h3 className="mt-4 font-semibold text-slate-950">
                No savings goals yet
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Create your first target to begin planning.
              </p>
            </div>
          ) : (
            goalRows.map((goal) => {
              const monthsRemaining =
                getMonthsRemaining(goal.targetDate);

              const requiredMonthly =
                monthsRemaining && monthsRemaining > 0
                  ? goal.remainingAmount / monthsRemaining
                  : null;

              return (
                <article
                  key={goal.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="size-3 rounded-full"
                          style={{
                            backgroundColor: goal.color,
                          }}
                        />

                        <h3 className="font-semibold text-slate-950">
                          {goal.name}
                        </h3>

                        {goal.completed ? (
                          <CircleCheck className="size-5 text-emerald-600" />
                        ) : null}
                      </div>

                      <p className="mt-2 text-sm text-slate-500">
                        {formatCurrency(
                          goal.currentAmount,
                          currencyCode,
                        )}{" "}
                        of{" "}
                        {formatCurrency(
                          goal.targetAmount,
                          currencyCode,
                        )}
                      </p>
                    </div>

                    <DeleteGoalButton
                      goalId={goal.id}
                      goalName={goal.name}
                    />
                  </div>

                  <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          goal.percentageComplete,
                          100,
                        )}%`,
                        backgroundColor: goal.color,
                      }}
                    />
                  </div>

                  <div className="mt-3 flex justify-between text-sm">
                    <span className="font-semibold text-slate-700">
                      {goal.percentageComplete.toFixed(1)}%
                    </span>

                    <span className="text-slate-500">
                      {formatCurrency(
                        goal.remainingAmount,
                        currencyCode,
                      )}{" "}
                      remaining
                    </span>
                  </div>

                  {goal.targetDate ? (
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="flex items-center gap-2 text-xs text-slate-500">
                          <CalendarDays className="size-4" />
                          Target date
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {formatGoalDate(goal.targetDate)}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">
                          Suggested monthly saving
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {requiredMonthly !== null
                            ? formatCurrency(
                                requiredMonthly,
                                currencyCode,
                              )
                            : "Target date reached"}
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {!goal.completed ? (
                    <form
                      action={addGoalContribution.bind(
                        null,
                        goal.id,
                      )}
                      className="mt-5 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-[1fr_170px_auto]"
                    >
                      <input
                        name="amount"
                        type="number"
                        min="0.01"
                        step="0.01"
                        required
                        placeholder="Contribution amount"
                        className="h-10 rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-emerald-500"
                      />

                      <input
                        name="contributionDate"
                        type="date"
                        required
                        defaultValue={today}
                        className="h-10 rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-emerald-500"
                      />

                      <input
                        name="notes"
                        type="hidden"
                        value=""
                      />

                      <button
                        type="submit"
                        className="h-10 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
                      >
                        Add
                      </button>
                    </form>
                  ) : null}
                </article>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}