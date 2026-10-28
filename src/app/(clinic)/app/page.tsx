import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { fetchInitialDataAction } from "./actions";
import { ClinicSettingsClient } from "./clinic-settings-client";

async function ClinicHomeContent() {
  await connection();
  const result = await fetchInitialDataAction();

  if (result.unauthenticated) {
    redirect("/login");
  }

  if (!result.success || !result.data) {
    return (
      <main className="mx-auto max-w-xl px-6 py-20 text-center">
        <h1 className="font-serif text-2xl font-medium text-ink">
          Veriler Yüklenemedi
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          {result.error || "Klinik bilgileri alınırken bir hata oluştu."}
        </p>
      </main>
    );
  }

  return (
    <ClinicSettingsClient
      key={result.data.settings.workspaceId}
      initialProducts={result.data.products}
      initialSettings={result.data.settings}
      userEmail={result.data.userEmail}
    />
  );
}

export default function ClinicHomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center text-sm text-ink-soft">
          Klinik verileri yükleniyor...
        </div>
      }
    >
      <ClinicHomeContent />
    </Suspense>
  );
}
