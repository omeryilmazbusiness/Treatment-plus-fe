import { connection } from "next/server";
import { Suspense } from "react";
import { AlertCircle } from "lucide-react";

import { getRuntime } from "@/bootstrap";
import type { UltimatePlanDTO } from "@/modules/share/domain/share";
import { PatientPresentationClient } from "./patient-presentation-client";

export default function PatientPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#faf8f5] text-slate-500 text-xs font-medium">
          Tedavi planınız yükleniyor...
        </div>
      }
    >
      <PatientBody params={params} />
    </Suspense>
  );
}

async function PatientBody({ params }: { params: Promise<{ token: string }> }) {
  await connection();
  const { token } = await params;

  const runtime = getRuntime();
  const backendUrl = runtime.config.api.url;

  let planData: UltimatePlanDTO | null = null;
  let errorMsg = "";

  try {
    const res = await fetch(`${backendUrl}/v1/public/plans/${token}`, {
      method: "GET",
      cache: "no-store",
    });

    if (res.ok) {
      planData = await res.json();
    } else {
      errorMsg = "Tedavi planı bulunamadı veya bağlantı süresi dolmuş olabilir.";
    }
  } catch {
    errorMsg = "Bağlantı sağlanamadı. Lütfen daha sonra tekrar deneyiniz.";
  }

  if (!planData) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf8f5] p-6 text-center">
        <div className="max-w-md rounded-3xl border border-[#e5dfd5] bg-white p-8 shadow-xs space-y-4">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <AlertCircle className="size-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900">
            Tedavi Planına Ulaşılamadı
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed font-light">
            {errorMsg ||
              "Bu bağlantı geçersiz veya süresi dolmuş olabilir. Lütfen kliniğiniz ile iletişime geçiniz."}
          </p>
        </div>
      </main>
    );
  }

  return <PatientPresentationClient data={planData} token={token} />;
}
