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

import {
  DEFAULT_PRICING,
  DEFAULT_STEPS,
  type PricingPlan,
  type WorkflowStep,
} from "./landing-data";

export interface LandingWorkflowProps {
  readonly steps?: readonly WorkflowStep[];
  readonly pricingPlans?: readonly PricingPlan[];
}

export function LandingWorkflow({
  steps = DEFAULT_STEPS,
  pricingPlans = DEFAULT_PRICING,
}: LandingWorkflowProps) {
  return (
    <>
      {/* Nasıl Çalışır Bölümü (Kutucukların Hepsi Aynı Renk) */}
      <section
        id="nasil-calisir"
        className="scroll-mt-20 border-t border-slate-200/70 bg-white py-28"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-bold tracking-wider text-blue-700 uppercase">
              Klinik İş Akışı
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              3 Adımda İnteraktif Tedavi Planlama
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Mevcut klinik iş akışınızı yavaşlatmadan dakikalar içinde 3D
              sunum hazırlayın.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {steps.map((item) => (
              <div
                key={item.step}
                className="group relative overflow-hidden rounded-[2rem] border border-blue-500/25 bg-gradient-to-b from-slate-900 via-slate-950 to-blue-950 p-8 text-white shadow-xl shadow-slate-900/10 transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-400/50"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-3.5 py-1.5 font-mono text-xs font-extrabold tracking-widest text-white">
                    ADIM {item.step}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold text-cyan-300">
                    {item.badge}
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-extrabold text-white">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Paketler Alanı (Fiyatsız, Classic & Ultimate Örnek Yönlendirmeli) */}
      <section
        id="fiyatlandirma"
        className="scroll-mt-20 border-t border-slate-200/70 bg-white py-28"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-bold tracking-wider text-blue-700 uppercase">
              <Layers className="h-3.5 w-3.5" />
              Klinik Çözüm Paketleri
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              Kliniğinize Uygun Sunum Paketini Keşfedin
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Örnek hasta sunumlarını inceleyerek kliniğiniz için en uygun paketi seçin.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-2">
            {pricingPlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between overflow-hidden rounded-[2rem] border p-9 transition-all duration-300 hover:-translate-y-1.5 ${
                  plan.featured
                    ? "border-blue-500/50 bg-gradient-to-b from-slate-900 via-slate-950 to-blue-950 text-white shadow-2xl shadow-blue-950/25"
                    : "border-slate-200/90 bg-white text-slate-900 shadow-md hover:border-blue-300 hover:shadow-xl"
                }`}
              >
                {plan.featured && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl"
                  />
                )}

                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold ${
                        plan.featured
                          ? "border border-cyan-400/30 bg-cyan-500/15 text-cyan-300"
                          : "border border-blue-100 bg-blue-50 text-blue-700"
                      }`}
                    >
                      {plan.featured ? (
                        <Sparkles className="h-3.5 w-3.5" />
                      ) : (
                        <FileText className="h-3.5 w-3.5" />
                      )}
                      {plan.tagLabel}
                    </span>

                    {plan.featured && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                        Önerilen
                      </span>
                    )}
                  </div>

                  <h3 className="mt-6 text-2xl font-extrabold tracking-tight sm:text-3xl">
                    {plan.name}
                  </h3>

                  <p
                    className={`mt-3 text-sm leading-relaxed ${
                      plan.featured ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    {plan.subtitle}
                  </p>

                  <ul className="mt-8 space-y-3.5 border-t border-current/10 pt-7">
                    {plan.perks.map((perk) => (
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
                  href={plan.ctaHref}
                  className={`group relative z-10 mt-9 inline-flex items-center justify-center gap-2.5 rounded-2xl px-6 py-4 text-sm font-semibold transition-all ${
                    plan.featured
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500"
                      : "bg-slate-900 text-white shadow-md shadow-slate-900/10 hover:bg-blue-600"
                  }`}
                >
                  <Eye className="h-4 w-4" />
                  <span>{plan.ctaLabel}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            ))}
          </div>

          {/* Alt Kayıt Ol Çağrı Alanı */}
          <div className="relative mt-20 flex flex-col items-center justify-between gap-8 overflow-hidden rounded-[2.25rem] border border-blue-500/20 bg-gradient-to-r from-slate-900 via-slate-950 to-blue-950 p-8 text-white shadow-2xl sm:p-12 lg:flex-row">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"
            />
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/30 bg-blue-500/15 px-3.5 py-1 text-xs font-semibold text-cyan-300">
                Hızlı Klinik Kurulumu
              </span>
              <h3 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
                Dakikalar içinde 3D tedavi planlamaya başlayın
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-300">
                Klinik hesabınızı açın, kataloğunuzu tanımlayın ve hastalarınıza interaktif 3D planlar sunun.
              </p>
            </div>
            <div className="relative z-10 flex shrink-0 flex-wrap items-center gap-3.5">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-7 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5 hover:bg-blue-500"
              >
                <UserPlus className="h-4 w-4" />
                <span>Hemen Kayıt Ol</span>
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-6 py-4 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <span>Giriş Yap</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
