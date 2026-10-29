import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { fetchDashboardDataAction } from "./actions";
import { DashboardClient } from "./dashboard-client";

async function DashboardContent() {
  await connection();
  const result = await fetchDashboardDataAction();

  if (result.unauthenticated) {
    redirect("/login");
  }

  if (!result.success || !result.data) {
    return (
      <main className="mx-auto max-w-xl px-6 py-20 text-center">
        <h1 className="text-xl font-bold text-slate-900">
          Veriler Yüklenemedi
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {result.error || "Dashboard verileri alınırken bir hata oluştu."}
        </p>
      </main>
    );
  }

  return (
    <DashboardClient
      key={result.data.workspaceId}
      initialSettings={result.data.settings}
      initialPlans={result.data.plans}
      initialPatients={result.data.patients}
      userEmail={result.data.userEmail}
      workspaceId={result.data.workspaceId}
    />
  );
}

export default function ClinicDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center text-sm text-slate-400">
          Panel verileri yükleniyor...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
