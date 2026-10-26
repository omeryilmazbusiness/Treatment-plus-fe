import "server-only";

import { AppError, ErrorCode } from "@/shared/errx";
import type { Config } from "@/platform/config/env";

import { errorFromResponse } from "./errors";
import type { BackendGateway, BackendRequest, HealthStatus } from "./types";

/**
 * Server-only Go API client. The browser never receives API_URL.
 * Cookies stay on the Next origin; this client sends Authorization when given.
 */
export class BackendClient implements BackendGateway {
  constructor(private readonly cfg: Config) {}

  async healthz(): Promise<HealthStatus> {
    return this.request<HealthStatus>({ path: "/healthz" });
  }

  async readyz(): Promise<HealthStatus> {
    return this.request<HealthStatus>({ path: "/readyz" });
  }

  async request<T>(req: BackendRequest): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.cfg.api.timeoutMs);
    const requestId = req.requestId ?? "tp-bff";

    try {
      const res = await fetch(`${this.cfg.api.url}${req.path}`, {
        method: req.method ?? "GET",
        headers: {
          Accept: "application/json",
          ...(req.body !== undefined ? { "Content-Type": "application/json" } : {}),
          "X-Request-Id": requestId,
          ...(req.accessToken ? { Authorization: `Bearer ${req.accessToken}` } : {}),
        },
        body: req.body === undefined ? undefined : JSON.stringify(req.body),
        cache: "no-store",
        signal: req.signal ?? controller.signal,
      });

      const body = await readBody(res);
      if (!res.ok) {
        throw errorFromResponse(res.status, body);
      }
      return body as T;
    } catch (err) {
      if (err instanceof AppError) throw err;
      if (err instanceof DOMException && err.name === "AbortError") {
        throw new AppError(ErrorCode.Unavailable, "api timeout", 503, { cause: err });
      }
      throw new AppError(ErrorCode.Unavailable, "api unreachable", 503, { cause: err });
    } finally {
      clearTimeout(timer);
    }
  }
}

async function readBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}
