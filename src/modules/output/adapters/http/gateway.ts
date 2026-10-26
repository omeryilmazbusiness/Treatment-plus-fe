import type { BackendGateway } from "@/platform/http/types";
import { AppError } from "@/shared/errx";

import type { PdfCommand, PlanViewReader } from "../../application/ports";
import type { PlanView } from "../../domain/view";

/** Phase 4/5: POST /v1/plans/:id/pdf enqueues work. HTTP does not wait. */
export class OutputHttpGateway implements PlanViewReader, PdfCommand {
  constructor(private readonly http: BackendGateway) {}

  getByPlanId(): Promise<PlanView> {
    return this.notReady("output.getByPlanId");
  }

  enqueue(): Promise<void> {
    return this.notReady("output.enqueuePdf");
  }

  private notReady(name: string): never {
    void this.http;
    throw AppError.notImplemented(name);
  }
}
