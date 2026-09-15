import type { Metadata } from "next";
import {
  Archive,
  Banknote,
  CircleDollarSign,
  Eye,
  EyeOff,
  Landmark,
  LogOut,
  Plus,
  RotateCcw,
  Settings,
  WalletCards,
} from "lucide-react";
import { redirect } from "next/navigation";

import { signOut } from "@/app/(auth)/actions";
import {
  createAccount,
  setAccountArchived,
  setAccountIncluded,
  updateCurrency,
} from "@/app/(dashboard)/settings/actions";
import { formatCurrency } from "@/lib/finance/format";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Settings",
};

type SettingsPageProps = {
  searchParams: Promise<{
    currencyUpdated?: string;
    accountCreated?: string;
    accountUpdated?: string;
    accountArchived?: string;
    accountRestored?: string;
    error?: string;
  }>;
};

const accountTypeLabels = {
  cash: "Cash",
  checking: "Everyday / checking",
  savings: "Savings",
  credit: "Credit card",
  investment: "Investment",
  other: "Other",
};

const currencies = [
  { code: "AUD", name: "Australian Dollar" },
  { code: "USD", name: "US Dollar" },
  { code: "NZD", name: "New Zealand Dollar" },
  { code: "GBP", name: "British Pound" },
  { code: "EUR", name: "Euro" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "MYR", name: "Malaysian Ringgit" },
  { code: "SGD", name: "Singapore Dollar" },
  { code: "CNY", name: "Chinese Yuan" },
];

function AccountIcon({
  type,
}: {
  type: keyof typeof accountTypeLabels;
}) {
  if (type === "cash") {
    return <Banknote className="size-5" />;
  }

  if (type === "credit") {
    return <WalletCards className="size-5" />;
  }

  if (type === "investment") {
    return <CircleDollarSign className="size-5" />;
  }

  return <Landmark className="size-5" />;
}

function getErrorMessage(error?: string) {
  switch (error) {
    case "last-active-account":
      return "You must keep at least one active account.";
    case "invalid-currency":
      return "Select a supported currency.";
    case "invalid-account":
      return "Check the account details and try again.";
    default:
      return error
        ? "The requested settings change could not be completed."
        : null;
  }
}

export default async function SettingsPage({
  searchParams,
}: SettingsPageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub;

  if (claimsError || typeof userId !== "string") {
    redirect("/login");
  }

  const [
    { data: profile, error: profileError },
    { data: accounts, error: accountsError },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, currency_code, timezone")
      .eq("id", userId)
      .single(),

    supabase
      .from("accounts")
      .select(
        `
          id,
          name,
          type,
          starting_balance,
          include_in_total,
          is_archived
        `,
      )
      .eq("user_id", userId)
      .order("is_archived")
      .order("created_at"),
  ]);

  if (profileError || accountsError) {
    console.error("Settings query failed:", {
      profileError,
      accountsError,
    });

    throw new Error("Unable to load settings.");
  }

  const currencyCode = profile.currency_code;
  const errorMessage = getErrorMessage(params.error);

  const success =
    params.currencyUpdated ||
    params.accountCreated ||
    params.accountUpdated ||
    params.accountArchived ||
    params.accountRestored;

  return (
    <section className="mx-auto max-w-5xl">
      {success ? (
        <div
          role="status"
          className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          Settings updated successfully.
        </div>
      ) : null}

      {errorMessage ? (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {errorMessage}
        </div>
      ) : null}

      <div>
        <p className="text-sm font-medium text-emerald-700">
          Preferences
        </p>

        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
          Account settings
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Manage your financial accounts and display preferences.
        </p>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Settings className="size-5" />
            </div>

            <div>
              <h3 className="font-semibold text-slate-950">
                Display preferences
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Choose how financial amounts are displayed.
              </p>
            </div>
          </div>

          <form action={updateCurrency} className="mt-6">
            <label
              htmlFor="currencyCode"
              className="text-sm font-medium text-slate-700"
            >
              Primary currency
            </label>

            <select
              id="currencyCode"
              name="currencyCode"
              defaultValue={currencyCode}
              className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            >
              {currencies.map((currency) => (
                <option
                  key={currency.code}
                  value={currency.code}
                >
                  {currency.code} — {currency.name}
                </option>
              ))}
            </select>

            <p className="mt-2 text-xs leading-5 text-amber-700">
              Changing currency changes display formatting only. It
              does not convert existing amounts using exchange rates.
            </p>

            <button
              type="submit"
              className="mt-5 h-10 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Save currency
            </button>
          </form>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-950">
            Add financial account
          </h3>

          <form action={createAccount} className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="accountName"
                className="text-sm font-medium text-slate-700"
              >
                Account name
              </label>

              <input
                id="accountName"
                name="name"
                required
                maxLength={80}
                placeholder="Savings account"
                className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            <div>
              <label
                htmlFor="accountType"
                className="text-sm font-medium text-slate-700"
              >
                Account type
              </label>

              <select
                id="accountType"
                name="type"
                defaultValue="savings"
                className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              >
                {Object.entries(accountTypeLabels).map(
                  ([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div>
              <label
                htmlFor="startingBalance"
                className="text-sm font-medium text-slate-700"
              >
                Starting balance
              </label>

              <input
                id="startingBalance"
                name="startingBalance"
                type="number"
                step="0.01"
                required
                defaultValue="0"
                className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            <label className="flex items-start gap-3">
              <input
                name="includeInTotal"
                type="checkbox"
                defaultChecked
                className="mt-1 size-4 rounded border-slate-300 text-emerald-600"
              />

              <span>
                <span className="block text-sm font-medium text-slate-700">
                  Include in current balance
                </span>

                <span className="block text-xs leading-5 text-slate-500">
                  Include this account in dashboard totals.
                </span>
              </span>
            </label>

            <button
              type="submit"
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <Plus className="size-4" />
              Add account
            </button>
          </form>
        </article>
      </div>

      <article className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-slate-950">
          Your accounts
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Archived accounts retain their historical transactions.
        </p>

        <div className="mt-5 space-y-3">
          {(accounts ?? []).map((account) => (
            <div
              key={account.id}
              className={`flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center ${
                account.is_archived
                  ? "border-slate-200 bg-slate-50 opacity-70"
                  : "border-slate-200"
              }`}
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <AccountIcon type={account.type} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-900">
                    {account.name}
                  </p>

                  {account.is_archived ? (
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
                      Archived
                    </span>
                  ) : null}
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  {accountTypeLabels[account.type]}
                  {" · Starting balance "}
                  {formatCurrency(
                    Number(account.starting_balance),
                    currencyCode,
                  )}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {!account.is_archived ? (
                  <form
                    action={setAccountIncluded.bind(
                      null,
                      account.id,
                      !account.include_in_total,
                    )}
                  >
                    <button
                      type="submit"
                      className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      {account.include_in_total ? (
                        <Eye className="size-4" />
                      ) : (
                        <EyeOff className="size-4" />
                      )}

                      {account.include_in_total
                        ? "Included"
                        : "Excluded"}
                    </button>
                  </form>
                ) : null}

                <form
                  action={setAccountArchived.bind(
                    null,
                    account.id,
                    !account.is_archived,
                  )}
                >
                  <button
                    type="submit"
                    className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {account.is_archived ? (
                      <RotateCcw className="size-4" />
                    ) : (
                      <Archive className="size-4" />
                    )}

                    {account.is_archived
                      ? "Restore"
                      : "Archive"}
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className="mt-6 rounded-2xl border border-rose-200 bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-slate-950">
          Log out
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          End your CashFlow session on this device.
        </p>

        <form action={signOut}>
          <button
            type="submit"
            className="mt-5 flex h-10 items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 hover:bg-rose-100"
          >
            <LogOut className="size-4" />
            Log out
          </button>
        </form>
      </article>
    </section>
  );
}