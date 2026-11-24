import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { fetchDashboardDataAction } from "../actions";
import { SettingsClient } from "./settings-client";

async function SettingsContent() {
  await connection();
  const result = await fetchDashboardDataAction();

  if (result.unauthenticated) {
    redirect("/login");
  }

  if (!result.success || !result.data) {
    return (
      <main className="mx-auto max-w-xl px-6 py-20 text-center">
        <h1 className="text-xl font-bold text-[#0b1f4d]">Ayarlar Yüklenemedi</h1>
        <p className="mt-2 text-sm text-slate-500">
          {result.error || "Ayarlar alınırken bir hata oluştu."}
        </p>
      </main>
    );
  }

  return (
    <SettingsClient
      key={result.data.workspaceId}
      settings={result.data.settings}
      userEmail={result.data.userEmail}
    />
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto h-96 max-w-2xl animate-pulse rounded-3xl bg-white/40" />
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
