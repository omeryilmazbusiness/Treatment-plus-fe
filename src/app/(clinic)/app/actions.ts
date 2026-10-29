"use server";

import { revalidatePath } from "next/cache";

import { getRuntime } from "@/bootstrap";
import type { ClinicSettings, WorkspaceProducts } from "@/modules/clinic/domain/clinic";
import type { Patient, Plan } from "@/modules/plan/domain/plan";
import { resolveActiveSession } from "@/platform/auth/session";

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

    const [settings, plans, patients] = await Promise.all([
      runtime.clinic.getSettings(session.accessToken),
      runtime.plan.listPlans(session.accessToken),
      runtime.plan.list(session.accessToken),
    ]);

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
