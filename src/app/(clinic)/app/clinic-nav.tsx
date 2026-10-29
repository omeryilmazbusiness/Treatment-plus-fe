"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, FileText, LayoutDashboard } from "lucide-react";

const NAV_ITEMS = [
  {
    href: "/app",
    label: "Genel Bakış",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/app/plans",
    label: "Tedavi Planları",
    icon: FileText,
    exact: false,
  },
  {
    href: "/app/clinic",
    label: "Klinik & Şablon",
    icon: Building2,
    exact: false,
  },
] as const;

export function ClinicNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-6 space-y-1.5">
      <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
        Yönetim Paneli
      </div>
      {NAV_ITEMS.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-all duration-200 ${
              isActive
                ? "bg-slate-900 text-white font-semibold shadow-xs"
                : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-950 font-medium"
            }`}
          >
            <Icon
              className={`size-4.5 transition-colors ${
                isActive ? "text-white" : "text-slate-400 group-hover:text-slate-700"
              }`}
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

