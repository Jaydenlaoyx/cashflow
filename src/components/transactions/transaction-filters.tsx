import Link from "next/link";
import { Filter, Search, X } from "lucide-react";

type TransactionFiltersProps = {
  search: string;
  type: string;
  from: string;
  to: string;
};

export function TransactionFilters({
  search,
  type,
  from,
  to,
}: TransactionFiltersProps) {
  const hasFilters = Boolean(search || type || from || to);

  return (
    <form
      action="/transactions"
      method="get"
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(220px,1fr)_160px_170px_170px_auto]">
        <div>
          <label
            htmlFor="search"
            className="text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Search
          </label>

          <div className="relative mt-2">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            />

            <input
              id="search"
              name="search"
              type="search"
              defaultValue={search}
              placeholder="Description or merchant"
              className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="type"
            className="text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Type
          </label>

          <select
            id="type"
            name="type"
            defaultValue={type}
            className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          >
            <option value="">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="from"
            className="text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            From
          </label>

          <input
            id="from"
            name="from"
            type="date"
            defaultValue={from}
            className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />
        </div>

        <div>
          <label
            htmlFor="to"
            className="text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            To
          </label>

          <input
            id="to"
            name="to"
            type="date"
            defaultValue={to}
            className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />
        </div>

        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 lg:flex-none"
          >
            <Filter aria-hidden="true" className="size-4" />
            Apply
          </button>

          {hasFilters ? (
            <Link
              href="/transactions"
              aria-label="Clear filters"
              title="Clear filters"
              className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-50"
            >
              <X aria-hidden="true" className="size-4" />
            </Link>
          ) : null}
        </div>
      </div>
    </form>
  );
}