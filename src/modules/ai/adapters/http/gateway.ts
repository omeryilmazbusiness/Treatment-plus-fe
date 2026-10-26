import type { BackendGateway } from "@/platform/http/types";
import { AppError } from "@/shared/errx";

import type { AiCommand } from "../../application/ports";
import type { AiJob } from "../../domain/ai";

/** Phase 8: POST /v1/plans/:id/ai/{summary,translate} */
export class AiHttpGateway implements AiCommand {
  constructor(private readonly http: BackendGateway) {}

  enqueue(): Promise<AiJob> {
    void this.http;
    throw AppError.notImplemented("ai.enqueue");
  }
}
