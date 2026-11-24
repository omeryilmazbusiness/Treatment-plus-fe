import React from "react";
import { ArrowRight, ChevronDown } from "lucide-react";

import type { LandingDictionary } from "./i18n";
import { PillLink, SectionHeading } from "./landing-ui";

export interface LandingFaqProps {
  readonly copy: LandingDictionary["faq"];
  readonly askHref: string;
}

/** SSS: JavaScript gerektirmeyen <details> akordeonu, iki sütun. */
export function LandingFaq({ copy, askHref }: LandingFaqProps) {
  const half = Math.ceil(copy.items.length / 2);
  const columns = [copy.items.slice(0, half), copy.items.slice(half)];

  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="scroll-mt-4 border-t border-slate-100 bg-white py-20 md:py-28"
    >
      <div className="landing-reveal mx-auto max-w-5xl px-4 sm:px-6">
        <SectionHeading heading={copy.heading} id="faq-title" />

        <div className="mt-14 grid items-start gap-x-12 md:grid-cols-2">
          {columns.map((items, columnIndex) => (
            <div
              key={columnIndex}
              className={`divide-y divide-slate-200/80 border-b border-slate-200/80 md:border-t ${
                columnIndex === 0 ? "border-t" : ""
              }`}
            >
              {items.map((item) => (
                <details key={item.question} className="group py-1">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg py-4 text-start text-[15px] font-semibold tracking-tight text-[#1d1d1f] marker:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 [&::-webkit-details-marker]:hidden">
                    <span>{item.question}</span>
                    <ChevronDown
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 group-open:rotate-180"
                    />
                  </summary>
                  <p className="pb-4 text-sm leading-relaxed text-slate-500">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center text-center">
          <h3 className="text-lg font-bold tracking-tight text-[#1d1d1f]">
            {copy.askTitle}
          </h3>
          <p className="mt-1.5 text-sm text-slate-500">{copy.askText}</p>
          <PillLink href={askHref} className="mt-6 px-6 py-3">
            {copy.askCta}
            <ArrowRight
              aria-hidden="true"
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5"
            />
          </PillLink>
        </div>
      </div>
    </section>
  );
}
