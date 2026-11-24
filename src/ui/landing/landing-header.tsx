import React from "react";
import Link from "next/link";
import { LogIn } from "lucide-react";

import { localeHref, type Locale } from "@/shared/locale";
import { Mark } from "@/ui/mark";

import type { LandingDictionary } from "./i18n";
import { LanguageSwitcher } from "./language-switcher";
import { PillLink } from "./landing-ui";

export interface LandingHeaderProps {
  readonly locale: Locale;
  readonly copy: LandingDictionary["header"];
  readonly demoLabel: string;
  readonly demoHref: string;
  readonly brandName?: string;
  readonly loginHref?: string;
}

/** Koyu hero üzerinde duran şeffaf üst çubuk. */
export function LandingHeader({
  locale,
  copy,
  demoLabel,
  demoHref,
  brandName = "Treatment+",
  loginHref = "/login",
}: LandingHeaderProps) {
  const navLink =
    "rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition-colors duration-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300";

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-4 sm:px-6 sm:py-5">
        <Link
          href={localeHref(locale)}
          aria-label={copy.homeAriaLabel}
          className="group flex min-w-0 items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-300"
        >
          <Mark
            light
            className="h-9 w-9 shrink-0 transition-transform duration-300 group-hover:scale-105"
          />
          <span
            dir="ltr"
            className="text-lg font-extrabold tracking-tight text-white"
          >
            {brandName}
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <nav
            aria-label={copy.navAriaLabel}
            className="me-2 hidden items-center md:flex"
          >
            <a href="#packages" className={navLink}>
              {copy.pricing}
            </a>
            <a href="#faq" className={navLink}>
              {copy.faq}
            </a>
          </nav>

          <LanguageSwitcher
            locale={locale}
            label={copy.languageMenuLabel}
            tone="dark"
          />
          <Link
            href={loginHref}
            className="inline-flex items-center gap-2 rounded-lg px-2.5 py-2.5 text-sm font-medium whitespace-nowrap text-white/80 transition-colors duration-200 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 sm:px-3"
          >
            <LogIn
              aria-hidden="true"
              className="h-[18px] w-[18px] text-sky-300 sm:h-4 sm:w-4 rtl:-scale-x-100"
            />
            <span className="sr-only sm:not-sr-only">{copy.login}</span>
          </Link>
          <PillLink
            href={demoHref}
            variant="outline-dark"
            className="ms-1 hidden sm:inline-flex"
          >
            {demoLabel}
          </PillLink>
        </div>
      </div>
    </header>
  );
}
