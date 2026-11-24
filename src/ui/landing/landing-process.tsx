import React from "react";
import Image from "next/image";
import { Check, Smartphone } from "lucide-react";

import type { LandingDictionary } from "./i18n";
import { SectionHeading, SoftIcon } from "./landing-ui";

export interface LandingProcessProps {
  readonly copy: LandingDictionary["workflow"];
  readonly toothAlt: string;
}

const TOOTH_CHIPS = ["#36", "#14", "#11–#21"] as const;

/** Adımlara özel küçük, dile bağımlı olmayan önizleme kartı. */
function StepPreview({ index, toothAlt }: { readonly index: number; readonly toothAlt: string }) {
  return (
    <div
      aria-hidden={index === 1 ? undefined : "true"}
      className="mt-6 overflow-hidden rounded-3xl bg-white p-4 shadow-[0_24px_50px_-26px_rgba(30,41,90,0.4)] ring-1 ring-black/5"
    >
      {index === 0 ? (
        <div className="space-y-2.5">
          <div dir="ltr" className="flex flex-wrap gap-2">
            {TOOTH_CHIPS.map((chip, i) => (
              <span
                key={chip}
                className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                  i === 0 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {chip}
              </span>
            ))}
          </div>
          <span className="block h-2 w-full rounded-full bg-slate-100" />
          <span className="block h-2 w-3/5 rounded-full bg-slate-100" />
          <span className="block h-2 w-4/5 rounded-full bg-slate-100" />
        </div>
      ) : null}

      {index === 1 ? (
        <div className="relative flex h-28 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#7c5ce0] via-[#4a6fe3] to-[#2fb4f0]">
          <Image
            src="/tooth-hero.png"
            alt={toothAlt}
            width={96}
            height={96}
            className="h-24 w-24 object-contain drop-shadow-[0_10px_18px_rgba(20,30,90,0.5)]"
          />
        </div>
      ) : null}

      {index === 2 ? (
        <div className="flex items-center gap-4">
          <SoftIcon icon={Smartphone} tone="mint" className="h-12 w-12" />
          <div className="flex-1 space-y-2.5">
            <span className="block h-2 w-full rounded-full bg-slate-100" />
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold text-white">
              <Check className="h-3 w-3" strokeWidth={3} />
              OK
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** "Hazır olma süreci" zaman çizelgesi: 3 adım, düğümlü çizgi ve önizleme kartı. */
export function LandingProcess({ copy, toothAlt }: LandingProcessProps) {
  return (
    <section
      id="process"
      aria-labelledby="process-title"
      className="bg-white py-20 md:py-28"
    >
      <div className="landing-reveal mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading heading={copy.heading} id="process-title" />

        <ol className="mt-14 grid gap-12 md:grid-cols-3 md:gap-8">
          {copy.steps.map((step, index) => (
            <li key={step.title} className="relative">
              <p
                className={`text-2xl font-extrabold tracking-[-0.03em] sm:text-3xl ${
                  index === 0 ? "text-grad-light" : "text-[#1d1d1f]"
                }`}
              >
                {step.badge}
              </p>

              <div className="relative my-5 flex h-4 items-center">
                <span
                  aria-hidden="true"
                  className="relative z-10 h-4 w-4 rounded-full border-2 border-blue-600 bg-white"
                />
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-0 h-px bg-gradient-to-r from-blue-600/70 to-blue-600/10 ${
                    index === copy.steps.length - 1 ? "md:hidden" : "md:-me-8"
                  }`}
                />
              </div>

              <p className="text-[11px] font-semibold tracking-[0.16em] text-blue-600 uppercase">
                {copy.stepLabel}{" "}
                <span dir="ltr">{String(index + 1).padStart(2, "0")}</span>
              </p>
              <h3 className="mt-2 text-lg font-bold tracking-tight text-[#1d1d1f]">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {step.description}
              </p>

              <StepPreview index={index} toothAlt={toothAlt} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
