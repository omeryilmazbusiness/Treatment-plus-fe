"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getRuntime } from "@/bootstrap";
import {
  clearSession,
  readRawSession,
  writeSession,
  type Session,
} from "@/platform/auth/session";

export interface LoginActionFields {
  readonly email?: string;
  readonly password?: string;
}

export interface LoginActionState {
  readonly error?: string;
  readonly fields?: LoginActionFields;
}

export async function loginAction(formData: FormData) {
  const email = ((formData.get("email") as string) || "").trim().toLowerCase();
  const password = (formData.get("password") as string) || "";

  if (!email || !password) {
    redirect("/login");
  }

  const runtime = getRuntime();
  const prevSession = await readRawSession(runtime.config);
  if (prevSession?.refreshToken) {
    try {
      await runtime.backend.request({
        path: "/v1/auth/logout",
        method: "POST",
        body: { refresh_token: prevSession.refreshToken },
      });
    } catch {
      // Best-effort revoke previous session
    }
  }
  await clearSession(runtime.config);

  const loginRes = await runtime.backend.request<{
    user: { id: string; email: string; role: string };
    workspace: { id: string; name: string };
    tokens: { access_token: string; refresh_token?: string };
  }>({
    path: "/v1/auth/login",
    method: "POST",
    body: { email, password },
  });

  const session: Session = {
    accessToken: loginRes.tokens.access_token,
    refreshToken: loginRes.tokens.refresh_token,
    userId: loginRes.user.id,
    clinicId: loginRes.workspace.id,
    userEmail: loginRes.user.email,
    role: "owner",
  };
  await writeSession(runtime.config, session);
  revalidatePath("/", "layout");
  revalidatePath("/app", "layout");
  redirect("/app");
}

export async function loginClinicAction(
  _prevState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  const rawEmail = ((formData.get("email") as string) || "").trim();
  const email = rawEmail.toLowerCase();
  const password = (formData.get("password") as string) || "";
  const fields: LoginActionFields = { email: rawEmail, password };

  if (!email || !email.includes("@")) {
    return { error: "Geçerli bir e-posta adresi giriniz.", fields };
  }
  if (!password) {
    return { error: "Lütfen şifrenizi giriniz.", fields };
  }

  const runtime = getRuntime();
  try {
    const prevSession = await readRawSession(runtime.config);
    if (prevSession?.refreshToken) {
      try {
        await runtime.backend.request({
          path: "/v1/auth/logout",
          method: "POST",
          body: { refresh_token: prevSession.refreshToken },
        });
      } catch {
        // Best-effort revoke previous session
      }
    }
    await clearSession(runtime.config);

    const loginRes = await runtime.backend.request<{
      user: { id: string; email: string; role: string };
      workspace: { id: string; name: string };
      tokens: { access_token: string; refresh_token?: string };
    }>({
      path: "/v1/auth/login",
      method: "POST",
      body: { email, password },
    });

    const session: Session = {
      accessToken: loginRes.tokens.access_token,
      refreshToken: loginRes.tokens.refresh_token,
      userId: loginRes.user.id,
      clinicId: loginRes.workspace.id,
      userEmail: loginRes.user.email,
      role: "owner",
    };
    await writeSession(runtime.config, session);
    revalidatePath("/", "layout");
    revalidatePath("/app", "layout");
  } catch (err: unknown) {
    const rawMsg = err instanceof Error ? err.message : "";
    if (!rawMsg || rawMsg.includes("unauthenticated")) {
      return {
        error: "E-posta veya şifre hatalı. Lütfen bilgilerinizi kontrol edin.",
        fields,
      };
    }
    return {
      error: rawMsg,
      fields,
    };
  }

  return { error: undefined };
}

export async function logoutClinicAction() {
  const runtime = getRuntime();
  const current = await readRawSession(runtime.config);
  if (current?.refreshToken) {
    try {
      await runtime.backend.request({
        path: "/v1/auth/logout",
        method: "POST",
        body: { refresh_token: current.refreshToken },
      });
    } catch {
      // Best-effort backend session revoke
    }
  }
  await clearSession(runtime.config);
  revalidatePath("/", "layout");
  revalidatePath("/app", "layout");
  redirect("/login");
}
