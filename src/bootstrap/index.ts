import "server-only";

import { loadConfig, type Config } from "@/platform/config/env";
import { BackendClient } from "@/platform/http/client";
import type { BackendGateway } from "@/platform/http/types";
import { createLogger, type Logger } from "@/platform/logger/logger";

/**
 * Composition root. Only `src/app` imports this package.
 * Use-cases receive ports; they never construct fetch or cookies.
 */
export type AppRuntime = {
  config: Config;
  backend: BackendGateway;
  log: Logger;
};

let runtime: AppRuntime | undefined;

export function getRuntime(): AppRuntime {
  if (runtime) return runtime;
  const config = loadConfig();
  runtime = {
    config,
    backend: new BackendClient(config),
    log: createLogger(config.app.name),
  };
  return runtime;
}
