import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Eye,
  FileText,
  Layers,
  Sparkles,
  UserPlus,
} from "lucide-react";

import type { LandingDictionary } from "./i18n";

const PLAN_LINKS = {
  classic: "/ornekler/classic",
  ultimate: "/ornekler/ultimate",
} as const;

export interface LandingWorkflowProps {
  readonly workflow: LandingDictionary["workflow"];
  readonly pricing: LandingDictionary["pricing"];
  readonly cta: LandingDictionary["cta"];
}

export function LandingWorkflow({
  workflow,
  pricing,
  cta,
}: LandingWorkflowProps) {
  const plans = [
    { id: "classic", featured: false, copy: pricing.classic },
    { id: "ultimate", featured: true, copy: pricing.ultimate },
  ] as const;

  return (
    <>
      {/* Nasıl Çalışır Bölümü (Kutucukların Hepsi Aynı Renk) */}
      <section
        id="nasil-calisir"
        className="scroll-mt-20 border-t border-slate-200/70 bg-white py-28"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold tracking-[0.18em] text-blue-600 uppercase">
              {workflow.eyebrow}
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              {workflow.title}
            </h2>
            <p className="mt-4 text-base text-slate-600">
              {workflow.subtitle}
            </p>
          </div>

          <ol className="mt-20 grid gap-14 md:grid-cols-3 md:gap-10">
            {workflow.steps.map((item, index) => (
              <li key={item.title} className="relative">
                <span
                  aria-hidden="true"
                  className="bg-gradient-to-br from-blue-600 to-cyan-400 bg-clip-text text-6xl font-extrabold tracking-tighter text-transparent"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="mt-5 text-xs font-semibold tracking-[0.14em] text-blue-600 uppercase">
                  <span className="sr-only">{workflow.stepLabel} {index + 1}: </span>
                  {item.badge}
                </p>
                <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-950">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">
                  {item.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Paketler Alanı (Fiyatsız, Communication & Professional Örnek Yönlendirmeli) */}
      <section
        id="fiyatlandirma"
        className="scroll-mt-20 border-t border-slate-200/70 bg-white py-28"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-blue-600 uppercase">
              <Layers aria-hidden="true" className="h-4 w-4" />
              {pricing.eyebrow}
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              {pricing.title}
            </h2>
            <p className="mt-4 text-base text-slate-600">
              {pricing.subtitle}
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-2">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between overflow-hidden rounded-[2rem] p-9 transition-all duration-300 hover:-translate-y-1.5 sm:p-10 ${
                  plan.featured
                    ? "bg-gradient-to-b from-slate-900 via-slate-950 to-blue-950 text-white shadow-2xl shadow-blue-950/25"
                    : "bg-slate-50 text-slate-900 hover:bg-slate-100/80"
                }`}
              >
                {plan.featured && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl"
                  />
                )}

                <div className="relative z-10">
                  <div className="flex min-h-7 items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] uppercase ${
                        plan.featured ? "text-cyan-300" : "text-blue-600"
                      }`}
                    >
                      {plan.featured ? (
                        <Sparkles className="h-3.5 w-3.5" />
                      ) : (
                        <FileText className="h-3.5 w-3.5" />
                      )}
                      {plan.copy.tag}
                    </span>

                    {plan.featured && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                        {pricing.recommended}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-6 text-2xl font-extrabold tracking-tight sm:text-3xl">
                    {plan.copy.name}
                  </h3>

                  <p
                    className={`mt-3 text-sm leading-relaxed ${
                      plan.featured ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    {plan.copy.subtitle}
                  </p>

                  <ul className="mt-9 space-y-4">
                    {plan.copy.perks.map((perk) => (
                      <li
                        key={perk}
                        className="flex items-start gap-3 text-sm"
                      >
                        <span
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                            plan.featured
                              ? "bg-cyan-400/15 text-cyan-400"
                              : "bg-blue-50 text-blue-600"
                          }`}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={PLAN_LINKS[plan.id]}
                  className={`group relative z-10 mt-9 inline-flex items-center justify-center gap-2.5 rounded-2xl px-6 py-4 text-sm font-semibold transition-all ${
                    plan.featured
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500"
                      : "bg-slate-900 text-white shadow-md shadow-slate-900/10 hover:bg-blue-600"
                  }`}
                >
                  <Eye className="h-4 w-4" />
                  <span>{plan.copy.cta}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
                </Link>
              </div>
            ))}
          </div>

          {/* Alt Kayıt Ol Çağrı Alanı */}
          <div className="relative mt-20 flex flex-col items-center justify-between gap-8 overflow-hidden rounded-[2.25rem] bg-gradient-to-r from-slate-900 via-slate-950 to-blue-950 p-8 text-white shadow-2xl sm:p-12 lg:flex-row">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"
            />
            <div className="relative z-10">
              <span className="text-xs font-semibold tracking-[0.18em] text-cyan-300 uppercase">
                {cta.eyebrow}
              </span>
              <h3 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
                {cta.title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-300">
                {cta.description}
              </p>
            </div>
            <div className="relative z-10 flex shrink-0 flex-wrap items-center gap-3.5">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-7 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5 hover:bg-blue-500"
              >
                <UserPlus className="h-4 w-4" />
                <span>{cta.register}</span>
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-6 py-4 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                <span>{cta.login}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
