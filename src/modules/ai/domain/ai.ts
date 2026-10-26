import type { ID } from "@/shared/id";

export const AiKind = {
  Summary: "summary",
  Letter: "letter",
  Translate: "translate",
} as const;

export type AiKind = (typeof AiKind)[keyof typeof AiKind];

/** Draft only. No auto-send. The clinician always edits first. */
export type AiJob = {
  id: ID;
  planId: ID;
  kind: AiKind;
};
