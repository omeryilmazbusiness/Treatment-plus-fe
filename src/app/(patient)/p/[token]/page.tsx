import { connection } from "next/server";
import { Suspense } from "react";

import { Badge } from "@/ui/badge";
import { Mark } from "@/ui/mark";

export default function PatientPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto min-h-dvh w-full max-w-2xl px-6 py-16 text-sm text-ink-soft">
          Plan yükleniyor…
        </main>
      }
    >
      <PatientBody params={params} />
    </Suspense>
  );
}

async function PatientBody({ params }: { params: Promise<{ token: string }> }) {
  await connection();
  const { token } = await params;

  return (
    <main className="mx-auto min-h-dvh w-full max-w-2xl px-6 py-16">
      <div className="flex items-center gap-3 text-teal-deep">
        <Mark className="size-8" />
        <p className="text-sm font-semibold">Treatment Plus</p>
      </div>
      <Badge tone="wait">Faz 6 · PHI · no-store</Badge>
      <h1 className="mt-4 font-serif text-4xl tracking-tight">Tedavi planınız</h1>
      <p className="mt-3 text-sm leading-6 text-ink-soft">
        Bu rota Redis/CDN cache kullanmaz. Token hashed saklanır; plan
        görünümü tek output modelinden (PlanView) render edilir.
      </p>
      <p className="mt-8 rounded-2xl border border-line bg-paper-2 px-4 py-3 font-mono text-xs text-ink-soft">
        token {token}
      </p>
    </main>
  );
}
