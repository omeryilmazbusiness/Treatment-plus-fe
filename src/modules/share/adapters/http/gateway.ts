import type { BackendGateway } from "@/platform/http/types";
import { AppError } from "@/shared/errx";

import type { PublicEventWriter, PublicPlanReader, ShareCommand } from "../../application/ports";
import type { ShareLink } from "../../domain/share";

/** Phase 6: POST /v1/plans/:id/send  GET /v1/public/plans/:token  POST events */
export class ShareHttpGateway implements ShareCommand, PublicPlanReader, PublicEventWriter {
  constructor(private readonly http: BackendGateway) {}

  send(): Promise<ShareLink> {
    return this.notReady("share.send");
  }

  getByToken(): Promise<unknown> {
    return this.notReady("share.getByToken");
  }

  track(): Promise<void> {
    return this.notReady("share.track");
  }

  private notReady(name: string): never {
    void this.http;
    throw AppError.notImplemented(name);
  }
}
