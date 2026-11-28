import type { ID } from "@/shared/id";
import type { Currency } from "@/shared/money";

export const Locale = {
  TR: "tr",
  EN: "en",
  AR: "ar",
  RU: "ru",
} as const;

export type Locale = (typeof Locale)[keyof typeof Locale];

export const Palette = {
  NAVY: "navy",
  FOREST: "forest",
  ROSE: "rose",
  SLATE: "slate",
} as const;

export type Palette = (typeof Palette)[keyof typeof Palette];

export const TemplateId = {
  KLINIK_MINIMAL: "klinik-minimal",
  MODERN_GEOMETRIC: "modern-geometric",
  BOTANICAL_SERENITY: "botanical-serenity",
  LIQUID_ART: "liquid-art",
  NOIR_GOLD: "noir-gold",
  ROYAL_GOLD: "royal-gold",
  CLASSIC_RIBBON: "classic-ribbon",
  EXECUTIVE_SPLIT: "executive-split",
  BOTANICAL_AESTHETIC: "botanical-aesthetic",
  PEDIATRIC_JOY: "pediatric-joy",
  PRESTIGE_MINIMAL: "prestige-minimal",
} as const;

export type TemplateId = (typeof TemplateId)[keyof typeof TemplateId];

export type Product = {
  id: "classic" | "ultimate";
  open: boolean;
};

export type WorkspaceProducts = {
  products: Product[];
};

export type ClinicStat = {
  value: string;
  label: string;
};

export type ClinicDoctor = {
  name: string;
  title: string;
  subtitle: string;
  bio: string;
  photoKey: string;
  stats: ClinicStat[];
};

export type ClinicLab = {
  title: string;
  text: string;
  imageKey: string;
  stats: ClinicStat[];
};

export type ClinicAwards = {
  text: string;
  badgeKeys: string[];
};

export type ClinicHotel = {
  name: string;
  text: string;
  imageKey: string;
};

export type ClinicSettings = {
  workspaceId: ID;
  name: string;
  slogan: string;
  locale: Locale;
  currency: Currency;
  palette: Palette;
  logoKey: string;
  coverKey: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  hours: string;
  mapUrl: string;
  intro: string;
  legal: string;
  aboutText: string;
  aboutKey: string;
  welcomeBody: string;
  signerName: string;
  signerTitle: string;
  highlights: ClinicStat[];
  doctor: ClinicDoctor;
  lab: ClinicLab;
  awards: ClinicAwards;
  hotel: ClinicHotel;
  templateId: TemplateId;
  showMotifs: boolean;
};
