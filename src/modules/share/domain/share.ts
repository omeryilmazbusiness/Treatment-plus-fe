import type { ID } from "@/shared/id";

export const EventKind = {
  Opened: "opened",
  SectionViewed: "section_viewed",
  VizPlayed: "viz_played",
  Cta: "cta",
  Accepted: "accepted",
  PdfDownloaded: "pdf_downloaded",
} as const;

export type EventKind = (typeof EventKind)[keyof typeof EventKind];

export type ShareLink = {
  id: ID;
  clinic_id: ID;
  plan_id: ID;
  token_prefix?: string;
  expires_at: string;
  revoked_at?: string | null;
  views_count: number;
  last_viewed_at?: string | null;
  accepted_at?: string | null;
  accepted_signature?: string;
  accepted_ip?: string;
  created_at: string;
  updated_at: string;
};

export type ShareResult = {
  link: ShareLink;
  token: string;
  public_url: string;
};

export type ShareEvent = {
  id: ID;
  clinic_id: ID;
  link_id: ID;
  kind: EventKind;
  metadata?: Record<string, unknown>;
  created_at: string;
};

export type PlanAnalytics = {
  plan_id: ID;
  active_links: number;
  total_views: number;
  last_viewed_at?: string | null;
  accepted: boolean;
  accepted_at?: string | null;
  accepted_signature?: string;
  events_count: number;
  recent_events: ShareEvent[];
};

export type UltimatePlanDTO = {
  token: string;
  public_url: string;
  plan: {
    id: string;
    patient_name: string;
    title: string;
    kind: string;
    status: string;
    currency: string;
    palette: string;
    locale: string;
    welcome_letter: string;
    video_url: string;
    before_after_case_ids: string[];
    diagnoses: string[];
    situation: {
      xray_key: string;
      chart_teeth: string[];
      tooth_findings: Array<{ tooth: string; status: string; note: string }>;
      general_diagnoses: string[];
    };
    visits: Array<{
      id: string;
      order_num: number;
      title: string;
      phase_label: string;
      healing_note: string;
      chart_teeth: string[];
      items: Array<{
        id: string;
        visit_id?: string | null;
        treatment_name: string;
        animation_code?: string;
        tooth_number?: string;
        teeth?: string[];
        description?: string;
        quantity: number;
        unit_price: number;
        is_package: boolean;
      }>;
    }>;
    items: Array<{
      id: string;
      visit_id?: string | null;
      treatment_name: string;
      animation_code?: string;
      tooth_number?: string;
      teeth?: string[];
      description?: string;
      quantity: number;
      unit_price: number;
      is_package: boolean;
    }>;
    discounts: Array<{ id: string; label: string; amount: number }>;
    totals_subtotal: number;
    totals_discount: number;
    totals_grand: number;
    created_at: string;
  };
  clinic: {
    name: string;
    slogan: string;
    phone: string;
    email: string;
    website: string;
    address: string;
    hours: string;
    logo_key: string;
    cover_key: string;
    map_url: string;
    intro: string;
    legal: string;
    about_text: string;
    about_key: string;
    welcome_body: string;
    signer_name: string;
    signer_title: string;
    highlights: Array<{ value: string; label: string }>;
    doctor: {
      name: string;
      title: string;
      subtitle: string;
      bio: string;
      photo_key: string;
      stats: Array<{ value: string; label: string }>;
    };
    lab: {
      title: string;
      text: string;
      image_key: string;
      stats: Array<{ value: string; label: string }>;
    };
    awards: {
      text: string;
      badge_keys: string[];
    };
    hotel: {
      name: string;
      text: string;
      image_key: string;
    };
    team: Array<{
      name: string;
      title: string;
      subtitle: string;
      bio: string;
      photo_key: string;
      stats: Array<{ value: string; label: string }>;
    }>;
    reviews: Array<{
      author: string;
      rating: number;
      text: string;
      source: string;
      date: string;
      verified: boolean;
    }>;
    before_after: Array<{
      id: string;
      title: string;
      tag: string;
      description: string;
      before_image_key: string;
      after_image_key: string;
    }>;
    cta: {
      whatsapp_number: string;
      whatsapp_message: string;
      phone_number: string;
      booking_url: string;
      enable_acceptance: boolean;
    };
  };
  viz?: {
    plan_id: string;
    locale: string;
    clips: Array<{
      code: string;
      teeth: string[];
      title: string;
      moves: unknown[];
    }>;
  };
  before_after: Array<{
    id: string;
    title: string;
    tag: string;
    description: string;
    before_image_key: string;
    after_image_key: string;
  }>;
  accepted: boolean;
  accepted_at?: string | null;
  signature?: string;
};
