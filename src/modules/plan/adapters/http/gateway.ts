import type { BackendGateway } from "@/platform/http/types";
import type { ID } from "@/shared/id";
import type { Currency } from "@/shared/money";

import type {
  PatientReader,
  PatientWriter,
  PlanReader,
  PlanWriter,
} from "../../application/ports";
import type { Patient, Plan, PlanItem, Visit, Discount } from "../../domain/plan";

type RawPatient = {
  id: string;
  workspace_id?: string;
  name: string;
  contact?: string;
  created_at?: string;
};

type RawPlan = {
  id: string;
  workspace_id?: string;
  patient_id: string;
  title: string;
  kind: "classic";
  status: "draft" | "ready";
  currency: string;
  diagnoses: string[];
  totals_subtotal: number;
  totals_discount: number;
  totals_grand: number;
  snapshot_json?: unknown;
  created_at?: string;
  updated_at?: string;
  patient?: RawPatient;
  visits?: RawVisit[];
  items?: RawPlanItem[];
  discounts?: RawDiscount[];
};

type RawVisit = {
  id: string;
  plan_id?: string;
  order_num: number;
  title: string;
};

type RawPlanItem = {
  id?: string;
  plan_id?: string;
  visit_id?: string;
  treatment_id?: string;
  treatment_name: string;
  tooth_number?: string;
  quantity: number;
  unit_price: number;
  is_package: boolean;
  order_num?: number;
};

type RawDiscount = {
  id?: string;
  plan_id?: string;
  label: string;
  amount: number;
  order_num?: number;
};

export class PlanHttpGateway
  implements PlanReader, PlanWriter, PatientReader, PatientWriter
{
  constructor(private readonly http: BackendGateway) {}

  async listPlans(accessToken?: string): Promise<Plan[]> {
    const res = await this.http.request<{ plans: RawPlan[] }>({
      path: "/v1/plans",
      accessToken,
    });
    return (res.plans ?? []).map(toPlanDomain);
  }

  async getById(id: ID, accessToken?: string): Promise<Plan> {
    const res = await this.http.request<RawPlan>({
      path: `/v1/plans/${id}`,
      accessToken,
    });
    return toPlanDomain(res);
  }

  async createPlan(
    input: {
      patientId: string;
      title?: string;
      currency?: string;
      diagnoses?: string[];
    },
    accessToken?: string
  ): Promise<Plan> {
    const res = await this.http.request<RawPlan>({
      path: "/v1/plans",
      method: "POST",
      accessToken,
      body: {
        patient_id: input.patientId,
        title: input.title,
        currency: input.currency,
        diagnoses: input.diagnoses,
      },
    });
    return toPlanDomain(res);
  }

  async updatePlanHeader(
    id: ID,
    input: { title?: string; diagnoses?: string[] },
    accessToken?: string
  ): Promise<Plan> {
    const res = await this.http.request<RawPlan>({
      path: `/v1/plans/${id}`,
      method: "PATCH",
      accessToken,
      body: input,
    });
    return toPlanDomain(res);
  }

  async putVisits(
    id: ID,
    visits: { id?: string; order_num: number; title: string }[],
    accessToken?: string
  ): Promise<Plan> {
    const res = await this.http.request<RawPlan>({
      path: `/v1/plans/${id}/visits`,
      method: "PUT",
      accessToken,
      body: { visits },
    });
    return toPlanDomain(res);
  }

  async putItems(
    id: ID,
    items: {
      id?: string;
      visit_id?: string;
      treatment_id?: string;
      treatment_name?: string;
      tooth_number?: string;
      quantity: number;
      unit_price?: number;
      is_package: boolean;
      order_num?: number;
    }[],
    accessToken?: string
  ): Promise<Plan> {
    const res = await this.http.request<RawPlan>({
      path: `/v1/plans/${id}/items`,
      method: "PUT",
      accessToken,
      body: { items },
    });
    return toPlanDomain(res);
  }

  async putDiscounts(
    id: ID,
    discounts: {
      id?: string;
      label: string;
      amount: number;
      order_num?: number;
    }[],
    accessToken?: string
  ): Promise<Plan> {
    const res = await this.http.request<RawPlan>({
      path: `/v1/plans/${id}/discounts`,
      method: "PUT",
      accessToken,
      body: { discounts },
    });
    return toPlanDomain(res);
  }

  async markReady(id: ID, accessToken?: string): Promise<Plan> {
    const res = await this.http.request<RawPlan>({
      path: `/v1/plans/${id}/ready`,
      method: "POST",
      accessToken,
    });
    return toPlanDomain(res);
  }

  async list(accessToken?: string): Promise<Patient[]> {
    const res = await this.http.request<{ patients: RawPatient[] }>({
      path: "/v1/patients",
      accessToken,
    });
    return (res.patients ?? []).map(toPatientDomain);
  }

  async getPatientById(id: ID, accessToken?: string): Promise<Patient> {
    const res = await this.http.request<RawPatient>({
      path: `/v1/patients/${id}`,
      accessToken,
    });
    return toPatientDomain(res);
  }

  async getPatient(id: ID, accessToken?: string): Promise<Patient> {
    return this.getPatientById(id, accessToken);
  }

  async createPatient(
    input: { name: string; contact?: string },
    accessToken?: string
  ): Promise<Patient> {
    const res = await this.http.request<RawPatient>({
      path: "/v1/patients",
      method: "POST",
      accessToken,
      body: input,
    });
    return toPatientDomain(res);
  }
}

function toPatientDomain(raw: RawPatient): Patient {
  return {
    id: raw.id as ID,
    workspaceId: raw.workspace_id ? (raw.workspace_id as ID) : undefined,
    name: raw.name ?? "",
    contact: raw.contact ?? "",
    createdAt: raw.created_at,
  };
}

function toPlanDomain(raw: RawPlan): Plan {
  return {
    id: raw.id as ID,
    workspaceId: raw.workspace_id ? (raw.workspace_id as ID) : undefined,
    patientId: raw.patient_id as ID,
    title: raw.title ?? "",
    kind: "classic",
    status: raw.status ?? "draft",
    currency: (raw.currency as Currency) ?? "TRY",
    diagnoses: raw.diagnoses ?? [],
    totalsSubtotal: raw.totals_subtotal ?? 0,
    totalsDiscount: raw.totals_discount ?? 0,
    totalsGrand: raw.totals_grand ?? 0,
    snapshotJson: raw.snapshot_json,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    patient: raw.patient ? toPatientDomain(raw.patient) : undefined,
    visits: (raw.visits ?? []).map(toVisitDomain),
    items: (raw.items ?? []).map(toItemDomain),
    discounts: (raw.discounts ?? []).map(toDiscountDomain),
  };
}

function toVisitDomain(raw: RawVisit): Visit {
  return {
    id: raw.id as ID,
    planId: raw.plan_id ? (raw.plan_id as ID) : undefined,
    orderNum: raw.order_num ?? 0,
    title: raw.title ?? "",
  };
}

function toItemDomain(raw: RawPlanItem): PlanItem {
  return {
    id: raw.id ? (raw.id as ID) : undefined,
    planId: raw.plan_id ? (raw.plan_id as ID) : undefined,
    visitId: raw.visit_id ? (raw.visit_id as ID) : undefined,
    treatmentId: raw.treatment_id ? (raw.treatment_id as ID) : undefined,
    treatmentName: raw.treatment_name ?? "",
    toothNumber: raw.tooth_number,
    quantity: raw.quantity ?? 1,
    unitPrice: raw.unit_price ?? 0,
    isPackage: Boolean(raw.is_package),
    orderNum: raw.order_num,
  };
}

function toDiscountDomain(raw: RawDiscount): Discount {
  return {
    id: raw.id ? (raw.id as ID) : undefined,
    planId: raw.plan_id ? (raw.plan_id as ID) : undefined,
    label: raw.label ?? "",
    amount: raw.amount ?? 0,
    orderNum: raw.order_num,
  };
}
