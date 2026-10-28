import "server-only";

import { cookies } from "next/headers";
import { connection } from "next/server";

import type { Config } from "@/platform/config/env";
import type { BackendGateway } from "@/platform/http/types";

export type SessionRole = "owner" | "doctor" | "assistant";

/**
 * Session lives only on the Next origin (httpOnly cookie).
 * The browser never attaches this cookie to the Go API.
 */
export type Session = {
  accessToken: string;
  refreshToken?: string;
  userId: string;
  clinicId: string;
  userEmail?: string;
  role: SessionRole;
};

export function isTokenExpired(token?: string | null): boolean {
  if (!token) return true;
  try {
    const parts = token.split(".");
    const part = parts[1];
    if (parts.length !== 3 || !part) return true;
    const payload = JSON.parse(
      Buffer.from(part, "base64url").toString("utf8")
    );
    if (!payload.exp) return false;
    // Expired or expiring within 30 seconds
    return Date.now() >= payload.exp * 1000 - 30000;
  } catch {
    return true;
  }
}

export async function readRawSession(cfg: Config): Promise<Session | null> {
  await connection();
  const jar = await cookies();
  const raw = jar.get(cfg.session.cookie)?.value;
  if (!raw) return null;
  return decode(raw);
}

export async function readSession(cfg: Config): Promise<Session | null> {
  const session = await readRawSession(cfg);
  if (!session || isTokenExpired(session.accessToken)) {
    return null;
  }
  return session;
}

/**
 * Resolves the active session for the current account only.
 * If the access token is expired and a refresh token exists for this session,
 * refreshes the token for the same workspace/user. Never falls back to another account.
 */
export async function resolveActiveSession(
  cfg: Config,
  backend: BackendGateway
): Promise<Session | null> {
  const rawSession = await readRawSession(cfg);
  if (!rawSession) return null;

  if (!isTokenExpired(rawSession.accessToken)) {
    return rawSession;
  }

  if (!rawSession.refreshToken) {
    return null;
  }

  try {
    const refreshed = await backend.request<{
      user: { id: string; email: string; role: string };
      workspace: { id: string; name: string };
      tokens: { access_token: string; refresh_token?: string };
    }>({
      path: "/v1/auth/refresh",
      method: "POST",
      body: { refresh_token: rawSession.refreshToken },
    });

    if (
      refreshed.workspace.id !== rawSession.clinicId ||
      refreshed.user.id !== rawSession.userId
    ) {
      return null;
    }

    const nextSession: Session = {
      accessToken: refreshed.tokens.access_token,
      refreshToken: refreshed.tokens.refresh_token ?? rawSession.refreshToken,
      userId: refreshed.user.id,
      clinicId: refreshed.workspace.id,
      userEmail: refreshed.user.email || rawSession.userEmail,
      role: rawSession.role,
    };
    await writeSession(cfg, nextSession);
    return nextSession;
  } catch {
    return null;
  }
}

export async function writeSession(cfg: Config, session: Session): Promise<void> {
  try {
    const jar = await cookies();
    jar.set(cfg.session.cookie, encode(session), {
      httpOnly: true,
      sameSite: "lax",
      secure: cfg.session.secure,
      path: "/",
    });
  } catch {
    // Silently ignore if called in Server Component render where cookie modification is forbidden
  }
}

export async function clearSession(cfg: Config): Promise<void> {
  try {
    const jar = await cookies();
    jar.delete(cfg.session.cookie);
  } catch {
    // Ignore in render
  }
}

function encode(session: Session): string {
  return Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
}

function decode(raw: string): Session | null {
  try {
    const parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as Session;
    if (!parsed.accessToken || !parsed.userId || !parsed.clinicId) return null;
    return parsed;
  } catch {
    return null;
  }
}
