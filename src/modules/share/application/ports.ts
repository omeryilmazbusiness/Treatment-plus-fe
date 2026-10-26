import type { ID } from "@/shared/id";

import type { EventKind, ShareLink } from "../domain/share";

export interface ShareCommand {
  send(planId: ID): Promise<ShareLink>;
}

export interface PublicPlanReader {
  getByToken(token: string): Promise<unknown>;
}

export interface PublicEventWriter {
  track(token: string, kind: EventKind): Promise<void>;
}
