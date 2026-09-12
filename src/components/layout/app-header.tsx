import { Bell, Menu, Plus } from "lucide-react";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-slate-50/90 backdrop-blur">
      <div className="flex h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            aria-label="Open navigation menu"
            className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 lg:hidden"
          >
            <Menu aria-hidden="true" className="size-5" />
          </button>

          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold tracking-tight text-slate-950">
              Dashboard
            </h1>
            <p className="hidden text-sm text-slate-500 sm:block">
              Here’s an overview of your finances.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-label="View notifications"
            className="flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
          >
            <Bell aria-hidden="true" className="size-5" />
          </button>

          <button
            type="button"
            className="flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-3 text-sm font-semibold text-white transition hover:bg-emerald-700 sm:px-4"
          >
            <Plus aria-hidden="true" className="size-4" />
            <span className="hidden sm:inline">Add transaction</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>
    </header>
  );
}