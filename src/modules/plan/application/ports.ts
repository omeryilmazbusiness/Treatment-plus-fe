import type { ID } from "@/shared/id";

import type { Patient, Plan } from "../domain/plan";

export interface PlanReader {
  getById(id: ID, accessToken?: string): Promise<Plan>;
  listPlans(accessToken?: string): Promise<Plan[]>;
}

export interface PlanWriter {
  createPlan(
    input: {
      patientId: string;
      title?: string;
      currency?: string;
      diagnoses?: string[];
    },
    accessToken?: string
  ): Promise<Plan>;
  updatePlanHeader(
    id: ID,
    input: { title?: string; diagnoses?: string[] },
    accessToken?: string
  ): Promise<Plan>;
  putVisits(
    id: ID,
    visits: { id?: string; order_num: number; title: string }[],
    accessToken?: string
  ): Promise<Plan>;
  putItems(
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
  ): Promise<Plan>;
  putDiscounts(
    id: ID,
    discounts: {
      id?: string;
      label: string;
      amount: number;
      order_num?: number;
    }[],
    accessToken?: string
  ): Promise<Plan>;
  markReady(id: ID, accessToken?: string): Promise<Plan>;
}

export interface PatientReader {
  list(accessToken?: string): Promise<Patient[]>;
  getPatientById(id: ID, accessToken?: string): Promise<Patient>;
}

export interface PatientWriter {
  createPatient(
    input: { name: string; contact?: string },
    accessToken?: string
  ): Promise<Patient>;
}
