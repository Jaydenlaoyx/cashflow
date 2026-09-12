import type { Metadata } from "next";
import Link from "next/link";
import { MailCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Check your email",
};

type CheckEmailPageProps = {
  searchParams: Promise<{
    email?: string;
  }>;
};

export default async function CheckEmailPage({
  searchParams,
}: CheckEmailPageProps) {
  const { email } = await searchParams;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
        <MailCheck aria-hidden="true" className="size-7" />
      </div>

      <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">
        Check your email
      </h1>

      <p className="mt-3 text-sm leading-6 text-slate-500">
        We sent a confirmation link
        {email ? (
          <>
            {" "}
            to <span className="font-medium text-slate-700">{email}</span>
          </>
        ) : null}
        . Open it to activate your CashFlow account.
      </p>

      <Link
        href="/login"
        className="mt-7 inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700"
      >
        Return to login
      </Link>
    </section>
  );
}