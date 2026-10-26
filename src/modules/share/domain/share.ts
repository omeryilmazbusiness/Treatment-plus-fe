import type { ID } from "@/shared/id";

export const EventKind = {
  Opened: "opened",
  Cta: "cta",
  Accepted: "accepted",
} as const;

export type EventKind = (typeof EventKind)[keyof typeof EventKind];

export type ShareLink = {
  id: ID;
  clinicId: ID;
  planId: ID;
  expiresAt: string;
  revokedAt: string | null;
};

export type ShareEvent = {
  id: ID;
  linkId: ID;
  kind: EventKind;
};
