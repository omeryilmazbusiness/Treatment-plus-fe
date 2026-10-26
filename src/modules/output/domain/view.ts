import type { ID } from "@/shared/id";

/**
 * Single read-only output model. Web and Classic PDF render this.
 * A second price model is forbidden. Output never mutates a plan.
 */
export type PlanView = {
  planId: ID;
  clinicId: ID;
  payload: unknown;
};
