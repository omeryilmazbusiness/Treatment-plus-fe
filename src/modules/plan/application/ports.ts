import type { ID } from "@/shared/id";

import type { Patient, Plan } from "../domain/plan";

export interface PlanReader {
  getById(id: ID): Promise<Plan>;
  listByPatient(patientId: ID): Promise<Plan[]>;
}

export interface PlanWriter {
  create(patientId: ID): Promise<Plan>;
  markReady(id: ID): Promise<Plan>;
}

export interface PatientReader {
  list(): Promise<Patient[]>;
}

export interface PatientWriter {
  createPatient(name: string): Promise<Patient>;
}
