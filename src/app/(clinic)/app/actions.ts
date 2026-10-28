"use server";

import { revalidatePath } from "next/cache";

import { getRuntime } from "@/bootstrap";
import type { ClinicSettings, WorkspaceProducts } from "@/modules/clinic/domain/clinic";
import { resolveActiveSession } from "@/platform/auth/session";

export type ActionResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
  unauthenticated?: boolean;
};

export async function fetchInitialDataAction(): Promise<
  ActionResult<{
    products: WorkspaceProducts;
    settings: ClinicSettings;
    userEmail: string;
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
      // Fallback to session email or clinic name if /v1/auth/me is unavailable
    }

    return {
      success: true,
      data: {
        products,
        settings,
        userEmail,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Veri yüklenemedi";
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
    return { success: true, data: updated };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Ayarlar kaydedilemedi";
    return { success: false, error: msg };
  }
}
