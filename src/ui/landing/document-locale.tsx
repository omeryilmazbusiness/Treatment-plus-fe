"use client";

import { useEffect } from "react";

import { DEFAULT_LOCALE, LOCALE_META, type Locale } from "@/shared/locale";

/**
 * Kök `<html>` etiketi tüm uygulama için sabit kaldığından, landing sayfası
 * açıkken `lang` ve `dir` değerlerini eşitler; sayfadan ayrılınca varsayılana döner.
 */
export function DocumentLocale({ locale }: { readonly locale: Locale }) {
  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dir = LOCALE_META[locale].dir;
    return () => {
      root.lang = DEFAULT_LOCALE;
      root.dir = LOCALE_META[DEFAULT_LOCALE].dir;
    };
  }, [locale]);

  return null;
}
