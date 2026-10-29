import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { fetchClinicSettingsDataAction } from "../actions";
import { ClinicSettingsView } from "./clinic-settings-view";

interface PageProps {
  searchParams?: Promise<{ tab?: string }>;
}

async function ClinicSettingsContent({ searchParams }: PageProps) {
  await connection();
  const sp = searchParams ? await searchParams : {};
  const rawTab = sp.tab;
  const initialTab =
    rawTab && ["general", "media", "doctor", "pdf", "pricing"].includes(rawTab)
      ? (rawTab as "general" | "media" | "doctor" | "pdf" | "pricing")
      : "general";

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
      initialTreatments={result.data.treatments}
      initialPriceList={result.data.priceList}
      initialTab={initialTab}
    />
  );
}

export default function ClinicSettingsPage(props: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center text-sm text-slate-400">
          Klinik ve şablon ayarları yükleniyor...
        </div>
      }
    >
      <ClinicSettingsContent {...props} />
    </Suspense>
  );
}

