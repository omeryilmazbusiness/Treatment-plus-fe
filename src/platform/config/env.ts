export type AppEnv = "local" | "test" | "staging" | "production";

export type Config = {
  app: {
    name: string;
    env: AppEnv;
    url: string;
  };
  api: {
    url: string;
    timeoutMs: number;
  };
  session: {
    cookie: string;
    secure: boolean;
  };
};

export function loadConfig(): Config {
  const env = (read("APP_ENV", "local") || "local") as AppEnv;
  const apiUrl = read("API_URL", "http://localhost:8080");
  if (!apiUrl) {
    throw new Error("config: API_URL is required");
  }

  return {
    app: {
      name: read("APP_NAME", "treatment-plus-fe") ?? "treatment-plus-fe",
      env,
      url: read("APP_URL", "http://localhost:3000") ?? "http://localhost:3000",
    },
    api: {
      url: stripSlash(apiUrl),
      timeoutMs: int("API_TIMEOUT_MS", 8000),
    },
    session: {
      cookie: read("SESSION_COOKIE", "tp_session") ?? "tp_session",
      secure: bool("SESSION_SECURE", env === "production"),
    },
  };
}

export function isLocal(cfg: Config): boolean {
  return cfg.app.env === "local" || cfg.app.env === "test";
}

function read(key: string, fallback = ""): string | undefined {
  const value = process.env[key]?.trim();
  return value || fallback || undefined;
}

function int(key: string, fallback: number): number {
  const raw = process.env[key]?.trim();
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : fallback;
}

function bool(key: string, fallback: boolean): boolean {
  const raw = process.env[key]?.trim().toLowerCase();
  if (!raw) return fallback;
  if (["1", "true", "yes", "on"].includes(raw)) return true;
  if (["0", "false", "no", "off"].includes(raw)) return false;
  return fallback;
}

function stripSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}
