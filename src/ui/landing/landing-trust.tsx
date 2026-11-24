import React from "react";
import Image from "next/image";

import type { LandingDictionary } from "./i18n";
import { DEFAULT_CLIENTS, type ClientLogoData } from "./landing-data";

export interface LandingTrustProps {
  readonly copy: LandingDictionary["trust"];
  readonly clients?: readonly ClientLogoData[];
}

/** Güven bandı: iddia cümlesi, gradyan rakamlar ve müşteri logoları. */
export function LandingTrust({ copy, clients = DEFAULT_CLIENTS }: LandingTrustProps) {
  return (
    <section
      id="trust"
      aria-label={copy.ariaLabel}
      className="bg-white py-16 md:py-24"
    >
      <div className="landing-reveal mx-auto max-w-5xl px-4 text-center sm:px-6">
        <p className="mx-auto max-w-3xl text-xl leading-snug font-bold tracking-tight text-balance text-[#1d1d1f] sm:text-2xl rtl:leading-relaxed">
          {copy.lead} <span className="text-[#86868b]">{copy.leadMuted}</span>
        </p>

        <ul className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-6">
          {copy.items.map((item) => (
            <li key={item.label} className="flex flex-col items-center">
              <span
                dir="ltr"
                className="text-grad-light text-6xl leading-none font-extrabold tracking-[-0.04em] sm:text-7xl"
              >
                {item.value}
              </span>
              <span className="mt-4 text-[11px] font-semibold tracking-[0.16em] text-slate-600 uppercase">
                {item.label}
              </span>
              <span className="mt-2 max-w-[16rem] text-[13px] leading-snug text-slate-500">
                {item.detail}
              </span>
            </li>
          ))}
        </ul>

        {clients.length > 0 ? (
          <div
            aria-label={copy.clientsAriaLabel}
            role="group"
            className="mt-16 border-t border-slate-100 pt-12"
          >
            <p className="text-[11px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
              {copy.clientsTitle}
            </p>
            <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-14 gap-y-8">
              {clients.map((client) => (
                <li key={client.id}>
                  <a
                    href={client.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={client.name}
                    className="block opacity-90 transition-opacity duration-200 hover:opacity-100 focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
                  >
                    <Image
                      src={client.logoSrc}
                      alt={client.name}
                      width={client.logoWidth}
                      height={client.logoHeight}
                      className="h-14 w-auto sm:h-16"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
