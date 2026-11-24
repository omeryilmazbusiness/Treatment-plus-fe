import React from "react";
import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";

import type { LandingDictionary } from "./i18n";
import { PlanCover } from "./landing-devices";
import { SectionHeading } from "./landing-ui";

export interface LandingQuoteProps {
  readonly copy: LandingDictionary["quote"];
  readonly coverTitle: string;
  readonly patientName: string;
}

/** Hasta onayı bölümü: sol tarafta plan kapağı, sağda başlık ve klinik alıntısı. */
export function LandingQuote({ copy, coverTitle, patientName }: LandingQuoteProps) {
  return (
    <section
      id="quote"
      aria-labelledby="quote-title"
      className="bg-white py-20 md:py-28"
    >
      <div className="landing-reveal mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
        <figure className="mx-auto w-full max-w-md">
          <div className="relative">
            <PlanCover
              title={coverTitle}
              patient={patientName}
              className="aspect-[3/4] w-full rounded-[2rem] shadow-[0_40px_70px_-24px_rgba(37,60,160,0.55)]"
            />
          </div>
          <figcaption className="mt-5 ps-1 text-[13px] font-bold text-[#1d1d1f]">
            {copy.source}
          </figcaption>
        </figure>

        <div>
          <SectionHeading
            heading={copy.heading}
            align="start"
            id="quote-title"
            className="[&_h2]:sm:text-5xl"
          />
          <blockquote className="mt-7 flex gap-4">
            <Quote
              aria-hidden="true"
              className="mt-1 h-6 w-6 shrink-0 fill-blue-600/15 text-blue-600 rtl:-scale-x-100"
            />
            <p className="text-lg leading-relaxed text-slate-600">{copy.quote}</p>
          </blockquote>
          <Link
            href="/ornekler/classic"
            className="group mt-7 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
          >
            {copy.link}
            <ArrowRight
              aria-hidden="true"
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
