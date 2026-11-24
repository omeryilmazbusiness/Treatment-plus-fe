import React from "react";
import { Quote, TrendingUp } from "lucide-react";

import type { LandingDictionary } from "./i18n";

export interface LandingStatsBannerProps {
  readonly copy: LandingDictionary["stats"];
}

export function LandingStatsBanner({ copy }: LandingStatsBannerProps) {
  return (
    <section
      aria-label={copy.ariaLabel}
      className="bg-white py-20"
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* Büyük Kart: Gece Mavisi (Dış Bölüm Arka Planı Beyaz) */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 p-8 text-white shadow-2xl shadow-slate-950/20 sm:p-12 lg:p-16">
          {/* Dekoratif Işıma */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-28 right-1/4 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-28 left-1/4 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl"
          />

          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-cyan-300 uppercase">
              <TrendingUp aria-hidden="true" className="h-4 w-4 text-cyan-400" />
              <span>{copy.eyebrow}</span>
            </span>

            <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {copy.headlinePrefix}{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {copy.headlineHighlight}
              </span>
            </h2>

            <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">
              {copy.description}
            </p>
          </div>

          {/* İstatistikler: çerçevesiz, tipografi odaklı */}
          <dl className="relative z-10 mt-16 grid gap-12 text-center md:grid-cols-3 md:gap-8">
            {copy.items.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center">
                <dt className="order-2 mt-4 text-base font-semibold text-white">
                  {stat.label}
                </dt>
                <dd dir="ltr" className="order-1 bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl">
                  {stat.value}
                </dd>
                <dd className="order-3 mt-2 max-w-[16rem] text-sm leading-relaxed text-slate-400">
                  {stat.detail}
                </dd>
              </div>
            ))}
          </dl>

          {/* Alıntı: çerçevesiz */}
          <figure className="relative z-10 mx-auto mt-16 max-w-3xl text-center">
            <Quote
              aria-hidden="true"
              className="mx-auto h-6 w-6 text-cyan-400/70"
            />
            <blockquote className="mt-4 text-lg leading-relaxed font-medium text-slate-200 sm:text-xl">
              “{copy.quote}”
            </blockquote>
            <figcaption className="mt-4 text-sm font-semibold text-cyan-300">
              {copy.quoteSource}
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
