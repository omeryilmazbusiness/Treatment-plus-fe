import Link from "next/link";
import { connection } from "next/server";
import { Suspense, type ReactNode } from "react";
import { LogOut } from "lucide-react";

import { logoutClinicAction } from "@/app/login/actions";
import { getRuntime } from "@/bootstrap";
import { resolveActiveSession } from "@/platform/auth/session";
import { Mark } from "@/ui/mark";
import { ClinicNav } from "./clinic-nav";

export default function ClinicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-slate-50 lg:grid lg:grid-cols-[260px_1fr]">
      {/* Sol Sidebar */}
      <aside className="flex flex-col justify-between border-b border-slate-200 bg-white px-5 py-6 lg:border-b-0 lg:border-r">
        <div>
          <Link href="/app" className="flex items-center gap-3">
            <Mark className="size-8" />
            <div>
              <span className="block text-base font-bold tracking-tight text-slate-900">
                Treatment<span className="text-blue-600">+</span>
              </span>
              <span className="block text-[11px] font-medium text-slate-400">
                3D Dental SaaS
              </span>
            </div>
          </Link>

          <ClinicNav />
        </div>

        {/* Alt Bilgi */}
        <div className="mt-8 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 text-xs text-slate-500">
          <p className="font-semibold text-slate-700">Treatment Plus v2.0</p>
          <p className="mt-0.5 text-[11px] text-slate-400">Klinik Yönetim Altyapısı</p>
        </div>
      </aside>

      {/* Sağ Ana İçerik */}
      <div className="flex flex-col min-h-dvh">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 lg:px-10">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-slate-900">Klinik Yönetim Paneli</span>
          </div>

          <Suspense
            fallback={
              <div className="h-7 w-28 animate-pulse rounded-full bg-slate-100" />
            }
          >
            <SessionChip />
          </Suspense>
        </header>

        <main className="flex-1 bg-slate-50 p-6 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}

async function SessionChip() {
  await connection();
  const { config, backend } = getRuntime();
  const session = await resolveActiveSession(config, backend);

  return (
    <div className="flex items-center gap-3">
      {session?.userEmail && (
        <span className="hidden text-xs font-medium text-slate-600 sm:inline">
          {session.userEmail}
        </span>
      )}
      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-800">
        {(session?.role ?? "owner").toUpperCase()}
      </span>
      {session && (
        <form action={logoutClinicAction}>
          <button
            type="submit"
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-2xs transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
          >
            <LogOut className="size-3.5" />
            <span>Çıkış Yap</span>
          </button>
        </form>
      )}
    </div>
  );
}
