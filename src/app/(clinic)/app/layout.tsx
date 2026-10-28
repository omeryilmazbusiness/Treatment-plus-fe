import Link from "next/link";
import { connection } from "next/server";
import { Suspense, type ReactNode } from "react";

import { logoutClinicAction } from "@/app/login/actions";
import { getRuntime } from "@/bootstrap";
import { resolveActiveSession } from "@/platform/auth/session";
import { Badge } from "@/ui/badge";
import { Mark } from "@/ui/mark";

const nav = [
  { href: "/app", label: "Özet", phase: "0" },
  { href: "/app/plans", label: "Planlar", phase: "4" },
  { href: "/app", label: "Klinik", phase: "2" },
] as const;

export default function ClinicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-line px-5 py-6 lg:border-b-0 lg:border-r">
        <Link href="/" className="flex items-center gap-3 text-teal-deep">
          <Mark className="size-7" />
          <span className="text-sm font-semibold">Treatment Plus</span>
        </Link>
        <nav className="mt-8 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-ink hover:bg-paper-2"
            >
              {item.label}
              <Badge>Faz {item.phase}</Badge>
            </Link>
          ))}
        </nav>
      </aside>
      <div>
        <header className="flex items-center justify-between border-b border-line px-6 py-4">
          <p className="text-sm text-ink-soft">Klinik uygulaması</p>
          <Suspense fallback={<Badge tone="wait">oturum</Badge>}>
            <SessionChip />
          </Suspense>
        </header>
        {children}
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
        <span className="hidden text-xs font-medium text-ink-soft sm:inline">
          {session.userEmail}
        </span>
      )}
      <Badge tone="ok">{(session?.role ?? "owner").toUpperCase()}</Badge>
      {session && (
        <form action={logoutClinicAction}>
          <button
            type="submit"
            className="cursor-pointer rounded-lg border border-line bg-paper-2 px-3 py-1 text-xs font-medium text-ink-soft transition hover:border-danger/40 hover:text-danger"
          >
            Çıkış Yap
          </button>
        </form>
      )}
    </div>
  );
}
