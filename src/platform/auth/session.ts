import "server-only";

import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";

import { isLocal, type Config } from "@/platform/config/env";
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

const LOCAL_DEFAULT_JWT_SECRET = "local-dev-jwt-access-secret-min-32b";

type GlobalSessionStore = {
  byAccount: Map<string, Session>;
  inflight: Map<string, Promise<Session | null>>;
};

function getGlobalSessionStore(): GlobalSessionStore {
  const g = globalThis as unknown as { __tpSessionStore?: GlobalSessionStore };
  if (!g.__tpSessionStore) {
    g.__tpSessionStore = {
      byAccount: new Map<string, Session>(),
      inflight: new Map<string, Promise<Session | null>>(),
    };
  }
  return g.__tpSessionStore;
}

function cacheAccountSession(
  store: GlobalSessionStore,
  accountKey: string,
  session: Session
): void {
  if (store.byAccount.size >= 256 && !store.byAccount.has(accountKey)) {
    const oldestKey = store.byAccount.keys().next().value;
    if (oldestKey) store.byAccount.delete(oldestKey);
  }
  store.byAccount.set(accountKey, session);
}

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

/**
 * In local development, if a Server Component render previously rotated a
 * refresh token without being able to persist the new cookie in the browser,
 * verify the existing JWT's HMAC-SHA256 signature and issue a fresh token for
 * the exact same userId/clinicId/role so the active browser tab recovers seamlessly.
 */
function recoverLocalSessionIfValid(
  cfg: Config,
  rawSession: Session
): Session | null {
  if (!isLocal(cfg)) return null;
  const secret = process.env.JWT_ACCESS_SECRET?.trim() || LOCAL_DEFAULT_JWT_SECRET;
  if (secret.length < 32) return null;

  try {
    const parts = rawSession.accessToken.split(".");
    if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) return null;

    const signingInput = `${parts[0]}.${parts[1]}`;
    const expectedSig = createHmac("sha256", secret)
      .update(signingInput)
      .digest();
    const actualSig = Buffer.from(parts[2], "base64url");
    if (
      expectedSig.length !== actualSig.length ||
      !timingSafeEqual(expectedSig, actualSig)
    ) {
      return null;
    }

    const claims = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf8")
    ) as {
      user_id?: string;
      clinic_id?: string;
      role?: string;
      iss?: string;
      sub?: string;
    };

    const userId = claims.user_id || claims.sub || rawSession.userId;
    const clinicId = claims.clinic_id || rawSession.clinicId;
    if (userId !== rawSession.userId || clinicId !== rawSession.clinicId) {
      return null;
    }

    const nowSec = Math.floor(Date.now() / 1000);
    const headerB64 = Buffer.from(
      JSON.stringify({ alg: "HS256", typ: "JWT" }),
      "utf8"
    ).toString("base64url");
    const payloadB64 = Buffer.from(
      JSON.stringify({
        user_id: userId,
        clinic_id: clinicId,
        role: claims.role || "clinic",
        iss: claims.iss || "treatment-plus",
        sub: userId,
        jti: randomUUID(),
        iat: nowSec,
        nbf: nowSec - 5,
        exp: nowSec + 30 * 24 * 3600,
      }),
      "utf8"
    ).toString("base64url");
    const newSig = createHmac("sha256", secret)
      .update(`${headerB64}.${payloadB64}`)
      .digest("base64url");

    return {
      ...rawSession,
      accessToken: `${headerB64}.${payloadB64}.${newSig}`,
    };
  } catch {
    return null;
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

  const store = getGlobalSessionStore();
  const accountKey = `${rawSession.userId}:${rawSession.clinicId}`;

  if (!isTokenExpired(rawSession.accessToken)) {
    cacheAccountSession(store, accountKey, rawSession);
    return rawSession;
  }

  // If a recent RSC render or parallel action already refreshed this account's token,
  // reuse the fresh session and persist it to the cookie if we are now in a Server Action.
  const cachedSession = store.byAccount.get(accountKey);
  if (
    cachedSession &&
    cachedSession.userId === rawSession.userId &&
    cachedSession.clinicId === rawSession.clinicId &&
    !isTokenExpired(cachedSession.accessToken)
  ) {
    await writeSession(cfg, cachedSession);
    return cachedSession;
  }

  const activeRefreshToken =
    cachedSession?.refreshToken || rawSession.refreshToken;

  if (!activeRefreshToken) {
    const recovered = recoverLocalSessionIfValid(cfg, rawSession);
    if (recovered) {
      cacheAccountSession(store, accountKey, recovered);
      await writeSession(cfg, recovered);
      return recovered;
    }
    return null;
  }

  const inflightKey = `${accountKey}:${activeRefreshToken}`;
  const existingInflight = store.inflight.get(inflightKey);
  if (existingInflight) {
    const resolved = await existingInflight;
    if (resolved) {
      await writeSession(cfg, resolved);
    }
    return resolved;
  }

  const refreshPromise = (async (): Promise<Session | null> => {
    try {
      const refreshed = await backend.request<{
        user: { id: string; email: string; role: string };
        workspace: { id: string; name: string };
        tokens: { access_token: string; refresh_token?: string };
      }>({
        path: "/v1/auth/refresh",
        method: "POST",
        body: { refresh_token: activeRefreshToken },
      });

      if (
        refreshed.workspace.id !== rawSession.clinicId ||
        refreshed.user.id !== rawSession.userId
      ) {
        return null;
      }

      const nextSession: Session = {
        accessToken: refreshed.tokens.access_token,
        refreshToken: refreshed.tokens.refresh_token ?? activeRefreshToken,
        userId: refreshed.user.id,
        clinicId: refreshed.workspace.id,
        userEmail: refreshed.user.email || rawSession.userEmail,
        role: rawSession.role,
      };
      cacheAccountSession(store, accountKey, nextSession);
      await writeSession(cfg, nextSession);
      return nextSession;
    } catch {
      const recovered = recoverLocalSessionIfValid(cfg, rawSession);
      if (recovered) {
        cacheAccountSession(store, accountKey, recovered);
        await writeSession(cfg, recovered);
        return recovered;
      }
      return null;
    } finally {
      store.inflight.delete(inflightKey);
    }
  })();

  store.inflight.set(inflightKey, refreshPromise);
  return refreshPromise;
}

export async function writeSession(cfg: Config, session: Session): Promise<void> {
  const store = getGlobalSessionStore();
  cacheAccountSession(store, `${session.userId}:${session.clinicId}`, session);
  try {
    const jar = await cookies();
    jar.set(cfg.session.cookie, encode(session), {
      httpOnly: true,
      sameSite: "lax",
      secure: cfg.session.secure,
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 gün
    });
  } catch {
    // Silently ignore if called in Server Component render where cookie modification is forbidden
  }
}

export async function clearSession(cfg: Config): Promise<void> {
  try {
    const jar = await cookies();
    const raw = jar.get(cfg.session.cookie)?.value;
    if (raw) {
      const decoded = decode(raw);
      if (decoded) {
        getGlobalSessionStore().byAccount.delete(
          `${decoded.userId}:${decoded.clinicId}`
        );
      }
    }
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
