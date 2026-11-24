import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { fetchSetupDataAction } from "./actions";
import { SetupScreen } from "./setup-screen";

export const metadata: Metadata = {
  title: "Klinik Kurulumu",
  robots: { index: false, follow: false },
};

function SetupFallback() {
  return (
    <div className="setup-night relative isolate flex min-h-dvh items-center justify-center">
      <div aria-hidden className="setup-aurora fixed inset-0 -z-10" />
      <span
        role="status"
        aria-label="Yükleniyor"
        className="size-8 animate-spin rounded-full border-2 border-white/60 border-t-transparent"
      />
    </div>
  );
}

async function SetupContent() {
  await connection();
  const result = await fetchSetupDataAction();

  if (result.unauthenticated) {
    redirect("/login");
  }

  if (!result.success || !result.data) {
    return (
      <div className="setup-night relative isolate flex min-h-dvh items-center justify-center px-6 text-center text-white">
        <div aria-hidden className="setup-aurora fixed inset-0 -z-10" />
        <div className="setup-glass max-w-md rounded-[28px] p-8">
          <h1 className="text-xl font-semibold">Kurulum yüklenemedi</h1>
          <p className="mt-2 text-sm text-white/60">
            {result.error ?? "Bilgiler alınırken bir hata oluştu."}
          </p>
          <a
            href="/setup"
            className="setup-pill mt-6 inline-flex h-11 items-center rounded-full px-5 text-sm font-semibold text-white/90"
          >
            Tekrar dene
          </a>
        </div>
      </div>
    );
  }

  return (
    <SetupScreen
      key={result.data.workspaceId}
      settings={result.data.settings}
      catalog={result.data.catalog}
    />
  );
}

export default function SetupPage() {
  return (
    <Suspense fallback={<SetupFallback />}>
      <SetupContent />
    </Suspense>
  );
}
