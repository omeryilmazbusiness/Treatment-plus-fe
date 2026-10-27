import type { ClinicSettings, WorkspaceProducts } from "../domain/clinic";

export interface ClinicReader {
  getSettings(accessToken?: string): Promise<ClinicSettings>;
  getWorkspaceProducts(accessToken?: string): Promise<WorkspaceProducts>;
}

export interface ClinicWriter {
  updateSettings(
    patch: Partial<ClinicSettings>,
    accessToken?: string
  ): Promise<ClinicSettings>;
}
