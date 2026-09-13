import type { Metadata } from "next";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarClock,
  Pause,
  Play,
  Repeat2,
} from "lucide-react";
import { redirect } from "next/navigation";

import { toggleRecurringTransaction } from "@/app/(dashboard)/recurring/actions";
import { DeleteRecurringButton } from "@/components/recurring/delete-recurring-button";
import { RecurringForm } from "@/components/recurring/recurring-form";
import {
  formatCurrency,
  formatTransactionDate,
} from "@/lib/finance/format";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Recurring transactions",
};

type RecurringPageProps = {
  searchParams: Promise<{
    created?: string;
    updated?: string;
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

const frequencyLabels = {
  weekly: "Weekly",
  fortnightly: "Every two weeks",
  monthly: "Monthly",
  yearly: "Yearly",
};

export default async function RecurringPage({
  searchParams,
}: RecurringPageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub;

  if (claimsError || typeof userId !== "string") {
    redirect("/login");
  }

  const [
    { data: schedules, error: schedulesError },
    { data: accounts, error: accountsError },
    { data: categories, error: categoriesError },
    { data: profile },
  ] = await Promise.all([
    supabase
      .from("recurring_transactions")
      .select(`
        id,
        type,
        amount,
        description,
        frequency,
        next_occurrence,
        end_date,
        is_active,
        account:accounts!recurring_account_owner_fk(name),
        category:categories!recurring_category_owner_fk(name, color)
      `)
      .eq("user_id", userId)
      .order("is_active", { ascending: false })
      .order("next_occurrence"),

    supabase
      .from("accounts")
      .select("id, name")
      .eq("user_id", userId)
      .eq("is_archived", false)
      .order("name"),

    supabase
      .from("categories")
      .select("id, name, type")
      .eq("user_id", userId)
      .order("name"),

    supabase
      .from("profiles")
      .select("currency_code")
      .eq("id", userId)
      .single(),
  ]);

  if (
    schedulesError ||
    accountsError ||
    categoriesError
  ) {
    console.error("Recurring page query failed:", {
      schedulesError,
      accountsError,
      categoriesError,
    });

    throw new Error("Unable to load recurring transactions.");
  }

  const currencyCode = profile?.currency_code ?? "AUD";

  return (
    <section>
      {(params.created ||
        params.updated ||
        params.deleted) && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Recurring schedule saved successfully.
        </div>
      )}

      {params.error ? (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          The recurring schedule operation could not be completed.
        </div>
      ) : null}

      <div>
        <p className="text-sm font-medium text-emerald-700">

          Automation
        </p>

        <h2 className="mt-1 text-2xl font-bold text-slate-950">
          Recurring transactions
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Schedule regular income, subscriptions and bills.
        </p>
      </div>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-950">
            New schedule
          </h3>

          <div className="mt-5">
            <RecurringForm
              accounts={accounts ?? []}
              categories={categories ?? []}
              today={getMelbourneDate()}
            />
          </div>
        </aside>

        <div className="space-y-4">
          {(schedules ?? []).length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <Repeat2 className="mx-auto size-10 text-slate-400" />

              <h3 className="mt-4 font-semibold text-slate-950">
                No recurring schedules
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Create a schedule for regular income or expenses.
              </p>
            </div>
          ) : (
            (schedules ?? []).map((schedule) => {
              const account = Array.isArray(schedule.account)
                ? schedule.account[0]
                : schedule.account;

              const category = Array.isArray(schedule.category)
                ? schedule.category[0]
                : schedule.category;

              const income = schedule.type === "income";

              return (
                <article
                  key={schedule.id}
                  className={`rounded-2xl border bg-white p-5 shadow-sm ${
                    schedule.is_active
                      ? "border-slate-200"
                      : "border-slate-200 opacity-65"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
                        income
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {income ? (
                        <ArrowUpRight className="size-5" />
                      ) : (
                        <ArrowDownRight className="size-5" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-slate-950">
                            {schedule.description}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            {category?.name ?? "Uncategorised"}
                            {" · "}
                            {account?.name ?? "Unknown account"}
                          </p>
                        </div>

                        <p
                          className={`font-bold ${
                            income
                              ? "text-emerald-700"
                              : "text-slate-950"
                          }`}
                        >
                          {income ? "+" : "−"}
                          {formatCurrency(
                            Number(schedule.amount),
                            currencyCode,
                          )}
                        </p>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
                          {frequencyLabels[schedule.frequency]}
                        </span>

                        <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                          <CalendarClock className="size-3.5" />
                          Next:{" "}
                          {formatTransactionDate(
                            schedule.next_occurrence,
                          )}
                        </span>
                      </div>

                      <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-4">
                        <form
                          action={toggleRecurringTransaction.bind(
                            null,
                            schedule.id,
                            !schedule.is_active,
                          )}
                        >
                          <button
                            type="submit"
                            className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            {schedule.is_active ? (
                              <Pause className="size-4" />
                            ) : (
                              <Play className="size-4" />
                            )}

                            {schedule.is_active
                              ? "Pause"
                              : "Resume"}
                          </button>
                        </form>

                        <DeleteRecurringButton
                          recurringId={schedule.id}
                          description={schedule.description}
                        />
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}