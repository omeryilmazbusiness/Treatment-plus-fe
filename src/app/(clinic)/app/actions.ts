"use server";

import { revalidatePath } from "next/cache";

import { getRuntime } from "@/bootstrap";
import type { ClinicSettings, WorkspaceProducts } from "@/modules/clinic/domain/clinic";
import { readSession, writeSession, type Session } from "@/platform/auth/session";

export type ActionResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

async function forceLogin(runtime: ReturnType<typeof getRuntime>): Promise<Session> {
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
}

async function ensureSession(): Promise<Session> {
  const runtime = getRuntime();
  const current = await readSession(runtime.config);
  if (current) return current;

  return forceLogin(runtime);
}

export async function fetchInitialDataAction(): Promise<
  ActionResult<{
    products: WorkspaceProducts;
    settings: ClinicSettings;
    userEmail: string;
  }>
> {
  try {
    const runtime = getRuntime();
    let session = await ensureSession();

    let products: WorkspaceProducts;
    let settings: ClinicSettings;
    try {
      [products, settings] = await Promise.all([
        runtime.clinic.getWorkspaceProducts(session.accessToken),
        runtime.clinic.getSettings(session.accessToken),
      ]);
    } catch (apiErr: unknown) {
      if (apiErr instanceof Error && apiErr.message.includes("unauthenticated")) {
        session = await forceLogin(runtime);
        [products, settings] = await Promise.all([
          runtime.clinic.getWorkspaceProducts(session.accessToken),
          runtime.clinic.getSettings(session.accessToken),
        ]);
      } else {
        throw apiErr;
      }
    }

    return {
      success: true,
      data: {
        products,
        settings,
        userEmail: "demo@dentistplus.com",
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Veri yüklenemedi";
    return { success: false, error: msg };
  }
}

export async function updateClinicSettingsAction(
  patch: Partial<ClinicSettings>
): Promise<ActionResult<ClinicSettings>> {
  try {
    const runtime = getRuntime();
    const session = await ensureSession();

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
