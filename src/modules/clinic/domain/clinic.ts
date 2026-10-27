import type { ID } from "@/shared/id";
import type { Currency } from "@/shared/money";

export const Locale = {
  TR: "tr",
  EN: "en",
} as const;

export type Locale = (typeof Locale)[keyof typeof Locale];

export const Palette = {
  NAVY: "navy",
  FOREST: "forest",
  ROSE: "rose",
  SLATE: "slate",
} as const;

export type Palette = (typeof Palette)[keyof typeof Palette];

export type Product = {
  id: "classic" | "ultimate";
  open: boolean;
};

export type WorkspaceProducts = {
  products: Product[];
};

export type ClinicSettings = {
  workspaceId: ID;
  name: string;
  locale: Locale;
  currency: Currency;
  palette: Palette;
  logoKey: string;
  phone: string;
  mapUrl: string;
  intro: string;
  legal: string;
};
