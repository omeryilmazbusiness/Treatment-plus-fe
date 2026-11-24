"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { getRuntime } from "@/bootstrap";
import type { PriceList, Treatment } from "@/modules/catalog/domain/catalog";
import type { ClinicSettings } from "@/modules/clinic/domain/clinic";
import { resolveActiveSession } from "@/platform/auth/session";

import { seedDefaultCatalog } from "../(clinic)/app/plans/actions";
import { SETUP_LATER_COOKIE } from "./guard";

export type SetupResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
  unauthenticated?: boolean;
};

export type SetupPriceRow = { treatmentId: string; amount: number };

export type SetupCatalog = {
  treatments: Treatment[];
  prices: SetupPriceRow[];
};

export type SetupData = {
  settings: ClinicSettings;
  catalog: SetupCatalog;
  userEmail: string;
  workspaceId: string;
};

const UNAUTH: SetupResult<never> = {
  success: false,
  unauthenticated: true,
  error: "Oturum süreniz doldu. Lütfen tekrar giriş yapın.",
};

async function loadCatalog(accessToken: string): Promise<SetupCatalog> {
  const runtime = getRuntime();
  const [treatments, priceLists] = await Promise.all([
    runtime.catalog.listTreatments(accessToken),
    runtime.catalog.listPriceLists(accessToken),
  ]);
  const list: PriceList | undefined =
    priceLists.find((pl) => pl.isDefault) ?? priceLists[0];
  let prices: SetupPriceRow[] = [];
  if (list) {
    try {
      const detail = await runtime.catalog.getPriceList(list.id, accessToken);
      prices = (detail.items ?? []).map((i) => ({
        treatmentId: String(i.treatmentId),
        amount: i.amount,
      }));
    } catch {
      prices = [];
    }
  }
  return { treatments: treatments.filter((t) => t.isActive !== false), prices };
}

/** Kurulum verisi — kataloğu kendiliğinden tohumlamaz (bkz. ensureCatalogAction). */
export async function fetchSetupDataAction(): Promise<SetupResult<SetupData>> {
  try {
    const runtime = getRuntime();
    const session = await resolveActiveSession(runtime.config, runtime.backend);
    if (!session) return UNAUTH;
    const [settings, catalog] = await Promise.all([
      runtime.clinic.getSettings(session.accessToken),
      loadCatalog(session.accessToken),
    ]);
    return {
      success: true,
      data: {
        settings,
        catalog,
        userEmail: session.userEmail || settings.email,
        workspaceId: session.clinicId,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Kurulum bilgileri yüklenemedi.";
    if (msg.includes("unauthenticated")) return UNAUTH;
    return { success: false, error: msg };
  }
}

/** Aynı klinik için eşzamanlı tohumlamayı tek isteğe indirir (çift katalog olmasın). */
const seeding = new Map<string, Promise<void>>();

/** Katalog boşsa standart tedavi listesini ve tarifeyi oluşturur. */
export async function ensureCatalogAction(): Promise<SetupResult<SetupCatalog>> {
  try {
    const runtime = getRuntime();
    const session = await resolveActiveSession(runtime.config, runtime.backend);
    if (!session) return UNAUTH;

    let pending = seeding.get(session.clinicId);
    if (!pending) {
      pending = (async () => {
        const existing = await runtime.catalog.listTreatments(session.accessToken);
        if (existing.length === 0) await seedDefaultCatalog(session.accessToken);
      })().finally(() => seeding.delete(session.clinicId));
      seeding.set(session.clinicId, pending);
    }
    await pending;

    revalidatePath("/app");
    revalidatePath("/app/clinic");
    return { success: true, data: await loadCatalog(session.accessToken) };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Tedavi kataloğu hazırlanamadı.";
    return { success: false, error: msg };
  }
}

/** Fiyatları varsayılan tarifeye toplu yazar. Tutarlar kuruş (tam sayı). */
export async function savePricesAction(
  rows: SetupPriceRow[]
): Promise<SetupResult<SetupCatalog>> {
  try {
    const runtime = getRuntime();
    const session = await resolveActiveSession(runtime.config, runtime.backend);
    if (!session) return UNAUTH;

    for (const row of rows) {
      if (!row.treatmentId || !Number.isInteger(row.amount) || row.amount < 0) {
        return { success: false, error: "Geçersiz fiyat değeri." };
      }
    }

    const priceLists = await runtime.catalog.listPriceLists(session.accessToken);
    let list = priceLists.find((pl) => pl.isDefault) ?? priceLists[0];
    if (!list) {
      list = await runtime.catalog.createPriceList(
        { name: "Standart Tarife", currency: "TRY", isDefault: true },
        session.accessToken
      );
    }

    const known = new Set(
      (await runtime.catalog.listTreatments(session.accessToken)).map((t) => String(t.id))
    );
    let existing: SetupPriceRow[] = [];
    try {
      const detail = await runtime.catalog.getPriceList(list.id, session.accessToken);
      existing = (detail.items ?? []).map((i) => ({
        treatmentId: String(i.treatmentId),
        amount: i.amount,
      }));
    } catch {
      existing = [];
    }

    const merged = new Map(existing.map((r) => [r.treatmentId, r.amount]));
    for (const row of rows) {
      if (known.has(row.treatmentId)) merged.set(row.treatmentId, row.amount);
    }

    await runtime.catalog.setPriceItems(
      list.id,
      [...merged].map(([treatmentId, amount]) => ({ treatmentId, amount })),
      session.accessToken
    );

    revalidatePath("/app");
    revalidatePath("/app/clinic");
    revalidatePath("/app/plans");
    return { success: true, data: await loadCatalog(session.accessToken) };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Fiyatlar kaydedilemedi.";
    return { success: false, error: msg };
  }
}

/** "Daha sonra": bu tarayıcı oturumunda /app açılışında sihirbaza dönme. */
export async function deferSetupAction(): Promise<{ success: boolean }> {
  try {
    const runtime = getRuntime();
    const session = await resolveActiveSession(runtime.config, runtime.backend);
    if (!session) return { success: false };
    const jar = await cookies();
    jar.set(SETUP_LATER_COOKIE, session.clinicId, {
      httpOnly: true,
      sameSite: "lax",
      secure: runtime.config.session.secure,
      path: "/",
    });
    return { success: true };
  } catch {
    return { success: false };
  }
}
