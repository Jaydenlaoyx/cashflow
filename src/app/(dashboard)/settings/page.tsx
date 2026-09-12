import type { Metadata } from "next";
import { LogOut, Settings } from "lucide-react";

import { signOut } from "@/app/(auth)/actions";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <section className="mx-auto max-w-3xl">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <Settings aria-hidden="true" className="size-6" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              Account settings
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Profile, currency, category and appearance settings will be added
              after the financial database is ready.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-rose-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-950">Log out</h2>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          End your current CashFlow session on this device.
        </p>

        <form action={signOut}>
          <button
            type="submit"
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
          >
            <LogOut aria-hidden="true" className="size-4" />
            Log out
          </button>
        </form>
      </div>
    </section>
  );
}