/**
 * Landing sayfası için desteklenen diller.
 * Saf veri: framework, React veya çerez bağımlılığı yoktur (proxy ve UI paylaşır).
 */
export const LOCALES = ["tr", "en", "ar", "ru"] as const;

export type Locale = (typeof LOCALES)[number];

export type TextDirection = "ltr" | "rtl";

export const DEFAULT_LOCALE: Locale = "tr";

/** Dil tercihini tutan çerez adı (yalnızca dil kodu; kişisel veri içermez). */
export const LOCALE_COOKIE = "NEXT_LOCALE";

export interface LocaleMeta {
  /** Dilin kendi yazılışıyla adı (dil menüsünde gösterilir). */
  readonly nativeName: string;
  /** Kısa kod (düğmede gösterilir). */
  readonly shortCode: string;
  readonly dir: TextDirection;
  /** BCP 47 / Open Graph yerel ayarı. */
  readonly ogLocale: string;
}

export const LOCALE_META: Readonly<Record<Locale, LocaleMeta>> = {
  tr: { nativeName: "Türkçe", shortCode: "TR", dir: "ltr", ogLocale: "tr_TR" },
  en: { nativeName: "English", shortCode: "EN", dir: "ltr", ogLocale: "en_US" },
  ar: { nativeName: "العربية", shortCode: "AR", dir: "rtl", ogLocale: "ar_AR" },
  ru: { nativeName: "Русский", shortCode: "RU", dir: "ltr", ogLocale: "ru_RU" },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** Varsayılan dil kök yolda, diğerleri `/<kod>` altında yayınlanır. */
export function localeHref(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? "/" : `/${locale}`;
}
