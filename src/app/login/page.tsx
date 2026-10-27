import Link from "next/link";

import { Badge } from "@/ui/badge";
import { Mark } from "@/ui/mark";
import { loginAction } from "./actions";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6">
      <Link href="/" className="mb-10 flex items-center gap-3 text-teal-deep">
        <Mark className="size-8" />
        <span className="text-sm font-semibold">Treatment Plus</span>
      </Link>
      <Badge tone="ok">Giriş Yap</Badge>
      <h1 className="mt-4 font-serif text-4xl tracking-tight">Klinik Girişi</h1>
      <p className="mt-3 text-sm leading-6 text-ink-soft">
        Giriş yaptıktan sonra çalışma alanınıza yönlendirilir ve Classic kapısı
        üzerinden PDF şablonunuzu yapılandırabilirsiniz.
      </p>

      <form action={loginAction} className="mt-8 space-y-4">
        <label className="block text-sm">
          <span className="font-medium text-ink">E-posta</span>
          <input
            name="email"
            type="email"
            defaultValue="demo@dentistplus.com"
            required
            className="mt-1 w-full rounded-xl border border-line bg-paper-2 px-3 py-2 text-ink shadow-xs focus:border-teal focus:outline-hidden"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">Şifre</span>
          <input
            name="password"
            type="password"
            defaultValue="password123456"
            required
            className="mt-1 w-full rounded-xl border border-line bg-paper-2 px-3 py-2 text-ink shadow-xs focus:border-teal focus:outline-hidden"
          />
        </label>

        <button
          type="submit"
          className="w-full cursor-pointer rounded-full bg-teal px-4 py-2.5 text-sm font-semibold text-paper shadow-sm transition-all hover:bg-teal-deep"
        >
          Klinik Girişi Yap →
        </button>
      </form>
    </main>
  );
}
