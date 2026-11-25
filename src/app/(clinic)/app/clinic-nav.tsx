"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { Building2, FileText, LayoutDashboard, Settings } from "lucide-react";

const NAV_ITEMS = [
  { href: "/app", label: "Genel Bakış", short: "Genel", icon: LayoutDashboard, exact: true },
  { href: "/app/plans", label: "Tedavi Planları", short: "Planlar", icon: FileText, exact: false },
  { href: "/app/clinic", label: "Klinik & Şablon", short: "Klinik", icon: Building2, exact: false },
  { href: "/app/settings", label: "Ayarlar", short: "Ayarlar", icon: Settings, exact: false },
] as const;

function ClinicNavContent() {
  const pathname = usePathname();

  return (
    <nav aria-label="Ana menü" className="flex gap-1 lg:flex-1 lg:flex-col lg:gap-1.5">
      {NAV_ITEMS.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`tp-nav-item group relative flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 lg:flex-none lg:flex-row lg:gap-3.5 lg:px-4 lg:py-3 ${
              isActive
                ? "bg-white/[0.08] text-white"
                : "text-white/45 hover:bg-white/[0.05] hover:text-white/90"
            }`}
          >
            {isActive && (
              <span className="tp-nav-indicator absolute inset-x-6 bottom-0 h-0.5 rounded-full bg-[#8eb4ff] lg:inset-x-auto lg:bottom-2 lg:left-0 lg:top-2 lg:h-auto lg:w-1" />
            )}
            <Icon className="size-5 shrink-0" strokeWidth={isActive ? 2 : 1.7} />
            <span className="text-[11px] font-semibold leading-none lg:hidden">
              {item.short}
            </span>
            <span className="hidden text-[15px] font-semibold lg:inline">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function ClinicNav() {
  return (
    <Suspense
      fallback={
        <nav className="flex gap-1 lg:flex-col lg:gap-1.5">
          <div className="h-12 flex-1 animate-pulse rounded-xl bg-white/10" />
          <div className="h-12 flex-1 animate-pulse rounded-xl bg-white/10" />
          <div className="h-12 flex-1 animate-pulse rounded-xl bg-white/10" />
        </nav>
      }
    >
      <ClinicNavContent />
    </Suspense>
  );
}
