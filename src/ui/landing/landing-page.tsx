import React from "react";

import { LOCALE_META, type Locale } from "@/shared/locale";

import { DocumentLocale } from "./document-locale";
import { getLandingDictionary } from "./i18n";
import { mailtoHref } from "./landing-data";
import { LandingCta } from "./landing-cta";
import { LandingFaq } from "./landing-faq";
import { LandingFeatures } from "./landing-features";
import { LandingFlow } from "./landing-flow";
import { LandingFooter } from "./landing-footer";
import { LandingHeader } from "./landing-header";
import { LandingHero } from "./landing-hero";
import { LandingLanguages } from "./landing-languages";
import { LandingMadeFor } from "./landing-made-for";
import { LandingPricing } from "./landing-pricing";
import { LandingProcess } from "./landing-process";
import { LandingQuote } from "./landing-quote";
import { LandingSecurity } from "./landing-security";
import { LandingShowcase } from "./landing-showcase";
import { LandingTrust } from "./landing-trust";
import { SoftIconDefs } from "./landing-ui";

export function LandingPage({ locale }: { readonly locale: Locale }) {
  const dict = getLandingDictionary(locale);
  const { dir } = LOCALE_META[locale];
  const { scene } = dict.hero;
  const demoHref = mailtoHref(dict.hero.demoMailSubject);
  const askHref = mailtoHref(dict.faq.askMailSubject);

  return (
    <div
      lang={locale}
      dir={dir}
      className={`min-h-dvh overflow-x-clip bg-white text-[#1d1d1f] selection:bg-blue-600 selection:text-white ${
        locale === "ar" ? "font-arabic" : "font-landing"
      }`}
    >
      <DocumentLocale locale={locale} />
      <SoftIconDefs />
      <div className="relative">
        <LandingHeader
          locale={locale}
          copy={dict.header}
          demoLabel={dict.hero.demoCta}
          demoHref={demoHref}
        />
        <main>
          <LandingHero copy={dict.hero} demoHref={demoHref} />
          <LandingTrust copy={dict.trust} />
          <LandingMadeFor
            copy={dict.madeFor}
            coverTitle={scene.coverTitle}
            patientName={scene.patientName}
          />
          <LandingShowcase
            copy={dict.showcase}
            scene={scene}
            approveLabel={dict.features.mobile.approve}
            demoHref={demoHref}
            demoLabel={dict.hero.demoCta}
            demoNote={dict.hero.demoNote}
          />
          <LandingFlow
            copy={dict.flow}
            coverTitle={scene.coverTitle}
            patientName={scene.patientName}
          />
          <LandingFeatures
            copy={dict.features}
            coverTitle={scene.coverTitle}
            patientName={scene.patientName}
          />
          <LandingLanguages copy={dict.languages} locale={locale} />
          <LandingQuote
            copy={dict.quote}
            coverTitle={scene.coverTitle}
            patientName={scene.patientName}
          />
          <LandingPricing copy={dict.pricing} demoHref={demoHref} />
          <LandingProcess copy={dict.workflow} toothAlt={dict.features.toothFallbackAlt} />
          <LandingSecurity copy={dict.security} />
          <LandingFaq copy={dict.faq} askHref={askHref} />
          <LandingCta copy={dict.cta} />
        </main>
        <LandingFooter copy={dict.footer} />
      </div>
    </div>
  );
}
