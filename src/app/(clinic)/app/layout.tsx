import Link from "next/link";
import { connection } from "next/server";
import { Suspense, type ReactNode } from "react";

import { getRuntime } from "@/bootstrap";
import { readRawSession } from "@/platform/auth/session";
import { Mark } from "@/ui/mark";
import { AppTabs } from "./app-tabs";
import { ClinicNav } from "./clinic-nav";
import { LogoutButton } from "./logout-button";
import { MotionShell } from "./motion-shell";

/**
 * Persistent app shell. The sidebar and header are fixed and sit above page
 * modals (z-55), so they stay visible on every /app screen.
 *
 * Palette: premium white field, black drawer, navy accents.
 */
export default function ClinicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-[#f7f8fa]">
      {/* Çok hafif lacivert ambient — parlak renk yok */}
      <div className="pointer-events-none fixed -left-40 -top-40 size-[26rem] rounded-full bg-[#0b1f4d]/[0.04] blur-3xl" />
      <div className="pointer-events-none fixed -bottom-48 right-0 size-[28rem] rounded-full bg-slate-300/25 blur-3xl" />

      {/* Sol sabit menü — siyah drawer */}
      <aside className="fixed inset-x-3 bottom-3 z-[55] rounded-2xl bg-[#0a0a0a] p-1.5 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.55)] lg:inset-y-0 lg:left-0 lg:right-auto lg:bottom-0 lg:flex lg:w-60 lg:flex-col lg:rounded-none lg:border-r lg:border-white/5 lg:p-4 lg:shadow-none">
        <Link
          href="/app"
          aria-label="Treatment+"
          className="mb-6 hidden items-center gap-3 px-1 pt-1 lg:flex"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-white">
            <Mark className="size-6" />
          </span>
          <span className="text-lg font-bold tracking-tight text-white">
            Treatment<span className="text-[#8eb4ff]">+</span>
          </span>
        </Link>

        <ClinicNav />
      </aside>

      {/* Sabit header — beyaz premium */}
      <header className="fixed left-3 right-3 top-3 z-[55] flex h-16 items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-3 shadow-[0_8px_30px_-18px_rgba(15,23,42,0.18)] sm:px-4 lg:left-[16.5rem] lg:right-5 lg:top-5">
        <Link href="/app" className="flex shrink-0 items-center lg:hidden" aria-label="Treatment+">
          <Mark className="size-7" />
        </Link>

        <Suspense fallback={<div className="min-w-0 flex-1" />}>
          <AppTabs />
        </Suspense>

        <Suspense fallback={<div className="h-9 w-24 animate-pulse rounded-lg bg-slate-100" />}>
          <SessionChip />
        </Suspense>
      </header>

      <div className="relative flex min-h-dvh flex-col px-3 pb-24 pt-[5.5rem] lg:pb-5 lg:pl-[16.5rem] lg:pr-5 lg:pt-[6.75rem]">
        <main className="min-w-0 flex-1">
          <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-white/40" />}>
            <MotionShell>{children}</MotionShell>
          </Suspense>
        </main>
      </div>
    </div>
  );
}

async function SessionChip() {
  await connection();
  const { config } = getRuntime();
  const session = await readRawSession(config);
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      {session && <LogoutButton />}
    </div>
  );
}
