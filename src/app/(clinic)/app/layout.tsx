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
 */
export default function ClinicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-[linear-gradient(135deg,#e0f2fe_0%,#e0e7ff_45%,#fae8ff_100%)]">
      {/* Soft ambient light */}
      <div className="pointer-events-none fixed -left-32 -top-32 size-[28rem] rounded-full bg-sky-300/50 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-40 right-0 size-[32rem] rounded-full bg-indigo-300/45 blur-3xl" />
      <div className="pointer-events-none fixed left-1/3 top-1/2 size-[24rem] rounded-full bg-cyan-300/30 blur-3xl" />

      {/* Sol sabit menü (masaüstü) / alt bar (mobil) */}
      <aside className="fixed inset-x-3 bottom-3 z-[55] rounded-2xl bg-gradient-to-b from-[#0b1f4d] via-[#1e1b6b] to-[#4c1d95] p-1.5 shadow-[0_12px_40px_-12px_rgba(30,27,107,0.6)] lg:inset-y-0 lg:left-0 lg:right-auto lg:bottom-0 lg:flex lg:w-60 lg:flex-col lg:rounded-none lg:p-4 lg:shadow-[8px_0_40px_-16px_rgba(30,27,107,0.5)]">
        <Link
          href="/app"
          aria-label="Treatment+"
          className="mb-6 hidden items-center gap-3 px-1 pt-1 lg:flex"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-white">
            <Mark className="size-6" />
          </span>
          <span className="text-lg font-bold tracking-tight text-white">
            Treatment<span className="text-sky-300">+</span>
          </span>
        </Link>

        <ClinicNav />
      </aside>

      {/* Sabit header */}
      <header className="fixed left-3 right-3 top-3 z-[55] flex h-16 items-center gap-3 rounded-2xl border border-white/70 bg-white/55 px-3 shadow-[0_10px_40px_-16px_rgba(79,70,229,0.35)] backdrop-blur-2xl sm:px-4 lg:left-[16.5rem] lg:right-5 lg:top-5">
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
  const email = session?.userEmail ?? "";

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      {email && (
        <span className="hidden max-w-60 truncate text-sm font-medium text-slate-600 xl:inline">
          {email}
        </span>
      )}
      {session && <LogoutButton />}
    </div>
  );
}
