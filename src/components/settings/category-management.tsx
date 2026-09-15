import {
  Archive,
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  RotateCcw,
  Tags,
} from "lucide-react";

import {
  createCategory,
  setCategoryArchived,
} from "@/app/(dashboard)/settings/actions";

type CategoryItem = {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
  isDefault: boolean;
  isArchived: boolean;
};

type CategoryManagementProps = {
  categories: CategoryItem[];
};

export function CategoryManagement({
  categories,
}: CategoryManagementProps) {
  const incomeCategories = categories.filter(
    (category) => category.type === "income",
  );

  const expenseCategories = categories.filter(
    (category) => category.type === "expense",
  );

  return (
    <article className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
          <Tags className="size-5" />
        </div>

        <div>
          <h3 className="font-semibold text-slate-950">
            Transaction categories
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Create and manage income and expense categories.
          </p>
        </div>
      </div>

      <form
        action={createCategory}
        className="mt-6 grid gap-4 rounded-xl bg-slate-50 p-4 md:grid-cols-[minmax(180px,1fr)_180px_90px_auto]"
      >
        <div>
          <label
            htmlFor="categoryName"
            className="text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Name
          </label>

          <input
            id="categoryName"
            name="name"
            required
            maxLength={50}
            placeholder="Pet care"
            className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />
        </div>

        <div>
          <label
            htmlFor="categoryType"
            className="text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Type
          </label>

          <select
            id="categoryType"
            name="type"
            defaultValue="expense"
            className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="categoryColor"
            className="text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Colour
          </label>

          <input
            id="categoryColor"
            name="color"
            type="color"
            defaultValue="#059669"
            className="mt-2 h-11 w-full cursor-pointer rounded-xl border border-slate-300 bg-white p-1.5"
          />
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <Plus className="size-4" />
            Add
          </button>
        </div>
      </form>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <CategoryGroup
          title="Expense categories"
          type="expense"
          categories={expenseCategories}
        />

        <CategoryGroup
          title="Income categories"
          type="income"
          categories={incomeCategories}
        />
      </div>
    </article>
  );
}

function CategoryGroup({
  title,
  type,
  categories,
}: {
  title: string;
  type: "income" | "expense";
  categories: CategoryItem[];
}) {
  return (
    <section>
      <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        {type === "income" ? (
          <ArrowUpRight className="size-4 text-emerald-600" />
        ) : (
          <ArrowDownRight className="size-4 text-rose-600" />
        )}

        {title}
      </h4>

      <div className="mt-3 space-y-2">
        {categories.map((category) => (
          <div
            key={category.id}
            className={`flex items-center gap-3 rounded-xl border border-slate-200 p-3 ${
              category.isArchived
                ? "bg-slate-50 opacity-65"
                : "bg-white"
            }`}
          >
            <span
              className="size-3 shrink-0 rounded-full"
              style={{
                backgroundColor: category.color,
              }}
            />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-medium text-slate-800">
                  {category.name}
                </p>

                {category.isDefault ? (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Default
                  </span>
                ) : null}

                {category.isArchived ? (
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                    Archived
                  </span>
                ) : null}
              </div>
            </div>

            <form
              action={setCategoryArchived.bind(
                null,
                category.id,
                !category.isArchived,
              )}
            >
              <button
                type="submit"
                title={
                  category.isArchived
                    ? "Restore category"
                    : "Archive category"
                }
                aria-label={
                  category.isArchived
                    ? `Restore ${category.name}`
                    : `Archive ${category.name}`
                }
                className="flex size-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                {category.isArchived ? (
                  <RotateCcw className="size-4" />
                ) : (
                  <Archive className="size-4" />
                )}
              </button>
            </form>
          </div>
        ))}
      </div>
    </section>
  );
}