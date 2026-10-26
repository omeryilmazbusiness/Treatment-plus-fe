export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type BackendRequest = {
  path: string;
  method?: HttpMethod;
  body?: unknown;
  accessToken?: string;
  requestId?: string;
  signal?: AbortSignal;
};

export type HealthStatus = {
  status: "ok" | "not_ready";
  checks?: Record<string, string>;
};

export type BackendErrorBody = {
  error: {
    code: string;
    message: string;
  };
};

/** Port implemented by the Go API client. Adapters depend on this, not fetch. */
export interface BackendGateway {
  request<T>(req: BackendRequest): Promise<T>;
  healthz(): Promise<HealthStatus>;
  readyz(): Promise<HealthStatus>;
}
