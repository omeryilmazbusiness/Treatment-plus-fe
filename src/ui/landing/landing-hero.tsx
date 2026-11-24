import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Cuboid,
  FileSearch,
  Globe,
  Play,
  Send,
  type LucideIcon,
} from "lucide-react";

import type { LandingDictionary } from "./i18n";
import {
  LaptopFrame,
  PaperFrame,
  PhoneFrame,
  PlanCover,
  ScreenIntro,
} from "./landing-devices";
import { PillLink, SoftIcon, type SoftTone } from "./landing-ui";

export interface LandingHeroProps {
  readonly copy: LandingDictionary["hero"];
  readonly demoHref: string;
}

type ChipTone = "emerald" | "blue" | "violet" | "sky";

const CHIP_TONE: Record<ChipTone, SoftTone> = {
  emerald: "mint",
  blue: "sky",
  violet: "brand-dark",
  sky: "sky",
};

interface NoticeChipProps {
  readonly icon: LucideIcon;
  readonly tone: ChipTone;
  readonly title: string;
  readonly caption: string;
  readonly className: string;
}

/** Hero sahnesinde süzülen cam bildirim kartı. */
function NoticeChip({ icon: Icon, tone, title, caption, className }: NoticeChipProps) {
  return (
    <div
      className={`absolute hidden items-center gap-3 rounded-2xl bg-white/[0.07] py-3 ps-3.5 pe-5 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.6)] ring-1 ring-white/12 backdrop-blur-xl md:flex ${className}`}
    >
      <SoftIcon icon={Icon} tone={CHIP_TONE[tone]} className="h-7 w-7" />
      <span className="min-w-0 text-start">
        <span className="block text-[13px] leading-tight font-semibold text-white">
          {title}
        </span>
        <span className="mt-0.5 block text-[11px] leading-tight text-slate-400">
          {caption}
        </span>
      </span>
    </div>
  );
}

const GLASS_LINK =
  "group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl py-3.5 ps-4 pe-6 text-sm font-semibold text-white ring-1 backdrop-blur-xl backdrop-saturate-150 transition-all duration-300 ease-out hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300";

export function LandingHero({ copy, demoHref }: LandingHeroProps) {
  const { scene } = copy;

  return (
    <section
      id="hero"
      className="relative isolate overflow-hidden bg-[#070a14] text-white [background-image:radial-gradient(70%_55%_at_50%_66%,#1b2a5e_0%,#0d1430_46%,#070a14_100%)]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute start-1/2 top-[38%] -z-10 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-blue-500/20 blur-[120px] rtl:translate-x-1/2"
      />

      <div className="mx-auto max-w-6xl px-4 pt-28 text-center sm:px-6 sm:pt-32">
        <p className="text-[11px] font-semibold tracking-[0.22em] text-sky-300 uppercase">
          {copy.eyebrow}
        </p>
        <h1 className="mt-4 text-[2.5rem] leading-[1.05] font-extrabold tracking-[-0.035em] text-balance sm:text-6xl lg:text-[4.5rem] rtl:leading-[1.3]">
          <span className="block">{copy.titlePrefix}</span>
          <span className="text-grad-dark block">{copy.titleHighlight}</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-balance text-slate-300/90 sm:text-xl">
          {copy.tagline}
        </p>
      </div>

      {/* Sahne: dizüstü, telefon, PDF ve bildirim kartları */}
      <div
        role="group"
        aria-label={scene.ariaLabel}
        className="relative mx-auto mt-12 aspect-[1.5/1] w-[calc(100%-2rem)] max-w-[1120px] sm:mt-14 md:aspect-[2.5/1]"
      >
        <LaptopFrame className="absolute start-[3%] top-0 w-[76%] md:start-[19%] md:w-[62%]">
          <div className="flex h-full">
            <PlanCover
              title={scene.coverTitle}
              patient={scene.patientName}
              className="h-full w-[46%] shrink-0"
            />
            <div className="min-w-0 flex-1">
              <ScreenIntro
                label={scene.planLabel}
                title={scene.planTitle}
                subtitle={scene.preparedFor}
                button={scene.viewPlan}
              />
            </div>
          </div>
        </LaptopFrame>

        <PaperFrame className="absolute start-[4%] bottom-[5%] hidden w-[19%] -rotate-[8deg] md:block">
          <PlanCover
            title={scene.coverTitle}
            patient={scene.patientName}
            className="h-full w-full"
          />
        </PaperFrame>

        <PhoneFrame className="landing-float-slow absolute -bottom-[2%] end-[1%] w-[24%] md:end-[6%] md:bottom-0 md:w-[14.5%]">
          <PlanCover
            title={scene.coverTitle}
            patient={scene.patientName}
            className="h-full w-full"
          />
        </PhoneFrame>

        <NoticeChip
          icon={Play}
          tone="blue"
          title={scene.movie.title}
          caption={scene.movie.caption}
          className="landing-float start-[0%] top-[4%]"
        />
        <NoticeChip
          icon={Globe}
          tone="sky"
          title={scene.language.title}
          caption={scene.language.caption}
          className="landing-float-slow end-[0%] top-[0%]"
        />
        <NoticeChip
          icon={Check}
          tone="emerald"
          title={scene.approved.title}
          caption={scene.approved.caption}
          className="landing-float start-[22%] -bottom-[9%]"
        />
        <NoticeChip
          icon={Send}
          tone="violet"
          title={scene.shared.title}
          caption={scene.shared.caption}
          className="landing-float-slow end-[26%] -bottom-[9%]"
        />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col items-center px-4 pt-14 pb-20 text-center sm:px-6 sm:pt-16 sm:pb-24">
        <PillLink href={demoHref} className="px-8 py-4 text-base">
          <span>{copy.demoCta}</span>
          <ArrowRight
            aria-hidden="true"
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5"
          />
        </PillLink>
        <p className="mt-4 text-xs text-slate-400">{copy.demoNote}</p>

        <nav
          aria-label={copy.plansAriaLabel}
          className="relative isolate mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -z-10 h-14 w-44 rounded-full bg-blue-500/30 blur-2xl ltr:-left-2 rtl:-right-2"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -z-10 h-14 w-48 rounded-full bg-violet-500/35 blur-2xl ltr:right-0 rtl:left-0"
          />
          <Link
            href="/ornekler/classic"
            className={`${GLASS_LINK} bg-white/10 shadow-[0_12px_32px_-12px_rgba(56,189,248,0.4),inset_0_1px_0_rgba(255,255,255,0.25)] ring-white/20 hover:bg-white/15`}
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-all duration-700 ease-out group-hover:opacity-100 ltr:-left-full ltr:group-hover:left-full rtl:-right-full rtl:group-hover:right-full"
            />
            <SoftIcon icon={FileSearch} tone="sky" className="relative h-6 w-6" />
            <span className="relative">{copy.sampleCta}</span>
          </Link>
          <Link
            href="/ornekler/ultimate"
            className={`${GLASS_LINK} bg-gradient-to-br from-violet-600/80 via-indigo-600/75 to-blue-600/80 shadow-[0_12px_36px_-10px_rgba(109,70,201,0.7),inset_0_1px_0_rgba(255,255,255,0.35)] ring-white/25 hover:shadow-[0_18px_44px_-10px_rgba(109,70,201,0.85),inset_0_1px_0_rgba(255,255,255,0.45)]`}
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 transition-all duration-700 ease-out group-hover:opacity-100 ltr:-left-full ltr:group-hover:left-full rtl:-right-full rtl:group-hover:right-full"
            />
            <SoftIcon icon={Cuboid} tone="white" className="relative h-6 w-6" />
            <span className="relative">{copy.professionalCta}</span>
          </Link>
        </nav>
      </div>
    </section>
  );
}
