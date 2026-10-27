import "server-only";

import { cookies } from "next/headers";
import { connection } from "next/server";

import type { Config } from "@/platform/config/env";

export type SessionRole = "owner" | "doctor" | "assistant";

/**
 * Session lives only on the Next origin (httpOnly cookie).
 * The browser never attaches this cookie to the Go API.
 */
export type Session = {
  accessToken: string;
  userId: string;
  clinicId: string;
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

export async function readSession(cfg: Config): Promise<Session | null> {
  await connection();
  const jar = await cookies();
  const raw = jar.get(cfg.session.cookie)?.value;
  if (!raw) return null;
  const session = decode(raw);
  if (!session || isTokenExpired(session.accessToken)) {
    return null;
  }
  return session;
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
