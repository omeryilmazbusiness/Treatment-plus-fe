import React from "react";
import {
  BadgeCheck,
  Box,
  Building2,
  Check,
  Coins,
  Globe,
  Languages,
  Layers,
  Link2,
  Palette,
  ShieldCheck,
  Smartphone,
  Smile,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";

import type { LandingDictionary } from "./i18n";
import { PhoneFrame, PlanCover } from "./landing-devices";
import { InteractiveToothModel } from "./interactive-tooth-model";
import { SectionHeading, SoftIcon } from "./landing-ui";

export interface LandingFeaturesProps {
  readonly copy: LandingDictionary["features"];
  readonly coverTitle: string;
  readonly patientName: string;
}

const STRIP_ICONS: readonly [LucideIcon, LucideIcon, LucideIcon, LucideIcon] = [
  Languages,
  Layers,
  Link2,
  Palette,
];

/** Ana ikonun yanında anlatımı güçlendiren küçük ikonlar (yazı yerine). */
const STRIP_SATELLITES: readonly (readonly LucideIcon[])[] = [
  [Globe, Coins],
  [Stethoscope, Smile],
  [Smartphone, ShieldCheck],
  [Building2, BadgeCheck],
];

/** Kart üstü küçük rozet ("Treatment+ ile oluşturulur"). */
function CardBadge({
  children,
  dark = false,
}: {
  readonly children: React.ReactNode;
  readonly dark?: boolean;
}) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${
        dark ? "bg-white/10 text-slate-200" : "bg-slate-200/70 text-slate-600"
      }`}
    >
      {children}
    </span>
  );
}

const SAVED_PLANS = [
  { name: "All-on-4", count: 12 },
  { name: "All-on-6", count: 14 },
  { name: "Hollywood Smile", count: 20 },
] as const;

export function LandingFeatures({ copy, coverTitle, patientName }: LandingFeaturesProps) {
  return (
    <section
      id="features"
      aria-labelledby="features-title"
      className="bg-white py-20 md:py-28"
    >
      <div className="landing-reveal mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading heading={copy.heading} id="features-title" />

        <div className="mt-14 grid gap-4 md:grid-cols-5">
          {/* 1) Etkileşimli 3D diş */}
          <article className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#ece7fb] via-[#f1eefc] to-[#f6f4ff] p-7 sm:p-9 md:col-span-3">
            <div className="grid items-center gap-2 sm:grid-cols-2">
              <div className="relative z-10">
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 text-[11px] font-semibold text-slate-700 ring-1 ring-white">
                  <Box aria-hidden="true" className="h-3.5 w-3.5 text-blue-600" />
                  3D
                </span>
                <h3 className="mt-5 text-3xl leading-[1.1] font-extrabold tracking-[-0.03em] text-[#1d1d1f] sm:text-[2rem] rtl:leading-[1.3]">
                  {copy.odontogram.title}
                </h3>
                <p className="mt-3 max-w-xs text-[15px] leading-relaxed text-slate-500">
                  {copy.odontogram.description}
                </p>
              </div>
              <InteractiveToothModel
                ariaLabel={copy.toothAriaLabel}
                fallbackAlt={copy.toothFallbackAlt}
                hint={copy.dragHint}
                className="h-[300px]! sm:h-[320px]! lg:h-[340px]!"
              />
            </div>
          </article>

          {/* 2) Dakikalar içinde plan */}
          <article className="flex flex-col overflow-hidden rounded-[2rem] bg-[#f5f5f7] md:col-span-2">
            <div className="m-3 rounded-[1.5rem] bg-gradient-to-br from-[#ece7fb] to-[#e4ecfd] p-4">
              <div className="grid grid-cols-5 gap-3">
                <ul className="col-span-3 space-y-1.5 rounded-2xl bg-white p-3 shadow-sm">
                  {SAVED_PLANS.map((plan, index) => (
                    <li
                      key={plan.name}
                      className={`flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 rounded-lg px-2 py-1.5 text-[11px] ${
                        index === 0 ? "bg-blue-50" : ""
                      }`}
                    >
                      <span className="flex items-center gap-1.5 font-semibold whitespace-nowrap text-slate-800" dir="ltr">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            index === 0 ? "bg-blue-600" : "ring-1 ring-slate-300"
                          }`}
                        />
                        {plan.name}
                      </span>
                      <span className="ps-3.5 text-slate-400 whitespace-nowrap sm:ps-0">
                        {plan.count} {copy.plans.unit}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="relative col-span-2 overflow-hidden rounded-2xl bg-white p-2 shadow-sm">
                  <span className="absolute end-1.5 top-1.5 z-10 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
                    <Check aria-hidden="true" className="h-2.5 w-2.5" />
                    {copy.plans.ready}
                  </span>
                  <PlanCover
                    title={coverTitle}
                    patient={patientName}
                    className="mt-3 aspect-[4/3] w-full rounded-lg"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-2 p-6 pt-3">
              <CardBadge>{copy.createdIn}</CardBadge>
              <h3 className="text-xl font-extrabold tracking-tight text-[#1d1d1f]">
                {copy.plans.title}
              </h3>
              <p className="text-sm leading-relaxed text-slate-500">
                {copy.plans.description}
              </p>
            </div>
          </article>

          {/* 3) Animasyonlu film */}
          <article className="flex flex-col overflow-hidden rounded-[2rem] bg-gradient-to-b from-[#16204a] to-[#0a1030] p-3 text-white md:col-span-2 md:row-span-1">
            <PlanCover
              title={coverTitle}
              patient={patientName}
              playable
              landscape
              className="aspect-[16/10] w-full rounded-[1.4rem]"
            />
            <div className="flex flex-col gap-2 px-4 pt-5 pb-4">
              <CardBadge dark>{copy.createdIn}</CardBadge>
              <h3 className="text-xl font-extrabold tracking-tight">{copy.movie.title}</h3>
              <p className="text-sm leading-relaxed text-slate-300">
                {copy.movie.description}
              </p>
            </div>
          </article>

          {/* 4) Mobil paylaşım + onay */}
          <article className="flex flex-col overflow-hidden rounded-[2rem] bg-gradient-to-b from-[#16204a] to-[#0a1030] p-3 text-white md:col-span-3">
            <div className="grid flex-1 items-end gap-2 sm:grid-cols-2">
              <div className="flex flex-col gap-2 px-4 pt-5 pb-4">
                <CardBadge dark>{copy.createdIn}</CardBadge>
                <h3 className="text-xl font-extrabold tracking-tight">{copy.mobile.title}</h3>
                <p className="text-sm leading-relaxed text-slate-300">
                  {copy.mobile.description}
                </p>
              </div>
              <div className="relative mx-auto mt-2 w-[148px]">
                <PhoneFrame className="w-full">
                  <div className="flex h-full flex-col">
                    <PlanCover
                      title={coverTitle}
                      patient={patientName}
                      className="min-h-0 flex-1"
                    />
                    <div className="flex items-center justify-center gap-1 bg-white px-2 py-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1.5 text-[10px] font-bold text-white">
                        <Check aria-hidden="true" className="h-3 w-3" />
                        {copy.mobile.approve}
                      </span>
                    </div>
                  </div>
                </PhoneFrame>
              </div>
            </div>
          </article>
        </div>

        {/* 5) Küçük özellik şeridi */}
        <ul className="mt-4 grid gap-px overflow-hidden rounded-[2rem] bg-slate-200/70 sm:grid-cols-2 lg:grid-cols-4">
          {copy.strip.map((item, index) => {
            const Icon = STRIP_ICONS[index] ?? Layers;
            return (
              <li key={item} className="bg-[#f5f5f7] px-6 py-7">
                <SoftIcon icon={Icon} className="h-11 w-11" />
                <h3 className="mt-5 text-base font-extrabold tracking-tight text-[#1d1d1f]">
                  {item}
                </h3>
                <ul className="mt-3 flex items-center gap-3">
                  {STRIP_SATELLITES[index]?.map((Satellite, order) => (
                    <li key={order}>
                      <SoftIcon icon={Satellite} tone="sky" className="h-5 w-5 opacity-70" />
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
