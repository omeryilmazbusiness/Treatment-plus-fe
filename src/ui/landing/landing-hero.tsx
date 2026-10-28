"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import {
  ArrowRight,
  CheckCircle2,
  Layers,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

import {
  OdontogramCanvas,
  type OdontogramCanvasProps,
} from "./odontogram-canvas";

export interface LandingHeroProps {
  readonly badgeText?: string;
  readonly titlePrefix?: string;
  readonly titleHighlight?: string;
  readonly subtitle?: string;
  readonly primaryCtaLabel?: string;
  readonly primaryCtaHref?: string;
  readonly secondaryCtaLabel?: string;
  readonly secondaryCtaHref?: string;
  readonly canvasProps?: OdontogramCanvasProps;
}

export function LandingHero({
  badgeText = "Diş Klinikleri İçin 3D Tedavi Sunum Platformu",
  titlePrefix = "Tedavi Planlamasında",
  titleHighlight = "3 Boyutlu Dönüşüm",
  subtitle = "Karmaşık röntgenleri ve anlaşılması güç fiyat listelerini geride bırakın. Hastalarınıza tedavi süreçlerini interaktif 3D odontogramlar üzerinde gösterin; klinik güvenini ve vaka kabul oranlarını ilk muayenede artırın.",
  primaryCtaLabel = "Hemen Kayıt Ol",
  primaryCtaHref = "/register",
  secondaryCtaLabel = "Özellikleri İncele",
  secondaryCtaHref = "#ozellikler",
  canvasProps,
}: LandingHeroProps) {
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

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!secondaryCtaHref.startsWith("#")) return;
    const targetId = secondaryCtaHref.slice(1);
    const targetEl = document.getElementById(targetId);
    if (!targetEl) return;

    e.preventDefault();
    const headerOffset = 76;
    const targetY =
      targetEl.getBoundingClientRect().top + window.scrollY - headerOffset;

    const scrollProxy = { y: window.scrollY };
    gsap.to(scrollProxy, {
      y: targetY,
      duration: 0.9,
      ease: "power3.inOut",
      onUpdate: () => {
        window.scrollTo(0, scrollProxy.y);
      },
    });
  };

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100/80 pt-14 pb-24 lg:pt-20 lg:pb-32"
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
        {/* Sol Sütun: Başlık, Alt Başlık, Aksiyonlar ve Klinik Metrik Kartları */}
        <div className="lg:col-span-6">
          <div
            data-gsap="hero-fade-up"
            className="inline-flex items-center gap-2.5 rounded-full border border-blue-200/80 bg-white/90 px-4 py-1.5 text-xs font-semibold text-blue-700 shadow-xs backdrop-blur-sm"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
              <Sparkles className="h-3 w-3" />
            </span>
            <span>{badgeText}</span>
          </div>

          <h1
            data-gsap="hero-fade-up"
            className="mt-7 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl lg:text-[56px] lg:leading-[1.08]"
          >
            {titlePrefix}
            <span className="mt-1 block bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
              {titleHighlight}
            </span>
          </h1>

          <p
            data-gsap="hero-fade-up"
            className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg"
          >
            {subtitle}
          </p>

          {/* CTA Butonları */}
          <div
            data-gsap="hero-fade-up"
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Link
              href={primaryCtaHref}
              className="group inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950 px-7 py-4 text-sm font-semibold text-white shadow-xl shadow-slate-900/20 transition-all duration-300 hover:-translate-y-0.5 hover:from-blue-600 hover:to-blue-500 hover:shadow-blue-600/30"
            >
              <span>{primaryCtaLabel}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <a
              href={secondaryCtaHref}
              onClick={handleSmoothScroll}
              className="inline-flex cursor-pointer items-center gap-2.5 rounded-2xl border border-slate-200/90 bg-white/90 px-6 py-4 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:bg-white hover:text-blue-600"
            >
              <Layers className="h-4 w-4 text-blue-600" />
              <span>{secondaryCtaLabel}</span>
            </a>
          </div>

          {/* Alt Klinik Güven & Performans Kartçıkları */}
          <div
            data-gsap="hero-fade-up"
            className="mt-11 grid grid-cols-3 gap-3 border-t border-slate-200/80 pt-7"
          >
            <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-3.5 shadow-2xs backdrop-blur-xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Zap className="h-3.5 w-3.5 text-blue-600" />
                <span>60 FPS WebGL</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Tarayıcıda kurulumsuz 3D
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-3.5 shadow-2xs backdrop-blur-xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>+%42 Onay</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                İlk muayenede vaka kabulü
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-3.5 shadow-2xs backdrop-blur-xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                <span>KVKK Uyumlu</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                İzole klinik veri güvenliği
              </p>
            </div>
          </div>
        </div>

        {/* Sağ Sütun: React Three Fiber 3D Odontogram Sahnesi */}
        <div data-gsap="hero-fade-up" className="relative lg:col-span-6">
          <OdontogramCanvas {...canvasProps} />
        </div>
      </div>
    </section>
  );
}
