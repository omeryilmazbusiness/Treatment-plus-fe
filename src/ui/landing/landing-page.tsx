import React from "react";

import { LOCALE_META, type Locale } from "@/shared/locale";

import { DocumentLocale } from "./document-locale";
import { getLandingDictionary } from "./i18n";
import { LandingClients } from "./landing-clients";
import { LandingFeatures } from "./landing-features";
import { LandingFooter } from "./landing-footer";
import { LandingHeader } from "./landing-header";
import { LandingHero } from "./landing-hero";
import { LandingStatsBanner } from "./landing-stats-banner";
import { LandingWorkflow } from "./landing-workflow";

export function LandingPage({ locale }: { readonly locale: Locale }) {
  const dict = getLandingDictionary(locale);
  const { dir } = LOCALE_META[locale];

  return (
    <div
      lang={locale}
      dir={dir}
      className={`min-h-dvh bg-white text-slate-900 selection:bg-blue-600 selection:text-white ${
        locale === "ar" ? "font-arabic" : "font-sans"
      }`}
    >
      <DocumentLocale locale={locale} />
      <LandingHeader locale={locale} copy={dict.header} />
      <main>
        <LandingHero copy={dict.hero} imageAlt={dict.features.toothFallbackAlt} />
        <LandingClients copy={dict.clients} />
        <LandingFeatures copy={dict.features} />
        <LandingStatsBanner copy={dict.stats} />
        <LandingWorkflow
          workflow={dict.workflow}
          pricing={dict.pricing}
          cta={dict.cta}
        />
      </main>
      <LandingFooter copy={dict.footer} />
    </div>
  );
}
