import React from "react";
import { Ban, Building2, Lock, ShieldCheck, type LucideIcon } from "lucide-react";

import type { LandingDictionary } from "./i18n";
import { SectionHeading, SoftIcon } from "./landing-ui";

export interface LandingSecurityProps {
  readonly copy: LandingDictionary["security"];
}

const ITEM_ICONS: readonly [LucideIcon, LucideIcon, LucideIcon, LucideIcon] = [
  ShieldCheck,
  Building2,
  Ban,
  Lock,
];

export function LandingSecurity({ copy }: LandingSecurityProps) {
  return (
    <section
      id="security"
      aria-labelledby="security-title"
      className="relative overflow-hidden bg-[#f5f5f7] py-20 md:py-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 end-0 h-[420px] w-[560px] rounded-full bg-indigo-200/40 blur-[110px]"
      />
      <div className="landing-reveal relative mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeading heading={copy.heading} align="start" id="security-title" />
          <p className="mt-5 max-w-sm text-base leading-relaxed text-slate-500">
            {copy.description}
          </p>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-[0_40px_70px_-34px_rgba(30,41,90,0.4)] ring-1 ring-black/5 sm:p-7">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <p className="text-[10px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
              {copy.panelLabel}
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5" />
              {copy.protectedLabel}
            </span>
          </div>
          <ul className="divide-y divide-slate-100">
            {copy.items.map((item, index) => {
              const Icon = ITEM_ICONS[index] ?? ShieldCheck;
              return (
                <li key={item.title} className="flex items-start gap-4 py-4">
                  <SoftIcon icon={Icon} className="mt-0.5 h-7 w-7" />
                  <div>
                    <p className="text-sm font-bold tracking-tight text-[#1d1d1f]">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-[13px] leading-snug text-slate-500">
                      {item.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
