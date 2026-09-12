import Link from "next/link";
import {
  ChartNoAxesCombined,
  LayoutDashboard,
  ReceiptText,
  Target,
  WalletCards,
} from "lucide-react";

const navigationItems = [
  {
    label: "Home",
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
    label: "Goals",
    href: "/goals",
    icon: Target,
  },
];

export function MobileNavigation() {
  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="grid grid-cols-5">
        {navigationItems.map((item, index) => {
          const Icon = item.icon;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium ${
                  index === 0 ? "text-emerald-700" : "text-slate-500"
                }`}
              >
                <Icon aria-hidden="true" className="size-5" />
                <span className="max-w-full truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}