import type { LucideIcon } from "lucide-react";

type FeaturePlaceholderProps = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export function FeaturePlaceholder({
  title,
  description,
  icon: Icon,
}: FeaturePlaceholderProps) {
  return (
    <section className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
          <Icon aria-hidden="true" className="size-7" />
        </div>

        <h2 className="mt-5 text-xl font-bold tracking-tight text-slate-950">
          {title}
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          {description}
        </p>

        <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8">
          <p className="text-sm font-medium text-slate-500">
            This feature will be built in an upcoming step.
          </p>
        </div>
      </div>
    </section>
  );
}