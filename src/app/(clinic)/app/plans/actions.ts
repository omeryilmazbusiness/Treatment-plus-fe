"use server";

import { revalidatePath } from "next/cache";

import { getRuntime } from "@/bootstrap";
import type { Diagnosis, PriceList, Treatment } from "@/modules/catalog/domain/catalog";
import type { ClinicSettings } from "@/modules/clinic/domain/clinic";
import type { Patient, Plan, Situation } from "@/modules/plan/domain/plan";
import type {
  PlanAnalytics,
  ShareLink,
  ShareResult,
  UltimatePlanDTO,
} from "@/modules/share/domain/share";
import { resolveActiveSession } from "@/platform/auth/session";
import type { ID } from "@/shared/id";

export type ActionResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
  unauthenticated?: boolean;
};

export async function fetchPlansListAction(): Promise<
  ActionResult<{ workspaceId: string; plans: Plan[]; patients: Patient[] }>
> {
  try {
    const runtime = getRuntime();
    const session = await resolveActiveSession(runtime.config, runtime.backend);
    if (!session) {
      return {
        success: false,
        unauthenticated: true,
        error: "Oturum bulunamadı. Lütfen giriş yapın.",
      };
    }

    const [plans, patients] = await Promise.all([
      runtime.plan.listPlans(session.accessToken),
      runtime.plan.list(session.accessToken),
    ]);

    return {
      success: true,
      data: { workspaceId: session.clinicId, plans, patients },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Planlar yüklenemedi";
    if (msg.includes("unauthenticated")) {
      return {
        success: false,
        unauthenticated: true,
        error: "Oturum süreniz doldu. Lütfen tekrar giriş yapın.",
      };
    }
    return { success: false, error: msg };
  }
}

export async function fetchPlanDetailAction(planId: string): Promise<
  ActionResult<{
    workspaceId: string;
    plan: Plan;
    patients: Patient[];
    diagnoses: Diagnosis[];
    treatments: Treatment[];
    priceLists: PriceList[];
    clinicSettings: ClinicSettings;
  }>
> {
  try {
    const runtime = getRuntime();
    const session = await resolveActiveSession(runtime.config, runtime.backend);
    if (!session) {
      return {
        success: false,
        unauthenticated: true,
        error: "Oturum bulunamadı. Lütfen giriş yapın.",
      };
    }

    const tok = session.accessToken;
    let [diagnoses, treatments, priceLists] = await Promise.all([
      runtime.catalog.listDiagnoses(tok),
      runtime.catalog.listTreatments(tok),
      runtime.catalog.listPriceLists(tok),
    ]);

    if (treatments.length === 0) {
      await seedDefaultCatalog(tok);
      [diagnoses, treatments, priceLists] = await Promise.all([
        runtime.catalog.listDiagnoses(tok),
        runtime.catalog.listTreatments(tok),
        runtime.catalog.listPriceLists(tok),
      ]);
    }

    // Load items for default price list so treatment prices populate per workspace
    const defaultPl = priceLists.find((pl) => pl.isDefault) || priceLists[0];
    if (defaultPl) {
      try {
        const detail = await runtime.catalog.getPriceList(defaultPl.id, tok);
        priceLists = priceLists.map((pl) =>
          pl.id === defaultPl.id ? { ...pl, items: detail.items } : pl
        );
      } catch {
        // Ignore if price list detail fails
      }
    }

    const [plan, patients, clinicSettings] = await Promise.all([
      runtime.plan.getById(planId as ID, tok),
      runtime.plan.list(tok),
      runtime.clinic.getSettings(tok),
    ]);

    return {
      success: true,
      data: {
        workspaceId: session.clinicId,
        plan,
        patients,
        diagnoses,
        treatments,
        priceLists,
        clinicSettings,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Plan detayı yüklenemedi";
    if (msg.includes("unauthenticated")) {
      return {
        success: false,
        unauthenticated: true,
        error: "Oturum süreniz doldu. Lütfen tekrar giriş yapın.",
      };
    }
    return { success: false, error: msg };
  }
}

export type SavePlanPayload = {
  workspaceId?: string;
  title: string;
  palette?: "navy" | "forest" | "rose" | "slate";
  locale?: "tr" | "en";
  currency?: "TRY" | "EUR" | "USD";
  diagnoses: string[];
  situation?: Situation;
  visits: {
    id?: string;
    order_num: number;
    title: string;
    phase_label?: string;
    healing_note?: string;
    chart_teeth?: string[];
  }[];
  items: {
    id?: string;
    visit_id?: string;
    treatment_id?: string;
    treatment_name: string;
    animation_code?: string;
    tooth_number?: string;
    teeth?: string[];
    description?: string;
    quantity: number;
    unit_price: number;
    is_package: boolean;
    order_num?: number;
  }[];
  discounts: {
    id?: string;
    label: string;
    amount: number;
    order_num?: number;
  }[];
};

export async function savePlanDetailsAction(
  planId: string,
  payload: SavePlanPayload
): Promise<ActionResult<Plan>> {
  try {
    const runtime = getRuntime();
    const session = await resolveActiveSession(runtime.config, runtime.backend);
    if (!session) {
      return {
        success: false,
        unauthenticated: true,
        error: "Oturum süreniz doldu. Lütfen tekrar giriş yapın.",
      };
    }

    if (payload.workspaceId && payload.workspaceId !== session.clinicId) {
      return {
        success: false,
        error:
          "Aktif oturum başka bir hesaba ait. Diğer hesabı etkilememek için işlem engellendi.",
      };
    }

    // 1. Update Header
    await runtime.plan.updatePlanHeader(
      planId as ID,
      {
        title: payload.title,
        diagnoses: payload.diagnoses,
        palette: payload.palette,
        locale: payload.locale,
        currency: payload.currency,
        situation: payload.situation,
      },
      session.accessToken
    );

    // 2. Put Visits
    await runtime.plan.putVisits(
      planId as ID,
      payload.visits.map((v, i) => ({
        id: v.id,
        order_num: v.order_num || i + 1,
        title: v.title,
        phase_label: v.phase_label,
        healing_note: v.healing_note,
        chart_teeth: v.chart_teeth,
      })),
      session.accessToken
    );

    // 3. Put Items (Server calculates subtotal)
    await runtime.plan.putItems(
      planId as ID,
      payload.items.map((it, i) => ({
        id: it.id,
        visit_id: it.visit_id,
        treatment_id: it.treatment_id,
        treatment_name: it.treatment_name,
        animation_code: it.animation_code,
        tooth_number: it.tooth_number,
        teeth: it.teeth,
        description: it.description,
        quantity: it.quantity,
        unit_price: it.unit_price,
        is_package: it.is_package,
        order_num: it.order_num || i + 1,
      })),
      session.accessToken
    );

    // 4. Put Discounts (Server calculates grand total)
    const updatedPlan = await runtime.plan.putDiscounts(
      planId as ID,
      payload.discounts.map((d, i) => ({
        id: d.id,
        label: d.label,
        amount: d.amount,
        order_num: d.order_num || i + 1,
      })),
      session.accessToken
    );

    revalidatePath("/app/plans");
    revalidatePath(`/app/plans/${planId}`);

    return { success: true, data: updatedPlan };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Plan kaydedilemedi";
    return { success: false, error: msg };
  }
}

export async function generatePdfAction(
  planId: string
): Promise<ActionResult<{ success: boolean }>> {
  try {
    const runtime = getRuntime();
    const session = await resolveActiveSession(runtime.config, runtime.backend);
    if (!session) {
      return {
        success: false,
        unauthenticated: true,
        error: "Oturum süreniz doldu. Lütfen tekrar giriş yapın.",
      };
    }

    await runtime.backend.request({
      path: `/v1/plans/${planId}/pdf`,
      method: "POST",
      accessToken: session.accessToken,
    });

    return { success: true, data: { success: true } };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "PDF oluşturulamadı";
    return { success: false, error: msg };
  }
}

export async function createPlanAction(
  patientId: string,
  title: string,
  diagnoses: string[] = [],
  expectedWorkspaceId?: string,
  currency?: "TRY" | "EUR" | "USD"
): Promise<ActionResult<Plan>> {
  try {
    const runtime = getRuntime();
    const session = await resolveActiveSession(runtime.config, runtime.backend);
    if (!session) {
      return {
        success: false,
        unauthenticated: true,
        error: "Oturum süreniz doldu. Lütfen tekrar giriş yapın.",
      };
    }

    if (expectedWorkspaceId && expectedWorkspaceId !== session.clinicId) {
      return {
        success: false,
        error:
          "Aktif oturum başka bir hesaba ait. Diğer hesabı etkilememek için işlem engellendi.",
      };
    }

    // 1. Create plan
    const newPlan = await runtime.plan.createPlan(
      {
        patientId,
        title: title || "Tedavi Planı",
        currency,
        diagnoses,
      },
      session.accessToken
    );

    // 2. Default 2 Visits
    const updatedWithVisits = await runtime.plan.putVisits(
      newPlan.id,
      [
        { order_num: 1, title: "1. Seans: Muayene & Hazırlık" },
        { order_num: 2, title: "2. Seans: Tedavi & Simantasyon" },
      ],
      session.accessToken
    );

    revalidatePath("/app/plans");
    return { success: true, data: updatedWithVisits };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Plan oluşturulamadı";
    return { success: false, error: msg };
  }
}

export async function readyPlanAction(
  planId: string,
  expectedWorkspaceId?: string
): Promise<ActionResult<Plan>> {
  try {
    const runtime = getRuntime();
    const session = await resolveActiveSession(runtime.config, runtime.backend);
    if (!session) {
      return {
        success: false,
        unauthenticated: true,
        error: "Oturum süreniz doldu. Lütfen tekrar giriş yapın.",
      };
    }

    if (expectedWorkspaceId && expectedWorkspaceId !== session.clinicId) {
      return {
        success: false,
        error:
          "Aktif oturum başka bir hesaba ait. Diğer hesabı etkilememek için işlem engellendi.",
      };
    }

    const readyPlan = await runtime.plan.markReady(
      planId as ID,
      session.accessToken
    );
    revalidatePath("/app/plans");
    revalidatePath(`/app/plans/${planId}`);

    return { success: true, data: readyPlan };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Plan onaylanamadı";
    return { success: false, error: msg };
  }
}

export async function createPatientAction(
  name: string,
  contact: string,
  expectedWorkspaceId?: string
): Promise<ActionResult<Patient>> {
  try {
    const runtime = getRuntime();
    const session = await resolveActiveSession(runtime.config, runtime.backend);
    if (!session) {
      return {
        success: false,
        unauthenticated: true,
        error: "Oturum süreniz doldu. Lütfen tekrar giriş yapın.",
      };
    }

    if (expectedWorkspaceId && expectedWorkspaceId !== session.clinicId) {
      return {
        success: false,
        error:
          "Aktif oturum başka bir hesaba ait. Diğer hesabı etkilememek için işlem engellendi.",
      };
    }

    const patient = await runtime.plan.createPatient(
      { name, contact },
      session.accessToken
    );
    revalidatePath("/app/plans");
    return { success: true, data: patient };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Hasta eklenemedi";
    return { success: false, error: msg };
  }
}

export async function seedDefaultCatalog(accessToken: string): Promise<void> {
  const runtime = getRuntime();

  // Create diagnoses
  await Promise.all([
    runtime.catalog.createDiagnosis(
      { code: "K02.1", name: "Dentin Çürüğü" },
      accessToken
    ),
    runtime.catalog.createDiagnosis(
      { code: "K04.0", name: "Pulpitis / Kanal İhtiyacı" },
      accessToken
    ),
    runtime.catalog.createDiagnosis(
      { code: "K05.1", name: "Kronik Gingivitis" },
      accessToken
    ),
    runtime.catalog.createDiagnosis(
      { code: "K08.1", name: "Diş Kaybı / Eksiklik" },
      accessToken
    ),
  ]);

  // Create treatments
  const [t1, t2, t3, t4, t5] = await Promise.all([
    runtime.catalog.createTreatment(
      { code: "TR01", name: "Kompozit Dolgu (Estetik)" },
      accessToken
    ),
    runtime.catalog.createTreatment(
      { code: "TR02", name: "Kanal Tedavisi (Endodonti)" },
      accessToken
    ),
    runtime.catalog.createTreatment(
      { code: "TR03", name: "Zirkonyum Porselen Kron" },
      accessToken
    ),
    runtime.catalog.createTreatment(
      { code: "TR04", name: "Dental İmplant Tedavisi" },
      accessToken
    ),
    runtime.catalog.createTreatment(
      { code: "TR05", name: "Panoramik Röntgen (Paket İçi)" },
      accessToken
    ),
  ]);

  // Create default price list
  const pl = await runtime.catalog.createPriceList(
    { name: "2026 Standart Tarife", currency: "TRY", isDefault: true },
    accessToken
  );

  // Set prices (in kuruş minor units)
  await runtime.catalog.setPriceItems(
    pl.id,
    [
      { treatmentId: t1.id, amount: 150000 }, // 1,500.00 TL
      { treatmentId: t2.id, amount: 350000 }, // 3,500.00 TL
      { treatmentId: t3.id, amount: 480000 }, // 4,800.00 TL
      { treatmentId: t4.id, amount: 1400000 }, // 14,000.00 TL
      { treatmentId: t5.id, amount: 60000 }, // 600.00 TL
    ],
    accessToken
  );
}

// ==========================================
// Ultimate Share & Presentation Actions
// ==========================================

export async function createShareLinkAction(
  planId: string,
  ttlHours: number = 720
): Promise<ActionResult<ShareResult>> {
  try {
    const runtime = getRuntime();
    const session = await resolveActiveSession(runtime.config, runtime.backend);
    if (!session) {
      return {
        success: false,
        unauthenticated: true,
        error: "Oturum süreniz doldu. Lütfen tekrar giriş yapın.",
      };
    }

    const res = await runtime.backend.request<ShareResult>({
      path: `/v1/plans/${planId}/share`,
      method: "POST",
      body: { ttl_hours: ttlHours },
      accessToken: session.accessToken,
    });

    // Make sure public_url points to frontend domain if available
    const appBase = process.env.APP_URL || "http://localhost:3000";
    const frontendPublicUrl = `${appBase.replace(/\/$/, "")}/p/${res.token}`;

    revalidatePath(`/app/plans/${planId}`);
    return {
      success: true,
      data: {
        ...res,
        public_url: frontendPublicUrl,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Paylaşım linki oluşturulamadı";
    return { success: false, error: msg };
  }
}

export async function listShareLinksAction(
  planId: string
): Promise<ActionResult<ShareLink[]>> {
  try {
    const runtime = getRuntime();
    const session = await resolveActiveSession(runtime.config, runtime.backend);
    if (!session) {
      return {
        success: false,
        unauthenticated: true,
        error: "Oturum süreniz doldu. Lütfen tekrar giriş yapın.",
      };
    }

    const res = await runtime.backend.request<{ links?: ShareLink[] } | ShareLink[]>({
      path: `/v1/plans/${planId}/share`,
      method: "GET",
      accessToken: session.accessToken,
    });

    const links = Array.isArray(res) ? res : res?.links || [];
    return { success: true, data: links };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Paylaşım linkleri getirilemedi";
    return { success: false, error: msg };
  }
}

export async function revokeShareLinkAction(
  planId: string,
  linkId: string
): Promise<ActionResult<{ success: boolean }>> {
  try {
    const runtime = getRuntime();
    const session = await resolveActiveSession(runtime.config, runtime.backend);
    if (!session) {
      return {
        success: false,
        unauthenticated: true,
        error: "Oturum süreniz doldu. Lütfen tekrar giriş yapın.",
      };
    }

    await runtime.backend.request({
      path: `/v1/plans/${planId}/share/${linkId}`,
      method: "DELETE",
      accessToken: session.accessToken,
    });

    revalidatePath(`/app/plans/${planId}`);
    return { success: true, data: { success: true } };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Paylaşım linki iptal edilemedi";
    return { success: false, error: msg };
  }
}

export async function getPlanAnalyticsAction(
  planId: string
): Promise<ActionResult<PlanAnalytics>> {
  try {
    const runtime = getRuntime();
    const session = await resolveActiveSession(runtime.config, runtime.backend);
    if (!session) {
      return {
        success: false,
        unauthenticated: true,
        error: "Oturum süreniz doldu. Lütfen tekrar giriş yapın.",
      };
    }

    const analytics = await runtime.backend.request<PlanAnalytics>({
      path: `/v1/plans/${planId}/analytics`,
      method: "GET",
      accessToken: session.accessToken,
    });

    return { success: true, data: analytics };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Analitik verileri alınamadı";
    return { success: false, error: msg };
  }
}

export async function getPublicPlanAction(
  token: string
): Promise<ActionResult<UltimatePlanDTO>> {
  try {
    const runtime = getRuntime();
    const backendUrl = runtime.config.api.url;
    const res = await fetch(`${backendUrl}/v1/public/plans/${token}`, {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, error: errText || "Tedavi planı bulunamadı" };
    }

    const data: UltimatePlanDTO = await res.json();
    return { success: true, data };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Plan yüklenemedi";
    return { success: false, error: msg };
  }
}

export async function acceptPublicPlanAction(
  token: string,
  signature: string
): Promise<ActionResult<{ status: string; accepted_at: string }>> {
  try {
    const runtime = getRuntime();
    const backendUrl = runtime.config.api.url;
    const res = await fetch(`${backendUrl}/v1/public/plans/${token}/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signature }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, error: errText || "Onay kaydedilemedi" };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Bağlantı hatası oluştu";
    return { success: false, error: msg };
  }
}

export async function recordPublicEventAction(
  token: string,
  kind: string,
  metadata?: Record<string, unknown>
): Promise<ActionResult<{ status: string }>> {
  try {
    const runtime = getRuntime();
    const backendUrl = runtime.config.api.url;
    const res = await fetch(`${backendUrl}/v1/public/plans/${token}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, metadata }),
    });

    if (!res.ok) {
      return { success: false, error: "Event kaydedilemedi" };
    }

    return { success: true, data: { status: "ok" } };
  } catch {
    return { success: false, error: "Event error" };
  }
}
