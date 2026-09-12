import type { ReactNode } from "react";
import Link from "next/link";
import { ChartNoAxesCombined, PiggyBank, ShieldCheck } from "lucide-react";

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-2">
      <section className="flex items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 inline-flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <PiggyBank aria-hidden="true" className="size-6" />
            </span>

            <span>
              <span className="block text-xl font-bold tracking-tight text-slate-950">
                CashFlow
              </span>
              <span className="block text-xs text-slate-500">
                Personal finance
              </span>
            </span>
          </Link>

          {children}
        </div>
      </section>

      <section className="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 size-80 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -bottom-32 left-12 size-96 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
            Financial clarity
          </p>

          <h1 className="mt-5 max-w-lg text-4xl font-bold leading-tight tracking-tight">
            Understand where your money goes and plan where it should take you.
          </h1>

          <p className="mt-5 max-w-lg leading-7 text-slate-300">
            Track cash flow, monitor budgets and turn savings targets into
            achievable plans.
          </p>
        </div>

        <div className="relative grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <ChartNoAxesCombined className="size-6 text-emerald-400" />

            <p className="mt-4 font-semibold">Clear analytics</p>

            <p className="mt-1 text-sm leading-6 text-slate-400">
              Visualise income, spending and trends without spreadsheet work.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <ShieldCheck className="size-6 text-emerald-400" />

            <p className="mt-4 font-semibold">Private by design</p>

            <p className="mt-1 text-sm leading-6 text-slate-400">
              Your financial records remain separated from every other user.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}