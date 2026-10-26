import type { ClinicSettings } from "../domain/clinic";

export interface ClinicReader {
  getSettings(): Promise<ClinicSettings>;
}

export interface ClinicWriter {
  updateSettings(patch: Partial<ClinicSettings>): Promise<ClinicSettings>;
}
