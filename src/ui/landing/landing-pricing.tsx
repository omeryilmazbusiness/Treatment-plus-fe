import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Box,
  Check,
  Clapperboard,
  Gem,
  Languages,
  Monitor,
  Palette,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

import type { LandingDictionary, PlanCopy } from "./i18n";
import { Mark } from "@/ui/mark";

import { PillLink, SectionHeading, SoftIcon } from "./landing-ui";

export interface LandingPricingProps {
  readonly copy: LandingDictionary["pricing"];
  readonly demoHref: string;
}

const INCLUDED_ICONS: readonly [
  LucideIcon,
  LucideIcon,
  LucideIcon,
  LucideIcon,
  LucideIcon,
  LucideIcon,
] = [Clapperboard, Box, Monitor, Languages, Palette, ShieldCheck];

const PLAN_LINKS = {
  classic: "/ornekler/classic",
  ultimate: "/ornekler/ultimate",
} as const;

interface PlanCardProps {
  readonly plan: PlanCopy;
  readonly href: string;
  readonly icon: LucideIcon;
  readonly featured: boolean;
  readonly recommended: string;
}

function PlanCard({ plan, href, icon: Icon, featured, recommended }: PlanCardProps) {
  return (
    <article
      className={`relative flex flex-col overflow-hidden rounded-[2rem] p-7 sm:p-9 ${
        featured
          ? "bg-gradient-to-br from-[#0d1430] via-[#141c4a] to-[#231a58] text-white shadow-[0_40px_80px_-30px_rgba(37,60,160,0.65)]"
          : "bg-white text-[#1d1d1f] shadow-[0_24px_60px_-34px_rgba(30,41,90,0.35)] ring-1 ring-black/5"
      }`}
    >
      {featured ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -end-16 h-64 w-64 rounded-full bg-violet-500/30 blur-[80px]"
        />
      ) : null}

      <div className="relative flex items-center justify-between gap-3">
        <SoftIcon icon={Icon} tone={featured ? "brand-dark" : "brand"} className="h-10 w-10" />
        {featured ? (
          <span className="rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-3 py-1 text-[11px] font-bold text-white">
            {recommended}
          </span>
        ) : null}
      </div>

      <p
        className={`relative mt-7 text-[11px] font-semibold tracking-[0.18em] uppercase ${
          featured ? "text-sky-300" : "text-blue-600"
        }`}
      >
        {plan.tag}
      </p>
      <h3 className="relative mt-2 text-3xl font-extrabold tracking-[-0.03em] sm:text-[2rem]">
        {plan.name}
      </h3>
      <p
        className={`relative mt-3 text-[15px] leading-relaxed ${
          featured ? "text-slate-300" : "text-slate-500"
        }`}
      >
        {plan.subtitle}
      </p>

      <ul className="relative mt-7 flex-1 space-y-3.5">
        {plan.perks.map((perk) => (
          <li key={perk} className="flex items-start gap-3 text-sm leading-snug">
            <SoftIcon
              icon={Check}
              tone={featured ? "sky" : "brand"}
              className="mt-px h-5 w-5"
            />
            <span className={featured ? "text-slate-200" : "text-slate-700"}>{perk}</span>
          </li>
        ))}
      </ul>

      <Link
        href={href}
        className={`group relative mt-9 inline-flex w-fit items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
          featured
            ? "bg-white text-[#0d1430] hover:bg-sky-50"
            : "bg-[#1d1d1f] text-white hover:bg-blue-600"
        }`}
      >
        {plan.cta}
        <ArrowRight
          aria-hidden="true"
          className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5"
        />
      </Link>
    </article>
  );
}

export function LandingPricing({ copy, demoHref }: LandingPricingProps) {
  return (
    <section
      id="packages"
      aria-labelledby="packages-title"
      className="relative scroll-mt-4 overflow-hidden bg-[#f5f5f7] py-20 md:py-28"
    >
      <div className="landing-reveal mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading heading={copy.heading} id="packages-title" />
        <p className="mx-auto mt-5 max-w-xl text-center text-base leading-relaxed text-balance text-slate-500 sm:text-lg">
          {copy.subtitle}
        </p>

        <div className="mt-14 grid gap-5 lg:grid-cols-2">
          <PlanCard
            plan={copy.classic}
            href={PLAN_LINKS.classic}
            icon={Clapperboard}
            featured={false}
            recommended={copy.recommended}
          />
          <PlanCard
            plan={copy.ultimate}
            href={PLAN_LINKS.ultimate}
            icon={Gem}
            featured
            recommended={copy.recommended}
          />
        </div>

        {/* Her pakette */}
        <div className="mx-auto mt-20 max-w-4xl text-center">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-blue-600 uppercase">
            {copy.includedLabel}
          </p>
          <ul className="mt-9 grid gap-x-10 gap-y-8 text-start sm:grid-cols-2 lg:grid-cols-3">
            {copy.included.map((item, index) => {
              const Icon = INCLUDED_ICONS[index] ?? Check;
              return (
                <li key={item.title} className="flex items-start gap-3.5">
                  <SoftIcon icon={Icon} className="h-7 w-7" />
                  <div>
                    <p className="text-sm font-bold tracking-tight text-[#1d1d1f]">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-[13px] leading-snug text-slate-500">
                      {item.caption}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Demo kartı */}
        <div className="relative mx-auto mt-20 max-w-4xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0d1430] via-[#121a45] to-[#241b5a] p-7 text-white shadow-[0_40px_80px_-30px_rgba(37,60,160,0.6)] sm:p-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 end-0 h-72 w-72 rounded-full bg-violet-500/25 blur-[90px]"
          />
          <div className="relative grid items-center gap-9 md:grid-cols-2">
            <div>
              <div className="flex items-center gap-3">
                <Mark light className="h-8 w-8" />
                <span dir="ltr" className="text-sm font-semibold text-slate-200">
                  Treatment+
                </span>
              </div>
              <h3 className="mt-6 text-3xl leading-[1.1] font-extrabold tracking-[-0.03em] sm:text-4xl rtl:leading-[1.3]">
                {copy.demo.title}{" "}
                <span className="text-grad-dark block">{copy.demo.titleMuted}</span>
              </h3>
              <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-slate-300">
                {copy.demo.text}
              </p>
              <PillLink href={demoHref} className="mt-7">
                {copy.demo.cta}
              </PillLink>
            </div>

            <div>
              <p className="text-[10px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
                {copy.demo.questionsLabel}
              </p>
              <ul className="mt-4 space-y-3">
                {copy.demo.questions.map((question, index) => (
                  <li
                    key={question}
                    className={`w-fit max-w-[92%] rounded-2xl bg-white px-4 py-3 text-[13px] leading-snug font-medium text-slate-800 shadow-lg shadow-black/20 ${
                      index === 1 ? "ms-auto" : ""
                    }`}
                  >
                    {question}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
