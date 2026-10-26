import type { ID } from "@/shared/id";

import type { PlanView } from "../domain/view";

export interface PlanViewReader {
  getByPlanId(planId: ID): Promise<PlanView>;
}

export interface PdfCommand {
  enqueue(planId: ID): Promise<void>;
}
