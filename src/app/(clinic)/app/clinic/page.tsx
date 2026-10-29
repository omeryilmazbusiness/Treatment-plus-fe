import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { fetchClinicSettingsDataAction } from "../actions";
import { ClinicSettingsView } from "./clinic-settings-view";

async function ClinicSettingsContent() {
  await connection();
  const result = await fetchClinicSettingsDataAction();

  if (result.unauthenticated) {
    redirect("/login");
  }

  if (!result.success || !result.data) {
    return (
      <main className="mx-auto max-w-xl px-6 py-20 text-center">
        <h1 className="text-xl font-bold text-slate-900">
          Klinik Bilgileri Yüklenemedi
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {result.error || "Klinik ayarları alınırken bir hata oluştu."}
        </p>
      </main>
    );
  }

  return (
    <ClinicSettingsView
      key={result.data.workspaceId}
      initialSettings={result.data.settings}
      userEmail={result.data.userEmail}
      workspaceId={result.data.workspaceId}
    />
  );
}

export default function ClinicSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center text-sm text-slate-400">
          Klinik ve şablon ayarları yükleniyor...
        </div>
      }
    >
      <ClinicSettingsContent />
    </Suspense>
  );
}

