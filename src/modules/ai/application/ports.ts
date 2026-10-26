import type { ID } from "@/shared/id";

import type { AiJob, AiKind } from "../domain/ai";

export interface AiCommand {
  enqueue(planId: ID, kind: AiKind): Promise<AiJob>;
}
