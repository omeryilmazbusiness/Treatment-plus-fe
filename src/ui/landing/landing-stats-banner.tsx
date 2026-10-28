import React from "react";
import { Quote, TrendingUp } from "lucide-react";

import { DEFAULT_STATS, type StatMetric } from "./landing-data";

export interface LandingStatsBannerProps {
  readonly headlinePrefix?: string;
  readonly headlineHighlight?: string;
  readonly description?: string;
  readonly stats?: readonly StatMetric[];
}

export function LandingStatsBanner({
  headlinePrefix = "Kliniklerin hasta kabul oranını",
  headlineHighlight = "ortalama %42 artırıyor",
  description = "Hastalar anlamadıkları tedavi planlarını erteleme eğilimindedir. 3 boyutlu görsel konsültasyon, fiyat odaklı tereddütleri şeffaf klinik güvene dönüştürür.",
  stats = DEFAULT_STATS,
}: LandingStatsBannerProps) {
  return (
    <section
      aria-label="Klinik İstatistikleri ve Sosyal Kanıt"
      className="bg-white py-20"
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* Büyük Kart: Gece Mavisi (Dış Bölüm Arka Planı Beyaz) */}
        <div className="relative overflow-hidden rounded-[2.5rem] border border-blue-500/25 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 p-8 text-white shadow-2xl shadow-slate-950/20 sm:p-12 lg:p-16">
          {/* Dekoratif Işıma */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-28 right-1/4 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-28 left-1/4 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl"
          />

          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-1.5 text-xs font-bold tracking-wider text-cyan-300 uppercase">
              <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
              <span>Ölçülebilir Klinik Dönüşümü</span>
            </span>

            <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {headlinePrefix}{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {headlineHighlight}
              </span>
            </h2>

            <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">
              {description}
            </p>
          </div>

          {/* İstatistik Kartları */}
          <div className="relative z-10 mt-12 grid gap-6 md:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.id}
                className="rounded-3xl border border-white/10 bg-white/[0.05] p-7 text-center backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/[0.08]"
              >
                <p className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">
                  {stat.value}
                </p>
                <p className="mt-3 text-base font-bold text-white">
                  {stat.label}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                  {stat.detail}
                </p>
              </div>
            ))}
          </div>

          {/* Alt Alıntı Bandı */}
          <div className="relative z-10 mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-900/75 px-6 py-5 text-center sm:flex-row sm:text-left">
            <div className="flex items-center gap-3.5">
              <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 text-cyan-300 sm:flex">
                <Quote className="h-5 w-5" />
              </div>
              <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
                “Hastalarımız 3D model üzerinde implant açısını ve zirkonyum
                restorasyonu gördüğünde, tedavi sürecine çok daha yüksek bir
                güvenle onay veriyor.”
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs font-semibold text-cyan-300">
              Ağız & Diş Sağlığı Poliklinikleri
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
