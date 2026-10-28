import React from "react";
import { Box, CheckCircle2, Layers, Smartphone, Sparkles } from "lucide-react";

import { InteractiveMouthExplorer } from "./interactive-mouth-explorer";
import {
  DEFAULT_FEATURES,
  type FeatureCardData,
  type FeatureIconKey,
} from "./landing-data";

const ICON_MAP: Record<
  FeatureIconKey,
  React.ComponentType<{ className?: string }>
> = {
  odontogram: Box,
  animation: Layers,
  mobile: Smartphone,
};

export interface LandingFeaturesProps {
  readonly features?: readonly FeatureCardData[];
}

export function LandingFeatures({
  features = DEFAULT_FEATURES,
}: LandingFeaturesProps) {
  return (
    <section
      id="ozellikler"
      className="relative scroll-mt-20 overflow-hidden border-t border-slate-200/70 bg-white py-24"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          {/* Sol Sütun: Özetlenmiş Klinik Odaklı Özellikler */}
          <div className="lg:col-span-5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-bold tracking-wider text-blue-700 uppercase">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              Klinik Odaklı Özellikler
            </span>

            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              Hastanız Tedaviyi Görünce Güvenle Onaylar
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
              Treatment, hekimin klinik uzmanlığını hastanın ilk bakışta
              anlayabileceği interaktif 3 boyutlu ağız ve diş modeline
              dönüştürür.
            </p>

            {/* Özetlenmiş 3 Özellik Listesi */}
            <div className="mt-8 space-y-4">
              {features.map((feature) => {
                const Icon = ICON_MAP[feature.icon];
                return (
                  <article
                    key={feature.id}
                    className="group rounded-2xl border border-slate-200/90 bg-slate-50/70 p-5 transition-all hover:border-blue-300 hover:bg-white hover:shadow-md"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white transition-colors group-hover:bg-blue-600">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-base font-bold text-slate-900">
                            {feature.title}
                          </h3>
                          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
                            {feature.badge}
                          </span>
                        </div>
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                          {feature.description}
                        </p>
                        <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
                          {feature.highlights.slice(0, 2).map((item) => (
                            <span
                              key={item}
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                              <span>{item}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {/* Sağ Sütun: İnteraktif 3D Ağız & 32 Diş FDI Modeli */}
          <div className="lg:col-span-7">
            <InteractiveMouthExplorer />
          </div>
        </div>
      </div>
    </section>
  );
}
