import "server-only";

import { cookies } from "next/headers";

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

export async function readSession(cfg: Config): Promise<Session | null> {
  const jar = await cookies();
  const raw = jar.get(cfg.session.cookie)?.value;
  if (!raw) return null;
  return decode(raw);
}

export async function writeSession(cfg: Config, session: Session): Promise<void> {
  const jar = await cookies();
  jar.set(cfg.session.cookie, encode(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: cfg.session.secure,
    path: "/",
  });
}

export async function clearSession(cfg: Config): Promise<void> {
  const jar = await cookies();
  jar.delete(cfg.session.cookie);
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
