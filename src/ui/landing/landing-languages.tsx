import React from "react";

import { LOCALES, LOCALE_META, type Locale } from "@/shared/locale";

import type { LandingDictionary } from "./i18n";
import { SectionHeading } from "./landing-ui";
import { LandingWorldMap } from "./landing-world-map";

export interface LandingLanguagesProps {
  readonly copy: LandingDictionary["languages"];
  readonly locale: Locale;
}

/** Her dilde kısa bir karşılama; dil adlarıyla birlikte hastaya örnek olarak gösterilir. */
const GREETINGS: Readonly<Record<Locale, string>> = {
  tr: "Merhaba, tedavi planınız hazır.",
  en: "Hello, your treatment plan is ready.",
  ar: "مرحبًا، خطة علاجك جاهزة.",
  ru: "Здравствуйте, ваш план лечения готов.",
};

/** Koyu "dünya" bölümü: noktalı zemin üzerinde dört dilin kartları. */
export function LandingLanguages({ copy, locale }: LandingLanguagesProps) {
  return (
    <section
      id="languages"
      aria-labelledby="languages-title"
      className="relative overflow-hidden bg-gradient-to-b from-[#0a1428] to-[#0c1832] py-20 text-white md:py-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle,rgba(148,163,210,0.38)_1px,transparent_1.6px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_58%,#000_30%,transparent_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute start-1/2 top-1/3 h-[360px] w-[760px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[110px] rtl:translate-x-1/2"
      />

      <div className="landing-reveal relative mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading heading={copy.heading} tone="dark" id="languages-title" />
        <p className="mx-auto mt-5 max-w-xl text-center text-base leading-relaxed text-balance text-slate-300/90 sm:text-lg">
          {copy.description}
        </p>

        <LandingWorldMap copy={copy.map} />

        <ul
          aria-label={copy.cardsAriaLabel}
          className="mx-auto mt-12 grid max-w-4xl gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {LOCALES.map((code) => {
            const meta = LOCALE_META[code];
            const active = code === locale;
            return (
              <li
                key={code}
                lang={code}
                dir={meta.dir}
                className="group px-2 py-3 text-start sm:px-4"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
                      active
                        ? "bg-sky-300 shadow-[0_0_12px_3px_rgba(125,211,252,0.7)]"
                        : "bg-slate-600 group-hover:bg-slate-400"
                    }`}
                  />
                  <span
                    dir="ltr"
                    className={`text-[11px] font-semibold tracking-[0.22em] ${
                      active ? "text-sky-300" : "text-slate-500"
                    }`}
                  >
                    {meta.shortCode}
                  </span>
                </div>
                <p
                  className={`mt-4 text-[1.7rem] leading-tight font-extrabold tracking-tight transition-colors duration-300 ${
                    active ? "text-grad-dark" : "text-white/90 group-hover:text-white"
                  }`}
                >
                  {meta.nativeName}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-400 transition-colors duration-300 group-hover:text-slate-300">
                  {GREETINGS[code]}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
