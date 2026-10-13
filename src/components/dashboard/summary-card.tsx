import type { LucideIcon } from "lucide-react";

type SummaryCardProps = {
  title: string;
  amount: string;
  description: string;
  icon: LucideIcon;
  variant?: "default" | "income" | "expense";
};

const variantStyles = {
  default: {
    icon:
      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    amount: "text-slate-950 dark:text-white",
  },
  income: {
    icon:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
    amount: "text-emerald-700 dark:text-emerald-400",
  },
  expense: {
    icon:
      "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400",
    amount: "text-rose-700 dark:text-rose-400",
  },
};

export function SummaryCard({
  title,
  amount,
  description,
  icon: Icon,
  variant = "default",
}: SummaryCardProps) {
  const styles = variantStyles[variant];

  return (
    <article className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>

          <p className={`mt-3 text-2xl font-bold tracking-tight ${styles.amount}`}>
            {amount}
          </p>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </div>

        <div className={`rounded-xl p-3 ${styles.icon}`}>
          <Icon aria-hidden="true" className="size-5" />
        </div>
      </div>
    </article>
  );
}