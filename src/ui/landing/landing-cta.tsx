import React from "react";
import { ArrowRight } from "lucide-react";

import type { LandingDictionary } from "./i18n";
import { PillLink } from "./landing-ui";

export interface LandingCtaProps {
  readonly copy: LandingDictionary["cta"];
  readonly registerHref?: string;
  readonly loginHref?: string;
}

/** Kapanış çağrısı: koyu zemin, iki tonlu başlık ve kayıt düğmesi. */
export function LandingCta({
  copy,
  registerHref = "/register",
  loginHref = "/login",
}: LandingCtaProps) {
  return (
    <section
      id="cta"
      aria-labelledby="cta-title"
      className="relative isolate overflow-hidden bg-[#070a14] py-24 text-white md:py-32 [background-image:radial-gradient(70%_70%_at_50%_45%,#1b2a5e_0%,#0d1430_50%,#070a14_100%)]"
    >
      <div className="landing-reveal mx-auto max-w-3xl px-4 text-center sm:px-6">
        <p className="text-[11px] font-semibold tracking-[0.22em] text-sky-300 uppercase">
          {copy.eyebrow}
        </p>
        <h2
          id="cta-title"
          className="mt-4 text-[2rem] leading-[1.08] font-extrabold tracking-[-0.03em] text-balance sm:text-5xl lg:text-6xl rtl:leading-[1.3]"
        >
          {copy.title}{" "}
          <span className="text-grad-dark block">{copy.titleMuted}</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-balance text-slate-300/90 sm:text-lg">
          {copy.description}
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-5">
          <PillLink href={registerHref} className="px-8 py-4 text-base">
            {copy.register}
          </PillLink>
          <PillLink href={loginHref} variant="ghost-dark">
            {copy.login}
            <ArrowRight
              aria-hidden="true"
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5"
            />
          </PillLink>
        </div>
      </div>
    </section>
  );
}
