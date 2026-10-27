"use server";

import { redirect } from "next/navigation";

import { getRuntime } from "@/bootstrap";
import { writeSession, type Session } from "@/platform/auth/session";

export async function loginAction(formData: FormData) {
  const email = (formData.get("email") as string) || "demo@dentistplus.com";
  const password = (formData.get("password") as string) || "password123456";

  const runtime = getRuntime();
  const loginRes = await runtime.backend.request<{
    user: { id: string; email: string; role: string };
    workspace: { id: string; name: string };
    tokens: { access_token: string };
  }>({
    path: "/v1/auth/login",
    method: "POST",
    body: { email, password },
  });

  const session: Session = {
    accessToken: loginRes.tokens.access_token,
    userId: loginRes.user.id,
    clinicId: loginRes.workspace.id,
    role: "owner",
  };
  await writeSession(runtime.config, session);
  redirect("/app");
}
