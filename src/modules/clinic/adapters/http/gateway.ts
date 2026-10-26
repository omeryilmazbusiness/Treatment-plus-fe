import type { BackendGateway } from "@/platform/http/types";
import { AppError } from "@/shared/errx";

import type { ClinicReader, ClinicWriter } from "../../application/ports";
import type { ClinicSettings } from "../../domain/clinic";

/** Phase 2: GET|PATCH /v1/clinic  GET|PATCH /v1/clinic/settings */
export class ClinicHttpGateway implements ClinicReader, ClinicWriter {
  constructor(private readonly http: BackendGateway) {}

  getSettings(): Promise<ClinicSettings> {
    return this.notReady("clinic.getSettings");
  }

  updateSettings(): Promise<ClinicSettings> {
    return this.notReady("clinic.updateSettings");
  }

  private notReady(name: string): never {
    void this.http;
    throw AppError.notImplemented(name);
  }
}
