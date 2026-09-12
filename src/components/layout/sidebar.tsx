"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartNoAxesCombined,
  LayoutDashboard,
  PiggyBank,
  ReceiptText,
  Repeat2,
  Settings,
  Target,
  WalletCards,
} from "lucide-react";

const navigationItems = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Transactions",
    href: "/transactions",
    icon: ReceiptText,
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: ChartNoAxesCombined,
  },
  {
    label: "Budgets",
    href: "/budgets",
    icon: WalletCards,
  },
  {
    label: "Savings goals",
    href: "/goals",
    icon: Target,
  },
  {
    label: "Recurring",
    href: "/recurring",
    icon: Repeat2,
  },
];

function isActiveRoute(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white lg:flex lg:flex-col">
      <div className="flex h-20 items-center gap-3 px-6">
        <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
          <PiggyBank aria-hidden="true" className="size-6" />
        </div>

        <div>
          <p className="text-lg font-bold tracking-tight text-slate-950">
            CashFlow
          </p>
          <p className="text-xs text-slate-500">Personal finance</p>
        </div>
      </div>

      <nav aria-label="Main navigation" className="flex-1 px-3 py-5">
        <ul className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActiveRoute(pathname, item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  <Icon aria-hidden="true" className="size-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-slate-200 p-3">
        <Link
          href="/settings"
          aria-current={pathname === "/settings" ? "page" : undefined}
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
            pathname === "/settings"
              ? "bg-emerald-50 text-emerald-700"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
          }`}
        >
          <Settings aria-hidden="true" className="size-5" />
          Settings
        </Link>
      </div>
    </aside>
  );
}