import React from "react";
import { Box, Play, Smartphone } from "lucide-react";

import type { LandingDictionary } from "./i18n";
import { InteractiveToothModel } from "./interactive-tooth-model";

const FEATURE_VISUALS = [
  { Icon: Box, tone: "text-blue-600" },
  { Icon: Play, tone: "text-violet-600" },
  { Icon: Smartphone, tone: "text-emerald-600" },
] as const;

export interface LandingFeaturesProps {
  readonly copy: LandingDictionary["features"];
}

export function LandingFeatures({ copy }: LandingFeaturesProps) {
  return (
    <section
      id="ozellikler"
      className="relative scroll-mt-20 overflow-hidden border-t border-slate-200/70 bg-white py-24"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          {/* Başlık + çerçevesiz, ikonlu özellik listesi */}
          <div className="lg:col-span-5">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              {copy.title}
            </h2>

            <ul className="mt-10 space-y-7">
              {copy.items.map((item, index) => {
                const { Icon, tone } = FEATURE_VISUALS[index] ?? FEATURE_VISUALS[0];
                return (
                  <li key={item.title} className="flex items-start gap-4">
                    <Icon
                      aria-hidden="true"
                      className={`mt-0.5 h-6 w-6 shrink-0 ${tone}`}
                    />
                    <div>
                      <h3 className="text-base font-semibold tracking-tight text-slate-950">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-slate-500">
                        {item.description}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Arka plansız, etkileşimli 3D diş modeli */}
          <div className="lg:col-span-7">
            <InteractiveToothModel
              ariaLabel={copy.toothAriaLabel}
              fallbackAlt={copy.toothFallbackAlt}
              hint={copy.dragHint}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
