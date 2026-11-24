"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import {
  ArrowRight,
  Cuboid,
  FileSearch,
  ShieldCheck,
  TrendingUp,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { DEFAULT_CONTACT_INFO } from "./landing-data";
import type { LandingDictionary } from "./i18n";

export type HeroTone = "blue" | "emerald" | "violet";

export interface HeroLink {
  readonly label: string;
  readonly href: string;
  readonly icon: LucideIcon;
  readonly tone: HeroTone;
  readonly variant: "soft" | "premium";
}

export interface HeroMetric {
  readonly title: string;
  readonly caption: string;
  readonly icon: LucideIcon;
  readonly tone: HeroTone;
}

/** Tailwind sınıfları statik kalmalı; dinamik birleştirme purge edilir. */
const TONE_ICON: Record<HeroTone, string> = {
  blue: "text-blue-600",
  emerald: "text-emerald-600",
  violet: "text-violet-600",
};

export interface LandingHeroProps {
  readonly copy: LandingDictionary["hero"];
  readonly imageAlt: string;
}

const METRIC_VISUALS: readonly [
  { icon: LucideIcon; tone: HeroTone },
  ...{ icon: LucideIcon; tone: HeroTone }[],
] = [
  { icon: Zap, tone: "blue" },
  { icon: TrendingUp, tone: "emerald" },
  { icon: ShieldCheck, tone: "violet" },
];

export function LandingHero({ copy, imageAlt }: LandingHeroProps) {
  const demoHref = `mailto:${DEFAULT_CONTACT_INFO.email}?subject=${encodeURIComponent(
    copy.demoMailSubject
  )}`;
  const secondaryLinks: readonly HeroLink[] = [
    {
      label: copy.sampleCta,
      href: "/ornekler/classic",
      icon: FileSearch,
      tone: "blue",
      variant: "soft",
    },
    {
      label: copy.professionalCta,
      href: "/ornekler/ultimate",
      icon: Cuboid,
      tone: "violet",
      variant: "premium",
    },
  ];
  const metrics: readonly HeroMetric[] = copy.metrics.map((metric, index) => ({
    title: metric.title,
    caption: metric.caption,
    ...(METRIC_VISUALS[index] ?? METRIC_VISUALS[0]),
  }));
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-gsap='hero-fade-up']",
        { y: 34, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.85,
          stagger: 0.12,
          ease: "power3.out",
          clearProps: "transform",
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100/80 pt-16 pb-24 lg:pt-24 lg:pb-32"
    >
      {/* Arka Plan Medikal Mimari Grid ve Işık Efektleri */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,#e2e8f070_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f070_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_75%_60%_at_50%_35%,#000_60%,transparent_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/4 -z-10 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-blue-500/12 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-20 right-0 -z-10 h-[440px] w-[540px] rounded-full bg-cyan-400/12 blur-3xl"
      />

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-12 lg:gap-12">
        {/* Sol Sütun: Başlık, Alt Başlık, Aksiyonlar ve Metrikler */}
        <div className="lg:col-span-6">
          <h1
            data-gsap="hero-fade-up"
            className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl lg:text-[56px] lg:leading-[1.08] rtl:leading-[1.35] rtl:lg:leading-[1.3]"
          >
            {copy.titlePrefix}
            <span className="mt-1 block bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent rtl:pb-2">
              {copy.titleHighlight}
            </span>
          </h1>

          <p
            data-gsap="hero-fade-up"
            className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg"
          >
            {copy.subtitle}
          </p>

          {/* CTA */}
          <div
            data-gsap="hero-fade-up"
            className="mt-10 flex flex-wrap items-center gap-x-2.5 gap-y-4"
          >
            <a
              href={demoHref}
              className="group inline-flex items-center gap-2.5 rounded-xl bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <span>{copy.demoCta}</span>
              <ArrowRight
                aria-hidden="true"
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5"
              />
            </a>

            <nav
              aria-label={copy.plansAriaLabel}
              className="relative isolate flex flex-wrap items-center gap-3"
            >
              {/* Cam efektinin görünmesi için butonların arkasındaki yumuşak renk alanları */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -z-10 h-14 w-40 rounded-full bg-blue-400/35 blur-2xl ltr:-left-2 rtl:-right-2"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -z-10 h-14 w-48 rounded-full bg-violet-500/40 blur-2xl ltr:left-40 rtl:right-40"
              />
              {secondaryLinks.map((link) => {
                const Icon = link.icon;
                const premium = link.variant === "premium";
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl py-2.5 ps-2.5 pe-5 text-sm font-semibold ring-1 backdrop-blur-xl backdrop-saturate-150 transition-all duration-300 ease-out hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 ${
                      premium
                        ? "bg-gradient-to-br from-violet-600/90 via-indigo-600/85 to-blue-600/90 text-white shadow-[0_12px_36px_-10px_rgba(91,33,182,0.65),inset_0_1px_0_rgba(255,255,255,0.35)] ring-white/25 hover:shadow-[0_18px_44px_-10px_rgba(91,33,182,0.75),inset_0_1px_0_rgba(255,255,255,0.45)]"
                        : "bg-white/55 text-slate-800 shadow-[0_12px_32px_-12px_rgba(37,99,235,0.45),inset_0_1px_0_rgba(255,255,255,0.95)] ring-white/70 hover:bg-white/75 hover:shadow-[0_18px_40px_-12px_rgba(37,99,235,0.55),inset_0_1px_0_rgba(255,255,255,1)]"
                    }`}
                  >
                    {/* Hover'da geçen ışık parlaması */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-y-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/45 to-transparent opacity-0 transition-all duration-700 ease-out group-hover:opacity-100 ltr:-left-full ltr:group-hover:left-full rtl:-right-full rtl:group-hover:right-full"
                    />
                    <span
                      className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 backdrop-blur-sm ${
                        premium
                          ? "bg-white/15 text-white ring-white/25"
                          : "bg-gradient-to-br from-blue-500/15 to-cyan-400/15 text-blue-600 ring-blue-500/15"
                      }`}
                    >
                      <Icon aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={1.75} />
                    </span>
                    <span className="relative">{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Metrikler: çerçevesiz renkli ikon + metin */}
          <dl
            data-gsap="hero-fade-up"
            className="mt-14 grid grid-cols-1 gap-6 border-t border-slate-200/80 pt-8 sm:grid-cols-3 sm:gap-6"
          >
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.title} className="flex items-start gap-3">
                  <Icon
                    aria-hidden="true"
                    className={`mt-0.5 h-6 w-6 shrink-0 ${TONE_ICON[metric.tone]}`}
                  />
                  <div className="min-w-0">
                    <dt className="text-sm font-semibold tracking-tight text-slate-950">
                      {metric.title}
                    </dt>
                    <dd className="mt-0.5 text-[13px] leading-snug text-slate-500">
                      {metric.caption}
                    </dd>
                  </div>
                </div>
              );
            })}
          </dl>
        </div>

        {/* Sağ Sütun: Statik diş görseli */}
        <div
          data-gsap="hero-fade-up"
          className="relative flex items-center justify-center lg:col-span-6"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute h-72 w-72 rounded-full bg-gradient-to-br from-blue-200/60 via-cyan-100/50 to-transparent blur-2xl sm:h-80 sm:w-80"
          />
          <Image
            src="/tooth-hero.png"
            alt={imageAlt}
            width={360}
            height={360}
            priority
            className="relative h-auto w-64 select-none drop-shadow-xl sm:w-80 lg:w-[360px]"
          />
        </div>
      </div>
    </section>
  );
}
