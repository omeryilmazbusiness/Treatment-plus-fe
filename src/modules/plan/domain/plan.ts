import type { ID } from "@/shared/id";
import type { Money } from "@/shared/money";

export const PlanStatus = {
  Draft: "draft",
  Ready: "ready",
  Sent: "sent",
  Viewed: "viewed",
  Accepted: "accepted",
  Expired: "expired",
  Revoked: "revoked",
} as const;

export type PlanStatus = (typeof PlanStatus)[keyof typeof PlanStatus];

export type Patient = {
  id: ID;
  clinicId: ID;
  name: string;
};

export type PlanItem = {
  id: ID;
  treatmentId: ID;
  quantity: number;
  unitPrice: Money;
  inPackage: boolean;
};

export type Visit = {
  id: ID;
  ordinal: number;
  title: string;
  waitNote: string;
  items: PlanItem[];
};

export type Discount = {
  label: string;
  amount: Money;
};

export type Totals = {
  subtotal: Money;
  discount: Money;
  grand: Money;
};

export type Plan = {
  id: ID;
  clinicId: ID;
  patientId: ID;
  status: PlanStatus;
  visits: Visit[];
  discounts: Discount[];
  totals: Totals;
};
