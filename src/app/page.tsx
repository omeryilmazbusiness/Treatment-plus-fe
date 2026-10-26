import { cacheLife } from "next/cache";
import Link from "next/link";

import { Badge } from "@/ui/badge";
import { Mark } from "@/ui/mark";

const contexts = [
  { name: "identity", phase: "1", href: "/login" },
  { name: "clinic", phase: "2", href: "/app" },
  { name: "catalog", phase: "3", href: "/app" },
  { name: "plan", phase: "4", href: "/app" },
  { name: "media", phase: "5–7", href: "/app" },
  { name: "output", phase: "5–7", href: "/app" },
  { name: "share", phase: "6", href: "/p/demo" },
  { name: "ai", phase: "8", href: "/app" },
] as const;

export default async function HomePage() {
  "use cache";
  cacheLife("days");

  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3 text-teal-deep">
          <Mark className="size-8" />
          <div>
            <p className="text-sm font-semibold tracking-tight">Treatment Plus</p>
            <p className="text-xs text-ink-soft">Tedavi Planı Platformu</p>
          </div>
        </div>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/healthz" className="text-ink-soft hover:text-ink">
            healthz
          </Link>
          <Link href="/readyz" className="text-ink-soft hover:text-ink">
            readyz
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-teal-deep px-4 py-2 text-paper-2 transition hover:bg-teal"
          >
            Klinik girişi
          </Link>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 pb-24">
        <section className="grid gap-12 border-t border-line pt-16 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <Badge>Faz 0 · kabuk</Badge>
            <h1 className="mt-5 max-w-xl font-serif text-5xl leading-[1.1] tracking-tight text-ink md:text-6xl">
              Klinik için plan. Hasta için net öneri.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-ink-soft">
              Next.js BFF. Cookie bu origin’de kalır; tarayıcı Go API’ye
              konuşmaz. Sunucu bileşenleri, Cache Components ve hexagonal
              bounded context’ler backend ile aynı sınırları paylaşır.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/app"
                className="rounded-full bg-ink px-5 py-2.5 text-sm text-paper-2"
              >
                Klinik kabuğu
              </Link>
              <Link
                href="/p/demo"
                className="rounded-full border border-line px-5 py-2.5 text-sm text-ink"
              >
                Hasta görünümü
              </Link>
            </div>
          </div>

          <aside className="rounded-2xl border border-line bg-paper-2 p-6 shadow-[0_20px_60px_-40px_rgba(20,36,28,0.45)]">
            <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">
              Bağımlılık kuralı
            </p>
            <p className="mt-3 font-serif text-2xl leading-snug">
              domain ← application ← adapters
            </p>
            <p className="mt-4 text-sm leading-6 text-ink-soft">
              Composition root yalnızca <code className="text-ink">src/app</code> ve{" "}
              <code className="text-ink">src/bootstrap</code>. Adapter başka
              adapter import etmez. Para integer minor unit.
            </p>
            <ul className="mt-6 grid grid-cols-2 gap-2">
              {contexts.map((ctx) => (
                <li key={ctx.name}>
                  <Link
                    href={ctx.href}
                    className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-sm hover:bg-paper"
                  >
                    <span>{ctx.name}</span>
                    <Badge>Faz {ctx.phase}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </section>
      </main>
    </div>
  );
}
