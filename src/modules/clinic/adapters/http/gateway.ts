import type { BackendGateway } from "@/platform/http/types";
import type { ID } from "@/shared/id";

import type { ClinicReader, ClinicWriter } from "../../application/ports";
import type { ClinicSettings, WorkspaceProducts } from "../../domain/clinic";

type RawStat = {
  value?: string;
  label?: string;
};

type RawDoctor = {
  name?: string;
  title?: string;
  subtitle?: string;
  bio?: string;
  photo_key?: string;
  stats?: RawStat[];
};

type RawLab = {
  title?: string;
  text?: string;
  image_key?: string;
  stats?: RawStat[];
};

type RawAwards = {
  text?: string;
  badge_keys?: string[];
};

type RawHotel = {
  name?: string;
  text?: string;
  image_key?: string;
};

type RawClinicSettings = {
  workspace_id: string;
  name?: string;
  slogan?: string;
  locale?: string;
  currency?: string;
  palette?: string;
  logo_key?: string;
  cover_key?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  hours?: string;
  map_url?: string;
  intro?: string;
  legal?: string;
  about_text?: string;
  about_key?: string;
  welcome_body?: string;
  signer_name?: string;
  signer_title?: string;
  highlights?: RawStat[];
  doctor?: RawDoctor;
  lab?: RawLab;
  awards?: RawAwards;
  hotel?: RawHotel;
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
    workspaceId: (raw.workspace_id ?? "") as ID,
    name: raw.name ?? "",
    slogan: raw.slogan ?? "",
    locale: (raw.locale as ClinicSettings["locale"]) ?? "tr",
    currency: (raw.currency as ClinicSettings["currency"]) ?? "TRY",
    palette: (raw.palette as ClinicSettings["palette"]) ?? "navy",
    logoKey: raw.logo_key ?? "",
    coverKey: raw.cover_key ?? "",
    phone: raw.phone ?? "",
    email: raw.email ?? "",
    website: raw.website ?? "",
    address: raw.address ?? "",
    hours: raw.hours ?? "",
    mapUrl: raw.map_url ?? "",
    intro: raw.intro ?? "",
    legal: raw.legal ?? "",
    aboutText: raw.about_text ?? "",
    aboutKey: raw.about_key ?? "",
    welcomeBody: raw.welcome_body ?? "",
    signerName: raw.signer_name ?? "",
    signerTitle: raw.signer_title ?? "",
    highlights: (raw.highlights ?? []).map((h) => ({
      value: h.value ?? "",
      label: h.label ?? "",
    })),
    doctor: {
      name: raw.doctor?.name ?? "",
      title: raw.doctor?.title ?? "",
      subtitle: raw.doctor?.subtitle ?? "",
      bio: raw.doctor?.bio ?? "",
      photoKey: raw.doctor?.photo_key ?? "",
      stats: (raw.doctor?.stats ?? []).map((s) => ({
        value: s.value ?? "",
        label: s.label ?? "",
      })),
    },
    lab: {
      title: raw.lab?.title ?? "",
      text: raw.lab?.text ?? "",
      imageKey: raw.lab?.image_key ?? "",
      stats: (raw.lab?.stats ?? []).map((s) => ({
        value: s.value ?? "",
        label: s.label ?? "",
      })),
    },
    awards: {
      text: raw.awards?.text ?? "",
      badgeKeys: raw.awards?.badge_keys ?? [],
    },
    hotel: {
      name: raw.hotel?.name ?? "",
      text: raw.hotel?.text ?? "",
      imageKey: raw.hotel?.image_key ?? "",
    },
  };
}

function toBackendBody(patch: Partial<ClinicSettings>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (patch.workspaceId !== undefined) body.workspace_id = patch.workspaceId;
  if (patch.name !== undefined) body.name = patch.name;
  if (patch.slogan !== undefined) body.slogan = patch.slogan;
  if (patch.locale !== undefined) body.locale = patch.locale;
  if (patch.currency !== undefined) body.currency = patch.currency;
  if (patch.palette !== undefined) body.palette = patch.palette;
  if (patch.logoKey !== undefined) body.logo_key = patch.logoKey;
  if (patch.coverKey !== undefined) body.cover_key = patch.coverKey;
  if (patch.phone !== undefined) body.phone = patch.phone;
  if (patch.email !== undefined) body.email = patch.email;
  if (patch.website !== undefined) body.website = patch.website;
  if (patch.address !== undefined) body.address = patch.address;
  if (patch.hours !== undefined) body.hours = patch.hours;
  if (patch.mapUrl !== undefined) body.map_url = patch.mapUrl;
  if (patch.intro !== undefined) body.intro = patch.intro;
  if (patch.legal !== undefined) body.legal = patch.legal;
  if (patch.aboutText !== undefined) body.about_text = patch.aboutText;
  if (patch.aboutKey !== undefined) body.about_key = patch.aboutKey;
  if (patch.welcomeBody !== undefined) body.welcome_body = patch.welcomeBody;
  if (patch.signerName !== undefined) body.signer_name = patch.signerName;
  if (patch.signerTitle !== undefined) body.signer_title = patch.signerTitle;
  if (patch.highlights !== undefined) body.highlights = patch.highlights;
  if (patch.doctor !== undefined) {
    body.doctor = {
      name: patch.doctor.name,
      title: patch.doctor.title,
      subtitle: patch.doctor.subtitle,
      bio: patch.doctor.bio,
      photo_key: patch.doctor.photoKey,
      stats: patch.doctor.stats,
    };
  }
  if (patch.lab !== undefined) {
    body.lab = {
      title: patch.lab.title,
      text: patch.lab.text,
      image_key: patch.lab.imageKey,
      stats: patch.lab.stats,
    };
  }
  if (patch.awards !== undefined) {
    body.awards = {
      text: patch.awards.text,
      badge_keys: patch.awards.badgeKeys,
    };
  }
  if (patch.hotel !== undefined) {
    body.hotel = {
      name: patch.hotel.name,
      text: patch.hotel.text,
      image_key: patch.hotel.imageKey,
    };
  }
  return body;
}
