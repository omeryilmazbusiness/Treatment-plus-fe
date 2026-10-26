import { cacheLife } from "next/cache";
import Link from "next/link";

import { Badge } from "@/ui/badge";
import { Mark } from "@/ui/mark";

export default async function LoginPage() {
  "use cache";
  cacheLife("days");

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6">
      <Link href="/" className="mb-10 flex items-center gap-3 text-teal-deep">
        <Mark className="size-8" />
        <span className="text-sm font-semibold">Treatment Plus</span>
      </Link>
      <Badge>Faz 1</Badge>
      <h1 className="mt-4 font-serif text-4xl tracking-tight">Klinik girişi</h1>
      <p className="mt-3 text-sm leading-6 text-ink-soft">
        Kimlik, davet ve oturum cookie’si bu fazda gelir. Cookie httpOnly kalır;
        tarayıcı Go API’ye Authorization taşımaz.
      </p>
      <form className="mt-8 space-y-3">
        <label className="block text-sm">
          E-posta
          <input
            disabled
            type="email"
            placeholder="klinik@ornek.com"
            className="mt-1 w-full rounded-xl border border-line bg-paper-2 px-3 py-2 text-ink disabled:opacity-60"
          />
        </label>
        <label className="block text-sm">
          Şifre
          <input
            disabled
            type="password"
            placeholder="••••••••"
            className="mt-1 w-full rounded-xl border border-line bg-paper-2 px-3 py-2 disabled:opacity-60"
          />
        </label>
        <button
          disabled
          type="button"
          className="w-full rounded-full bg-ink px-4 py-2.5 text-sm text-paper-2 opacity-60"
        >
          Giriş — yakında
        </button>
      </form>
    </main>
  );
}
