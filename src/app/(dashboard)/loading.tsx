export default function DashboardLoading() {
  return (
    <div
      role="status"
      aria-label="Loading page"
      className="animate-pulse space-y-6"
    >
      <span className="sr-only">Loading...</span>

      <div className="space-y-2">
        <div className="h-8 w-48 rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-72 max-w-full rounded bg-slate-200 dark:bg-slate-800" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-32 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="mt-5 h-7 w-32 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="h-80 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="h-5 w-40 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="mt-8 h-56 rounded-lg bg-slate-100 dark:bg-slate-800/70" />
          </div>
        ))}
      </div>
    </div>
  );
}