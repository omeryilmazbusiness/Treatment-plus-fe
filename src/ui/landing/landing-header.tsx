import React from "react";
import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react";

import { localeHref, type Locale } from "@/shared/locale";
import { Mark } from "@/ui/mark";

import type { LandingDictionary } from "./i18n";
import { LanguageSwitcher } from "./language-switcher";

export interface LandingHeaderProps {
  readonly locale: Locale;
  readonly copy: LandingDictionary["header"];
  readonly brandName?: string;
  readonly registerHref?: string;
  readonly loginHref?: string;
}

export function LandingHeader({
  locale,
  copy,
  brandName = "Treatment+",
  registerHref = "/register",
  loginHref = "/login",
}: LandingHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3.5 sm:px-6 sm:py-4">
        {/* Marka / Logo */}
        <Link
          href={localeHref(locale)}
          aria-label={copy.homeAriaLabel}
          className="group flex min-w-0 items-center gap-2.5 focus:outline-hidden sm:gap-3"
        >
          <Mark className="h-9 w-9 shrink-0 transition-transform duration-300 group-hover:scale-105 sm:h-10 sm:w-10" />
          <div className="flex flex-col">
            <span
              dir="ltr"
              className="text-lg font-extrabold tracking-tight text-slate-900"
            >
              {brandName}
            </span>
            <span
              dir="ltr"
              className="text-[10px] font-bold tracking-[0.18em] text-blue-600 uppercase"
            >
              {copy.tagline}
            </span>
          </div>
        </Link>

        {/* Dil + Giriş Yap & Kayıt Ol */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <LanguageSwitcher locale={locale} label={copy.languageMenuLabel} />
          <Link
            href={loginHref}
            className="inline-flex items-center gap-2 rounded-lg px-2.5 py-2.5 text-sm font-semibold whitespace-nowrap text-slate-700 transition-colors duration-200 hover:bg-slate-900/5 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:px-3.5"
          >
            <LogIn
              aria-hidden="true"
              className="h-[18px] w-[18px] text-blue-600 sm:h-4 sm:w-4 rtl:-scale-x-100"
            />
            <span className="sr-only sm:not-sr-only">{copy.login}</span>
          </Link>
          <Link
            href={registerHref}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2.5 text-sm font-semibold whitespace-nowrap text-white transition-colors duration-200 hover:bg-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:px-4"
          >
            <UserPlus
              aria-hidden="true"
              className="hidden h-4 w-4 text-cyan-300 sm:block"
            />
            <span>{copy.register}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
