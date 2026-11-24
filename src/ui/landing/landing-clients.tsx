import React from "react";
import Image from "next/image";

import type { LandingDictionary } from "./i18n";
import { DEFAULT_CLIENTS, type ClientLogoData } from "./landing-data";

export interface LandingClientsProps {
  readonly copy: LandingDictionary["clients"];
  readonly clients?: readonly ClientLogoData[];
}

export function LandingClients({
  copy,
  clients = DEFAULT_CLIENTS,
}: LandingClientsProps) {
  if (clients.length === 0) return null;

  return (
    <section
      aria-label={copy.ariaLabel}
      className="border-t border-slate-200/70 bg-white py-14"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-6">
        <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
          {copy.title}
        </p>

        <ul className="flex flex-wrap items-center justify-center gap-x-14 gap-y-8">
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
    </section>
  );
}
