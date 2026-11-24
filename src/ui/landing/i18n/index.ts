import { type Locale } from "@/shared/locale";

import type { LandingDictionary } from "./dictionary";
import { ar } from "./ar";
import { en } from "./en";
import { ru } from "./ru";
import { tr } from "./tr";

export type { LandingDictionary, PlanCopy } from "./dictionary";

const DICTIONARIES: Readonly<Record<Locale, LandingDictionary>> = { tr, en, ar, ru };

export function getLandingDictionary(locale: Locale): LandingDictionary {
  return DICTIONARIES[locale];
}
