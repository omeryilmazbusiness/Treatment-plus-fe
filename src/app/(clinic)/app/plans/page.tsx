import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { fetchPlansListAction } from "./actions";
import { PlansListClient } from "./plans-list-client";

async function PlansListContent() {
  await connection();
  const result = await fetchPlansListAction();

  if (result.unauthenticated) {
    redirect("/login");
  }

  if (!result.success || !result.data) {
    return (
      <main className="mx-auto max-w-xl px-6 py-20 text-center">
        <h1 className="font-serif text-2xl font-medium text-ink">
          Planlar Yüklenemedi
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          {result.error || "Tedavi planları alınırken bir hata oluştu."}
        </p>
      </main>
    );
  }

  return (
    <PlansListClient
      key={result.data.workspaceId}
      workspaceId={result.data.workspaceId}
      initialPlans={result.data.plans}
      initialPatients={result.data.patients}
    />
  );
}

export default function PlansPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center text-sm text-ink-soft">
          Tedavi planları yükleniyor...
        </div>
      }
    >
      <PlansListContent />
    </Suspense>
  );
}
