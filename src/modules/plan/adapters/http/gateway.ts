import type { BackendGateway } from "@/platform/http/types";
import { AppError } from "@/shared/errx";

import type { PatientReader, PatientWriter, PlanReader, PlanWriter } from "../../application/ports";
import type { Patient, Plan } from "../../domain/plan";

/** Phase 4: /v1/patients  /v1/plans  PUT visits|items|odontogram  POST /plans/:id/ready */
export class PlanHttpGateway implements PlanReader, PlanWriter, PatientReader, PatientWriter {
  constructor(private readonly http: BackendGateway) {}

  getById(): Promise<Plan> {
    return this.notReady("plan.getById");
  }

  listByPatient(): Promise<Plan[]> {
    return this.notReady("plan.listByPatient");
  }

  create(): Promise<Plan> {
    return this.notReady("plan.create");
  }

  markReady(): Promise<Plan> {
    return this.notReady("plan.markReady");
  }

  list(): Promise<Patient[]> {
    return this.notReady("plan.listPatients");
  }

  createPatient(): Promise<Patient> {
    return this.notReady("plan.createPatient");
  }

  private notReady(name: string): never {
    void this.http;
    throw AppError.notImplemented(name);
  }
}
