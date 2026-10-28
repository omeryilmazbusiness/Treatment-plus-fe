import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { fetchPlanDetailAction } from "../actions";
import { ClassicPlanClient } from "./classic-plan-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function PlanDetailContent({ params }: PageProps) {
  await connection();
  const { id } = await params;
  const result = await fetchPlanDetailAction(id);

  if (result.unauthenticated) {
    redirect("/login");
  }

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <ClassicPlanClient
      key={`${result.data.workspaceId}-${result.data.plan.id}`}
      workspaceId={result.data.workspaceId}
      initialPlan={result.data.plan}
      patients={result.data.patients}
      diagnosesCatalog={result.data.diagnoses}
      treatmentsCatalog={result.data.treatments}
      priceLists={result.data.priceLists}
      clinicSettings={result.data.clinicSettings}
    />
  );
}

export default function PlanDetailPage(props: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center text-sm text-ink-soft">
          Plan ayrıntıları yükleniyor...
        </div>
      }
    >
      <PlanDetailContent {...props} />
    </Suspense>
  );
}
