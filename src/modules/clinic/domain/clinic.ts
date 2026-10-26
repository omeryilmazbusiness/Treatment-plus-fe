import type { ID } from "@/shared/id";
import type { Currency } from "@/shared/money";

export const Locale = {
  TR: "tr",
  EN: "en",
} as const;

export type Locale = (typeof Locale)[keyof typeof Locale];

export type ClinicSettings = {
  clinicId: ID;
  name: string;
  locale: Locale;
  currency: Currency;
  phone: string;
  mapUrl: string;
  intro: string;
  legal: string;
  primaryColor: string;
  logoKey: string;
};
