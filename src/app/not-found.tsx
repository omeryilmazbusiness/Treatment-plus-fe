import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-6">
      <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">404</p>
      <h1 className="mt-3 font-serif text-4xl tracking-tight">Sayfa yok</h1>
      <p className="mt-3 text-sm text-ink-soft">İstediğiniz rota bu kabukta tanımlı değil.</p>
      <Link href="/" className="mt-8 text-sm text-teal underline-offset-4 hover:underline">
        Ana sayfa
      </Link>
    </main>
  );
}
