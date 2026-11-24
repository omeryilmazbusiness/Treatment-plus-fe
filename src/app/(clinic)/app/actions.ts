"use server";

import { revalidatePath } from "next/cache";

import { getRuntime } from "@/bootstrap";
import type { PriceList, Treatment } from "@/modules/catalog/domain/catalog";
import type { ClinicSettings, WorkspaceProducts } from "@/modules/clinic/domain/clinic";
import type { Patient, Plan } from "@/modules/plan/domain/plan";
import {
  UPGRADE_DISCOUNT_PERCENT,
  findExtraPdfPack,
  discountedPrice,
  isProfessionalTier,
  pickUpgradeTarget,
  tierLabel,
  type Subscription,
  type UpgradeOffer,
} from "@/modules/subscription/domain/subscription";
import { resolveActiveSession } from "@/platform/auth/session";
import type { ID } from "@/shared/id";
import { ensureStandard3DTreatments, seedDefaultCatalog } from "./plans/actions";

export type ActionResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
  unauthenticated?: boolean;
};

export async function fetchDashboardDataAction(): Promise<
  ActionResult<{
    settings: ClinicSettings;
    plans: Plan[];
    patients: Patient[];
    userEmail: string;
    workspaceId: string;
    treatmentCount: number;
    subscription: Subscription | null;
    upgradeOffer: UpgradeOffer | null;
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

    const [settings, plans, patients, treatments, subscription] = await Promise.all([
      runtime.clinic.getSettings(session.accessToken),
      runtime.plan.listPlans(session.accessToken),
      runtime.plan.list(session.accessToken),
      runtime.catalog.listTreatments(session.accessToken),
      // Paket bilgisi paneli kırmamalı: hata olursa kart "alınamadı" gösterir.
      runtime.subscription.getCurrent(session.accessToken).catch((err: unknown) => {
        runtime.log.error("subscription_fetch_failed", {
          error: err instanceof Error ? err.message : String(err),
        });
        return null;
      }),
    ]);

    let upgradeOffer: UpgradeOffer | null = null;
    if (subscription && !isProfessionalTier(subscription.tier)) {
      try {
        const target = pickUpgradeTarget(
          await runtime.subscription.listPlans(session.accessToken)
        );
        if (target) {
          upgradeOffer = {
            target,
            discountPercent: UPGRADE_DISCOUNT_PERCENT,
            discountedMinor: discountedPrice(target.priceMinor, UPGRADE_DISCOUNT_PERCENT),
          };
        }
      } catch {
        upgradeOffer = null;
      }
    }

    let userEmail = session.userEmail || settings.name || "klinik@treatment.health";
    try {
      const me = await runtime.backend.request<{
        user: { email: string };
      }>({
        path: "/v1/auth/me",
        method: "GET",
        accessToken: session.accessToken,
      });
      if (me?.user?.email) {
        userEmail = me.user.email;
      }
    } catch {
      // Fallback to session email
    }

    return {
      success: true,
      data: {
        settings,
        plans,
        patients,
        userEmail,
        workspaceId: session.clinicId,
        treatmentCount: treatments.length,
        subscription,
        upgradeOffer,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Veriler yüklenemedi";
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

export async function fetchClinicSettingsDataAction(): Promise<
  ActionResult<{
    products: WorkspaceProducts;
    settings: ClinicSettings;
    userEmail: string;
    workspaceId: string;
    treatments: Treatment[];
    priceList: PriceList | null;
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

    const [products, settings] = await Promise.all([
      runtime.clinic.getWorkspaceProducts(session.accessToken),
      runtime.clinic.getSettings(session.accessToken),
    ]);
    let [treatments, priceLists] = await Promise.all([
      runtime.catalog.listTreatments(session.accessToken),
      runtime.catalog.listPriceLists(session.accessToken),
    ]);

    if (treatments.length === 0) {
      await seedDefaultCatalog(session.accessToken);
      [treatments, priceLists] = await Promise.all([
        runtime.catalog.listTreatments(session.accessToken),
        runtime.catalog.listPriceLists(session.accessToken),
      ]);
    } else if (treatments.length <= 5 && !treatments.some((t) => t.code === "TR06")) {
      await ensureStandard3DTreatments(session.accessToken, treatments, priceLists);
      [treatments, priceLists] = await Promise.all([
        runtime.catalog.listTreatments(session.accessToken),
        runtime.catalog.listPriceLists(session.accessToken),
      ]);
    }

    const defaultPl = priceLists.find((pl) => pl.isDefault) || priceLists[0];
    let priceListWithItems: PriceList | null = defaultPl || null;
    if (defaultPl) {
      try {
        const detail = await runtime.catalog.getPriceList(defaultPl.id, session.accessToken);
        priceListWithItems = { ...defaultPl, items: detail.items };
      } catch {
        priceListWithItems = defaultPl;
      }
    }

    let userEmail = session.userEmail || settings.name || "klinik@treatment.health";
    try {
      const me = await runtime.backend.request<{
        user: { email: string };
      }>({
        path: "/v1/auth/me",
        method: "GET",
        accessToken: session.accessToken,
      });
      if (me?.user?.email) {
        userEmail = me.user.email;
      }
    } catch {
      // Fallback
    }

    return {
      success: true,
      data: {
        products,
        settings,
        userEmail,
        workspaceId: session.clinicId,
        treatments,
        priceList: priceListWithItems,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Klinik bilgileri yüklenemedi";
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

export async function updateClinicSettingsAction(
  patch: Partial<ClinicSettings>
): Promise<ActionResult<ClinicSettings>> {
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

    if (patch.workspaceId && patch.workspaceId !== session.clinicId) {
      return {
        success: false,
        error:
          "Aktif oturum başka bir hesaba ait. Diğer hesabı etkilememek için değişiklik kaydedilmedi. Lütfen sayfayı yenileyin.",
      };
    }

    const updated = await runtime.clinic.updateSettings(
      patch,
      session.accessToken
    );
    revalidatePath("/app");
    revalidatePath("/app/clinic");
    return { success: true, data: updated };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Ayarlar kaydedilemedi";
    return { success: false, error: msg };
  }
}

export async function uploadMediaAction(
  formData: FormData
): Promise<ActionResult<{ key: string; kind: string }>> {
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

    const res = await fetch(`${runtime.config.api.url}/v1/media`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, error: errText || "Görsel yüklenemedi." };
    }

    const data = (await res.json()) as { key: string; kind: string };
    return { success: true, data };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Görsel yüklenemedi.";
    return { success: false, error: msg };
  }
}

export async function createTreatmentWithPriceAction(data: {
  name: string;
  code?: string;
  priceMinor: number;
}): Promise<ActionResult<{ treatment: Treatment; amount: number }>> {
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

    const name = data.name.trim();
    if (!name) {
      return { success: false, error: "Tedavi işlemi adı boş bırakılamaz." };
    }

    // List existing treatments to auto-generate code if needed
    const existingTreatments = await runtime.catalog.listTreatments(session.accessToken);
    const existingCodes = new Set(existingTreatments.map((t) => (t.code || "").trim().toUpperCase()));
    let finalCode = (data.code || "").trim().toUpperCase();
    if (!finalCode || existingCodes.has(finalCode)) {
      let nextNum = Math.max(1, existingTreatments.length + 1);
      for (const t of existingTreatments) {
        const match = (t.code || "").match(/^TR(\d+)$/i);
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num >= nextNum) {
            nextNum = num + 1;
          }
        }
      }
      finalCode = `TR${String(nextNum).padStart(2, "0")}`;
      while (existingCodes.has(finalCode)) {
        nextNum += 1;
        finalCode = `TR${String(nextNum).padStart(2, "0")}`;
      }
    }

    const newTreatment = await runtime.catalog.createTreatment(
      { code: finalCode, name },
      session.accessToken
    );

    // Ensure price list exists and update price item
    const priceLists = await runtime.catalog.listPriceLists(session.accessToken);
    let defaultPl = priceLists.find((pl) => pl.isDefault) || priceLists[0];
    if (!defaultPl) {
      defaultPl = await runtime.catalog.createPriceList(
        { name: "Standart Tarife", currency: "TRY", isDefault: true },
        session.accessToken
      );
    }

    let existingItems: { treatmentId: string; amount: number }[] = [];
    try {
      const plDetail = await runtime.catalog.getPriceList(defaultPl.id, session.accessToken);
      existingItems = (plDetail.items || []).map((i) => ({
        treatmentId: String(i.treatmentId),
        amount: i.amount,
      }));
    } catch {
      // Ignore
    }

    const updatedItems = [
      ...existingItems.filter((i) => i.treatmentId !== String(newTreatment.id)),
      { treatmentId: String(newTreatment.id), amount: Math.max(0, data.priceMinor || 0) },
    ];

    await runtime.catalog.setPriceItems(defaultPl.id, updatedItems, session.accessToken);

    revalidatePath("/app/clinic");
    revalidatePath("/app/plans");

    return {
      success: true,
      data: {
        treatment: newTreatment,
        amount: Math.max(0, data.priceMinor || 0),
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Tedavi işlemi kaydedilemedi.";
    return { success: false, error: msg };
  }
}

export async function updateTreatmentItemAction(data: {
  id: string;
  name?: string;
  isActive?: boolean;
  priceMinor?: number;
}): Promise<ActionResult<Treatment>> {
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

    let tr: Treatment | undefined;
    if (data.name !== undefined || data.isActive !== undefined) {
      tr = await runtime.catalog.updateTreatment(
        data.id as ID,
        { name: data.name, isActive: data.isActive },
        session.accessToken
      );
    }

    if (data.priceMinor !== undefined) {
      const priceLists = await runtime.catalog.listPriceLists(session.accessToken);
      let defaultPl = priceLists.find((pl) => pl.isDefault) || priceLists[0];
      if (!defaultPl) {
        defaultPl = await runtime.catalog.createPriceList(
          { name: "Standart Tarife", currency: "TRY", isDefault: true },
          session.accessToken
        );
      }

      let existingItems: { treatmentId: string; amount: number }[] = [];
      try {
        const plDetail = await runtime.catalog.getPriceList(defaultPl.id, session.accessToken);
        existingItems = (plDetail.items || []).map((i) => ({
          treatmentId: String(i.treatmentId),
          amount: i.amount,
        }));
      } catch {
        // Ignore
      }

      const updatedItems = [
        ...existingItems.filter((i) => i.treatmentId !== data.id),
        { treatmentId: data.id, amount: Math.max(0, data.priceMinor) },
      ];

      await runtime.catalog.setPriceItems(defaultPl.id, updatedItems, session.accessToken);
    }

    revalidatePath("/app/clinic");
    revalidatePath("/app/plans");

    if (!tr) {
      const allTreatments = await runtime.catalog.listTreatments(session.accessToken);
      tr = allTreatments.find((t) => t.id === data.id);
    }

    return { success: true, data: tr };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "İşlem güncellenemedi.";
    return { success: false, error: msg };
  }
}

export async function batchSaveTreatmentPricesAction(
  updates: { treatmentId: string; amount: number }[]
): Promise<ActionResult<{ updatedCount: number }>> {
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

    const priceLists = await runtime.catalog.listPriceLists(session.accessToken);
    let defaultPl = priceLists.find((pl) => pl.isDefault) || priceLists[0];
    if (!defaultPl) {
      defaultPl = await runtime.catalog.createPriceList(
        { name: "Standart Tarife", currency: "TRY", isDefault: true },
        session.accessToken
      );
    }

    let existingItems: { treatmentId: string; amount: number }[] = [];
    try {
      const plDetail = await runtime.catalog.getPriceList(defaultPl.id, session.accessToken);
      existingItems = (plDetail.items || []).map((i) => ({
        treatmentId: String(i.treatmentId),
        amount: i.amount,
      }));
    } catch {
      // Ignore
    }

    const updateMap = new Map<string, number>();
    for (const u of updates) {
      updateMap.set(u.treatmentId, Math.max(0, u.amount));
    }

    const merged: { treatmentId: string; amount: number }[] = [];
    for (const it of existingItems) {
      if (updateMap.has(it.treatmentId)) {
        merged.push({ treatmentId: it.treatmentId, amount: updateMap.get(it.treatmentId)! });
        updateMap.delete(it.treatmentId);
      } else {
        merged.push(it);
      }
    }
    for (const [tId, amount] of updateMap.entries()) {
      merged.push({ treatmentId: tId, amount });
    }

    await runtime.catalog.setPriceItems(defaultPl.id, merged, session.accessToken);
    revalidatePath("/app/clinic");
    revalidatePath("/app/plans");

    return { success: true, data: { updatedCount: updates.length } };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Fiyatlar toplu kaydedilemedi.";
    return { success: false, error: msg };
  }
}

export async function deleteTreatmentAction(
  treatmentId: string
): Promise<ActionResult<{ deleted: boolean }>> {
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

    await runtime.catalog.deleteTreatment(treatmentId as ID, session.accessToken);
    revalidatePath("/app/clinic");
    revalidatePath("/app/plans");

    return { success: true, data: { deleted: true } };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "İşlem silinemedi.";
    return { success: false, error: msg };
  }
}

const LEAD_DEDUPE_MS = 10 * 60 * 1000;
const recentLeads = new Map<string, number>();

type LeadKind =
  | { kind: "upgrade" }
  | { kind: "extra_pdf"; pdfs: number; priceMinor: number; currency: string };

/**
 * Satış talebi (paket yükseltme / ek PDF paketi). Ödeme ya da paket değişikliği
 * YAPMAZ; mevcut satış kuyruğuna (demo-requests) kampanya bilgisiyle kayıt düşer.
 */
async function submitLead(lead: LeadKind): Promise<ActionResult<{ alreadyRequested: boolean }>> {
  try {
    const runtime = getRuntime();
    const session = await resolveActiveSession(runtime.config, runtime.backend);
    if (!session) {
      return { success: false, unauthenticated: true, error: "Oturum bulunamadı." };
    }

    const dedupeKey = `${session.clinicId}:${lead.kind === "extra_pdf" ? `pdf${lead.pdfs}` : "upgrade"}`;
    const last = recentLeads.get(dedupeKey);
    if (last && Date.now() - last < LEAD_DEDUPE_MS) {
      return { success: true, data: { alreadyRequested: true } };
    }

    const [settings, subscription] = await Promise.all([
      runtime.clinic.getSettings(session.accessToken),
      runtime.subscription.getCurrent(session.accessToken),
    ]);

    let summary: string[];
    if (lead.kind === "upgrade") {
      if (subscription && isProfessionalTier(subscription.tier)) {
        return { success: false, error: "Paketiniz zaten profesyonel seviyede." };
      }
      const target = pickUpgradeTarget(
        await runtime.subscription.listPlans(session.accessToken)
      );
      summary = [
        "[UPGRADE] Paket yükseltme talebi",
        `hedef=${target ? target.id : "ultimate"}`,
        `kampanya=%${UPGRADE_DISCOUNT_PERCENT}`,
      ];
    } else {
      summary = [
        "[EXTRA_PDF] Ek PDF paketi talebi (aylık)",
        `adet=${lead.pdfs}`,
        `fiyat=${lead.priceMinor / 100} ${lead.currency}/ay`,
      ];
    }

    await runtime.subscription.requestUpgrade({
      clinicName: settings.name,
      contactName: settings.signerName || settings.doctor?.name || settings.name,
      email: settings.email || session.userEmail || "",
      phone: settings.phone || "",
      website: settings.website?.trim() || runtime.config.app.url || "https://treatment.plus",
      notes: [
        ...summary,
        `workspace=${session.clinicId}`,
        `mevcut=${subscription ? tierLabel(subscription.tier) : "-"}`,
      ].join(" | "),
    });

    recentLeads.set(dedupeKey, Date.now());
    return { success: true, data: { alreadyRequested: false } };
  } catch (err: unknown) {
    getRuntime().log.error("subscription_lead_failed", {
      kind: lead.kind,
      error: err instanceof Error ? err.message : String(err),
    });
    return { success: false, error: "Talep gönderilemedi. Lütfen tekrar deneyin." };
  }
}

export async function requestUpgradeAction(): Promise<ActionResult<{ alreadyRequested: boolean }>> {
  return submitLead({ kind: "upgrade" });
}

export async function requestExtraPdfPackAction(
  pdfs: number
): Promise<ActionResult<{ alreadyRequested: boolean }>> {
  const pack = findExtraPdfPack(pdfs);
  if (!pack) return { success: false, error: "Geçersiz paket." };
  return submitLead({ kind: "extra_pdf", ...pack });
}
