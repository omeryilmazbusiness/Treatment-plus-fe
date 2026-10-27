"use server";

import { revalidatePath } from "next/cache";

import { getRuntime } from "@/bootstrap";
import type { Diagnosis, PriceList, Treatment } from "@/modules/catalog/domain/catalog";
import type { ClinicSettings } from "@/modules/clinic/domain/clinic";
import type { Patient, Plan } from "@/modules/plan/domain/plan";
import { readSession, writeSession, type Session } from "@/platform/auth/session";
import type { ID } from "@/shared/id";

export type ActionResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

async function forceLogin(runtime: ReturnType<typeof getRuntime>): Promise<Session> {
  try {
    const loginRes = await runtime.backend.request<{
      user: { id: string; email: string; role: string };
      workspace: { id: string; name: string };
      tokens: { access_token: string };
    }>({
      path: "/v1/auth/login",
      method: "POST",
      body: {
        email: "demo@dentistplus.com",
        password: "password123456",
      },
    });

    const session: Session = {
      accessToken: loginRes.tokens.access_token,
      userId: loginRes.user.id,
      clinicId: loginRes.workspace.id,
      role: "owner",
    };
    await writeSession(runtime.config, session);
    return session;
  } catch {
    // If login failed, register demo clinic
    const regRes = await runtime.backend.request<{
      user: { id: string; email: string; role: string };
      workspace: { id: string; name: string };
      tokens: { access_token: string };
    }>({
      path: "/v1/auth/register",
      method: "POST",
      body: {
        name: "Örnek Diş Kliniği",
        email: "demo@dentistplus.com",
        password: "password123456",
        role: "clinic",
      },
    });

    const session: Session = {
      accessToken: regRes.tokens.access_token,
      userId: regRes.user.id,
      clinicId: regRes.workspace.id,
      role: "owner",
    };
    await writeSession(runtime.config, session);
    return session;
  }
}

async function ensureSession(): Promise<Session> {
  const runtime = getRuntime();
  const current = await readSession(runtime.config);
  if (current) return current;

  return forceLogin(runtime);
}

export async function fetchPlansListAction(): Promise<
  ActionResult<{ plans: Plan[]; patients: Patient[] }>
> {
  try {
    const runtime = getRuntime();
    let session = await ensureSession();

    let plans: Plan[];
    let patients: Patient[];
    try {
      [plans, patients] = await Promise.all([
        runtime.plan.listPlans(session.accessToken),
        runtime.plan.list(session.accessToken),
      ]);
    } catch (apiErr: unknown) {
      if (apiErr instanceof Error && apiErr.message.includes("unauthenticated")) {
        session = await forceLogin(runtime);
        [plans, patients] = await Promise.all([
          runtime.plan.listPlans(session.accessToken),
          runtime.plan.list(session.accessToken),
        ]);
      } else {
        throw apiErr;
      }
    }

    return {
      success: true,
      data: { plans, patients },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Planlar yüklenemedi";
    return { success: false, error: msg };
  }
}

export async function fetchPlanDetailAction(planId: string): Promise<
  ActionResult<{
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
    let session = await ensureSession();

    const loadData = async (tok: string) => {
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

      const [plan, patients, clinicSettings] = await Promise.all([
        runtime.plan.getById(planId as ID, tok),
        runtime.plan.list(tok),
        runtime.clinic.getSettings(tok),
      ]);

      return { plan, patients, diagnoses, treatments, priceLists, clinicSettings };
    };

    let data;
    try {
      data = await loadData(session.accessToken);
    } catch (apiErr: unknown) {
      if (apiErr instanceof Error && apiErr.message.includes("unauthenticated")) {
        session = await forceLogin(runtime);
        data = await loadData(session.accessToken);
      } else {
        throw apiErr;
      }
    }

    return {
      success: true,
      data,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Plan detayı yüklenemedi";
    return { success: false, error: msg };
  }
}

export type SavePlanPayload = {
  title: string;
  diagnoses: string[];
  visits: {
    id?: string;
    order_num: number;
    title: string;
  }[];
  items: {
    id?: string;
    visit_id?: string;
    treatment_id?: string;
    treatment_name: string;
    tooth_number?: string;
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
    const session = await ensureSession();

    // 1. Update Header
    await runtime.plan.updatePlanHeader(
      planId as ID,
      { title: payload.title, diagnoses: payload.diagnoses },
      session.accessToken
    );

    // 2. Put Visits
    await runtime.plan.putVisits(
      planId as ID,
      payload.visits,
      session.accessToken
    );

    // 3. Put Items (Server calculates subtotal)
    await runtime.plan.putItems(
      planId as ID,
      payload.items,
      session.accessToken
    );

    // 4. Put Discounts (Server calculates grand total)
    const updatedPlan = await runtime.plan.putDiscounts(
      planId as ID,
      payload.discounts,
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

export async function createPlanAction(
  patientId: string,
  title: string,
  diagnoses: string[]
): Promise<ActionResult<Plan>> {
  try {
    const runtime = getRuntime();
    const session = await ensureSession();

    // 1. Create plan
    const newPlan = await runtime.plan.createPlan(
      {
        patientId,
        title: title || "Tedavi Planı",
        currency: "TRY",
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
  planId: string
): Promise<ActionResult<Plan>> {
  try {
    const runtime = getRuntime();
    const session = await ensureSession();

    const readyPlan = await runtime.plan.markReady(
      planId as ID,
      session.accessToken
    );
    revalidatePath("/app/plans");
    revalidatePath(`/app/plans/${planId}`);

    return { success: true, data: readyPlan };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Plan kilitlenemedi";
    return { success: false, error: msg };
  }
}

export async function createPatientAction(
  name: string,
  contact: string
): Promise<ActionResult<Patient>> {
  try {
    const runtime = getRuntime();
    const session = await ensureSession();

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

async function seedDefaultCatalog(accessToken: string): Promise<void> {
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
