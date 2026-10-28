"use server";

import { revalidatePath } from "next/cache";

import { getRuntime } from "@/bootstrap";
import {
  clearSession,
  readRawSession,
  writeSession,
  type Session,
} from "@/platform/auth/session";

export interface RegisterActionFields {
  readonly name?: string;
  readonly signerName?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly address?: string;
  readonly password?: string;
}

export interface RegisterActionState {
  readonly error?: string;
  readonly fields?: RegisterActionFields;
}

export async function registerClinicAction(
  _prevState: RegisterActionState,
  formData: FormData
): Promise<RegisterActionState> {
  const name = ((formData.get("name") as string) || "").trim();
  const signerName = ((formData.get("signerName") as string) || "").trim();
  const rawEmail = ((formData.get("email") as string) || "").trim();
  const email = rawEmail.toLowerCase();
  const password = (formData.get("password") as string) || "";
  const phone = ((formData.get("phone") as string) || "").trim();
  const address = ((formData.get("address") as string) || "").trim();

  const fields: RegisterActionFields = {
    name,
    signerName,
    email: rawEmail,
    phone,
    address,
    password,
  };

  if (name.length < 2) {
    return { error: "Klinik adı en az 2 karakter olmalıdır.", fields };
  }
  if (!email || !email.includes("@")) {
    return { error: "Geçerli bir e-posta adresi giriniz.", fields };
  }
  if (password.length < 8) {
    return { error: "Şifreniz en az 8 karakter olmalıdır.", fields };
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

    const regRes = await runtime.backend.request<{
      user: { id: string; email: string; role: string };
      workspace: { id: string; name: string };
      tokens: { access_token: string; refresh_token?: string };
    }>({
      path: "/v1/auth/register",
      method: "POST",
      body: {
        name,
        email,
        password,
        role: "clinic",
        clinic: {
          slogan: `${name} · Dijital Tedavi Planlama`,
          phone: phone || "+90 (212) 000 00 00",
          email,
          address: address || "İstanbul, Türkiye",
          hours: "Pzt–Cmt 09:00–19:00",
          signer_name: signerName || name,
          signer_title: "Başhekim",
          locale: "tr",
          currency: "TRY",
        },
      },
    });

    const session: Session = {
      accessToken: regRes.tokens.access_token,
      refreshToken: regRes.tokens.refresh_token,
      userId: regRes.user.id,
      clinicId: regRes.workspace.id,
      userEmail: regRes.user.email,
      role: "owner",
    };

    await writeSession(runtime.config, session);
    revalidatePath("/", "layout");
    revalidatePath("/app", "layout");
  } catch (err: unknown) {
    const rawMsg = err instanceof Error ? err.message : "";
    if (rawMsg.includes("email_taken") || rawMsg.includes("already")) {
      return {
        error: "Bu e-posta adresi ile kayıtlı bir klinik zaten mevcut.",
        fields,
      };
    }
    if (rawMsg.includes("invalid_email") || rawMsg.includes("email is invalid")) {
      return {
        error: "Geçerli bir e-posta adresi giriniz.",
        fields,
      };
    }
    if (rawMsg.includes("invalid_password") || rawMsg.includes("password must be")) {
      return {
        error: "Şifreniz en az 8 karakter olmalıdır.",
        fields,
      };
    }
    if (rawMsg.includes("invalid_name") || rawMsg.includes("name must be")) {
      return {
        error: "Klinik adı en az 2 karakter olmalıdır.",
        fields,
      };
    }
    return {
      error:
        rawMsg || "Kayıt işlemi sırasında bir hata oluştu. Lütfen kontrol edin.",
      fields,
    };
  }

  return { error: undefined };
}
