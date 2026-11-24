import React from "react";
import { Globe, Play, type LucideIcon } from "lucide-react";

import { Mark } from "@/ui/mark";

import type { LandingDictionary } from "./i18n";
import { LaptopFrame, PhoneFrame, PlanCover } from "./landing-devices";
import { SectionHeading, SoftIcon, type SoftTone } from "./landing-ui";

export interface LandingFlowProps {
  readonly copy: LandingDictionary["flow"];
  readonly coverTitle: string;
  readonly patientName: string;
}

const TILE_ICONS: readonly [LucideIcon, LucideIcon] = [Play, Globe];
const TILE_TONES: readonly [SoftTone, SoftTone] = ["sky", "brand"];

/** Paketler: iki girdi (film / web sitesi) tek bağlantıda birleşir. */
export function LandingFlow({ copy, coverTitle, patientName }: LandingFlowProps) {
  return (
    <section
      id="flow"
      aria-labelledby="flow-title"
      className="border-t border-slate-200/60 bg-[#f5f5f7] py-20 md:py-28"
    >
      <div className="landing-reveal mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading heading={copy.heading} id="flow-title" />

        <div className="mt-14 grid items-center gap-12 lg:grid-cols-12 lg:gap-6">
          <div className="space-y-10 lg:col-span-5">
            {copy.options.map((option) => (
              <div key={option.title}>
                <h3 className="text-xl font-extrabold tracking-tight text-[#1d1d1f]">
                  {option.title}
                </h3>
                <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-slate-500">
                  <strong className="font-semibold text-[#1d1d1f]">{option.lead}</strong>{" "}
                  {option.text}
                </p>
              </div>
            ))}
          </div>

          {/* Diyagram: ltr çizilir; yalnızca yerleşim yönü sayfayı izler */}
          <div className="lg:col-span-7" dir="ltr">
            <div className="relative mx-auto aspect-[1.7/1] w-full max-w-[580px]">
              <svg
                aria-hidden="true"
                viewBox="0 0 560 330"
                className="absolute inset-0 h-full w-full"
              >
                <defs>
                  <linearGradient id="flow-line" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#7c5ce0" />
                    <stop offset="100%" stopColor="#2563eb" />
                  </linearGradient>
                </defs>
                <path
                  d="M96 82C170 82 168 165 238 165"
                  fill="none"
                  stroke="url(#flow-line)"
                  strokeWidth="2"
                />
                <path
                  d="M96 248C170 248 168 165 238 165"
                  fill="none"
                  stroke="url(#flow-line)"
                  strokeWidth="2"
                />
                <path d="M322 165H398" fill="none" stroke="#2563eb" strokeWidth="2" />
              </svg>

              {copy.tiles.map((label, index) => {
                const Icon = TILE_ICONS[index] ?? Play;
                return (
                  <div
                    key={label}
                    className={`absolute start-[2%] flex w-[15%] -translate-y-1/2 flex-col items-center gap-1.5 ${
                      index === 0 ? "top-[25%]" : "top-[75%]"
                    }`}
                  >
                    <span className="flex aspect-square w-full items-center justify-center">
                      <SoftIcon
                        icon={Icon}
                        tone={TILE_TONES[index] ?? "brand"}
                        className="h-[70%] w-[70%]"
                      />
                    </span>
                    <span className="text-[11px] font-semibold whitespace-nowrap text-slate-500">
                      {label}
                    </span>
                  </div>
                );
              })}

              <div className="absolute start-[43%] top-1/2 flex w-[14%] -translate-y-1/2 flex-col items-center gap-1.5">
                <span className="flex aspect-square w-full items-center justify-center">
                  <Mark className="h-[80%] w-[80%] drop-shadow-[0_10px_18px_rgba(60,70,160,0.25)]" />
                </span>
                <span className="text-[11px] font-semibold text-slate-500">Treatment+</span>
              </div>

              <div className="absolute end-[0%] top-1/2 w-[28%] -translate-y-1/2">
                <LaptopFrame className="w-full">
                  <PlanCover
                    title={coverTitle}
                    patient={patientName}
                    className="h-full w-full"
                  />
                </LaptopFrame>
                <PhoneFrame className="absolute -end-[8%] -bottom-[24%] w-[34%]">
                  <PlanCover
                    title={coverTitle}
                    patient={patientName}
                    className="h-full w-full"
                  />
                </PhoneFrame>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-center">
          <span className="text-xs font-semibold text-slate-400">{copy.channelsLabel}</span>
          <ul className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2">
            {copy.channels.map((channel) => (
              <li
                key={channel}
                className="text-sm font-bold tracking-tight text-slate-500/90"
              >
                {channel}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
