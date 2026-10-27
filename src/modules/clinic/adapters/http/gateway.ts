import type { BackendGateway } from "@/platform/http/types";
import type { ID } from "@/shared/id";

import type { ClinicReader, ClinicWriter } from "../../application/ports";
import type { ClinicSettings, WorkspaceProducts } from "../../domain/clinic";

type RawClinicSettings = {
  workspace_id: string;
  name: string;
  locale: string;
  currency: string;
  palette: string;
  logo_key: string;
  phone: string;
  map_url: string;
  intro: string;
  legal: string;
};

export class ClinicHttpGateway implements ClinicReader, ClinicWriter {
  constructor(private readonly http: BackendGateway) {}

  async getWorkspaceProducts(accessToken?: string): Promise<WorkspaceProducts> {
    return this.http.request<WorkspaceProducts>({
      path: "/v1/workspace",
      accessToken,
    });
  }

  async getSettings(accessToken?: string): Promise<ClinicSettings> {
    const raw = await this.http.request<RawClinicSettings>({
      path: "/v1/clinic/settings",
      accessToken,
    });
    return toDomain(raw);
  }

  async updateSettings(
    patch: Partial<ClinicSettings>,
    accessToken?: string
  ): Promise<ClinicSettings> {
    const raw = await this.http.request<RawClinicSettings>({
      path: "/v1/clinic/settings",
      method: "PATCH",
      accessToken,
      body: toBackendBody(patch),
    });
    return toDomain(raw);
  }
}

function toDomain(raw: RawClinicSettings): ClinicSettings {
  return {
    workspaceId: raw.workspace_id as ID,
    name: raw.name ?? "",
    locale: (raw.locale as ClinicSettings["locale"]) ?? "tr",
    currency: (raw.currency as ClinicSettings["currency"]) ?? "TRY",
    palette: (raw.palette as ClinicSettings["palette"]) ?? "navy",
    logoKey: raw.logo_key ?? "",
    phone: raw.phone ?? "",
    mapUrl: raw.map_url ?? "",
    intro: raw.intro ?? "",
    legal: raw.legal ?? "",
  };
}

function toBackendBody(patch: Partial<ClinicSettings>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (patch.name !== undefined) body.name = patch.name;
  if (patch.locale !== undefined) body.locale = patch.locale;
  if (patch.currency !== undefined) body.currency = patch.currency;
  if (patch.palette !== undefined) body.palette = patch.palette;
  if (patch.logoKey !== undefined) body.logo_key = patch.logoKey;
  if (patch.phone !== undefined) body.phone = patch.phone;
  if (patch.mapUrl !== undefined) body.map_url = patch.mapUrl;
  if (patch.intro !== undefined) body.intro = patch.intro;
  if (patch.legal !== undefined) body.legal = patch.legal;
  return body;
}
