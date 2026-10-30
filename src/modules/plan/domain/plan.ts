import type { ID } from "@/shared/id";
import type { Currency } from "@/shared/money";

export const PlanStatus = {
  Draft: "draft",
  Ready: "ready",
  Sent: "sent",
  Viewed: "viewed",
  Accepted: "accepted",
  Expired: "expired",
} as const;

export type PlanStatus = (typeof PlanStatus)[keyof typeof PlanStatus];

export type ToothFinding = {
  tooth: string;
  status: "intact" | "missing" | "filled" | "crown";
  note?: string;
};

export type Situation = {
  xrayKey?: string;
  chartTeeth?: string[];
  toothFindings?: ToothFinding[];
  generalDiagnoses?: string[];
};

export type Patient = {
  id: ID;
  workspaceId?: ID;
  name: string;
  contact: string;
  createdAt?: string;
};

export type PlanItem = {
  id?: ID;
  planId?: ID;
  visitId?: ID;
  treatmentId?: ID;
  treatmentName: string;
  animationCode?: string;
  toothNumber?: string;
  teeth?: string[];
  description?: string;
  quantity: number;
  unitPrice: number; // minor units (kuruş)
  isPackage: boolean;
  orderNum?: number;
};

export type Visit = {
  id: ID;
  planId?: ID;
  orderNum: number;
  title: string;
  phaseLabel?: string;
  healingNote?: string;
  chartTeeth?: string[];
};

export type Discount = {
  id?: ID;
  planId?: ID;
  label: string;
  amount: number; // minor units (kuruş)
  orderNum?: number;
};

export type Totals = {
  subtotal: number; // minor units (kuruş)
  discount: number; // minor units (kuruş)
  grand: number; // minor units (kuruş)
};

export type Plan = {
  id: ID;
  workspaceId?: ID;
  patientId: ID;
  title: string;
  kind: "classic";
  status: PlanStatus;
  currency: Currency;
  palette?: "navy" | "forest" | "rose" | "slate";
  locale?: "tr" | "en";
  diagnoses: string[];
  situation?: Situation;
  totalsSubtotal: number;
  totalsDiscount: number;
  totalsGrand: number;
  snapshotJson?: unknown;
  createdAt?: string;
  updatedAt?: string;
  patient?: Patient;
  visits?: Visit[];
  items?: PlanItem[];
  discounts?: Discount[];
};
