import type { Metadata } from "next";

import { LOCALES, LOCALE_META, localeHref, type Locale } from "@/shared/locale";

import { getLandingDictionary } from "./i18n";

/** Dil başına başlık, açıklama, canonical ve hreflang bağlantıları. */
export function landingMetadata(locale: Locale): Metadata {
  const { meta } = getLandingDictionary(locale);

  return {
    title: { absolute: meta.title },
    description: meta.description,
    alternates: {
      canonical: localeHref(locale),
      languages: {
        ...Object.fromEntries(LOCALES.map((code) => [code, localeHref(code)])),
        "x-default": localeHref("tr"),
      },
    },
    openGraph: {
      type: "website",
      title: meta.title,
      description: meta.description,
      locale: LOCALE_META[locale].ogLocale,
      alternateLocale: LOCALES.filter((code) => code !== locale).map(
        (code) => LOCALE_META[code].ogLocale
      ),
    },
  };
}
