import React from "react";
import { MapPin, Plane } from "lucide-react";

import type { LandingDictionary } from "./i18n";
import { PaperFrame, PhoneFrame, PlanCover } from "./landing-devices";
import { SectionHeading } from "./landing-ui";

export interface LandingMadeForProps {
  readonly copy: LandingDictionary["madeFor"];
  readonly coverTitle: string;
  readonly patientName: string;
}

interface PriceChipProps {
  readonly price: string;
  readonly className: string;
}

/** Rakip tekliflerini temsil eden fiyat etiketi + harita iğnesi. */
function PriceChip({ price, className }: PriceChipProps) {
  return (
    <div
      dir="ltr"
      className={`absolute flex flex-col items-center gap-0.5 ${className}`}
    >
      <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 shadow-[0_6px_16px_-4px_rgba(15,23,42,0.25)]">
        {price}
      </span>
      <MapPin aria-hidden="true" className="h-5 w-5 fill-slate-400/80 text-white" />
    </div>
  );
}

function YouMarker({ label }: { readonly label: string }) {
  return (
    <div className="absolute start-1/2 top-[47%] flex -translate-x-1/2 flex-col items-center rtl:translate-x-1/2">
      <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white shadow-[0_8px_18px_-4px_rgba(37,99,235,0.7)]">
        {label}
      </span>
      <span className="relative mt-1.5 flex h-6 w-6 items-center justify-center">
        <span className="absolute h-6 w-6 rounded-full bg-blue-500/25" />
        <span className="h-3 w-3 rounded-full bg-blue-600 ring-2 ring-white" />
      </span>
    </div>
  );
}

/** Eğik "harita" levhası; içerik SVG ile çizilir. */
function MapTile({ children }: { readonly children: React.ReactNode }) {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-x-[2%] bottom-[6%] h-[44%] overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-[#eef3fb] to-[#dbe6f6] shadow-[0_34px_50px_-22px_rgba(30,41,90,0.45),inset_0_1px_0_rgba(255,255,255,0.9)] [transform:perspective(620px)_rotateX(48deg)]"
    >
      {children}
    </div>
  );
}

function TourismScene({ youLabel, coverTitle, patientName }: SceneProps) {
  return (
    <div className="relative mx-auto h-[270px] w-full max-w-[440px]">
      <MapTile>
        <svg viewBox="0 0 400 180" className="h-full w-full" preserveAspectRatio="none">
          <path
            d="M20 120c20-40 60-70 110-60s60 30 100 20 70-30 110-10 50 50 30 80-80 40-130 30-90 20-150 10S0 160 20 120Z"
            fill="#b9d0f2"
          />
          <path d="M250 50c25-20 70-20 100 0s20 40-10 50-70 0-90-20 0-20 0-30Z" fill="#c9dcf6" />
          <path
            d="M30 90C90 40 160 40 215 95"
            fill="none"
            stroke="#2563eb"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M20 120C100 150 200 120 215 95"
            fill="none"
            stroke="#64748b"
            strokeWidth="1.6"
            strokeDasharray="4 6"
            strokeLinecap="round"
          />
        </svg>
      </MapTile>
      <Plane
        aria-hidden="true"
        className="absolute start-[27%] top-[50%] h-5 w-5 rotate-[24deg] fill-blue-600 text-blue-600 rtl:-scale-x-100"
      />
      <PriceChip price="€6,400" className="start-[4%] top-[52%]" />
      <PriceChip price="€7,900" className="end-[6%] top-[58%]" />
      <PhoneFrame className="absolute start-1/2 top-[2%] w-[16%] -translate-x-1/2 rtl:translate-x-1/2">
        <PlanCover title={coverTitle} patient={patientName} className="h-full w-full" />
      </PhoneFrame>
      <YouMarker label={youLabel} />
    </div>
  );
}

function LocalScene({ youLabel, coverTitle, patientName }: SceneProps) {
  return (
    <div className="relative mx-auto h-[270px] w-full max-w-[440px]">
      <MapTile>
        <svg viewBox="0 0 400 180" className="h-full w-full" preserveAspectRatio="none">
          <rect width="400" height="180" fill="#e3e9f3" />
          <path d="M-10 60c70 20 130-30 200 0s130 40 220 10v30c-90 30-150 0-220-20S60 110-10 90Z" fill="#b9d0f2" />
          <rect x="250" y="95" width="70" height="46" rx="6" fill="#cfe6cf" />
          {[40, 100, 160, 220, 280, 340].map((x) => (
            <line key={`v${x}`} x1={x} y1="0" x2={x} y2="180" stroke="#fff" strokeWidth="6" />
          ))}
          {[30, 85, 140].map((y) => (
            <line key={`h${y}`} x1="0" y1={y} x2="400" y2={y} stroke="#fff" strokeWidth="6" />
          ))}
        </svg>
      </MapTile>
      <PriceChip price="€9,200" className="start-[6%] top-[50%]" />
      <PriceChip price="€7,800" className="end-[4%] top-[44%]" />
      <div className="absolute start-1/2 top-[0%] w-[19%] -translate-x-1/2 rtl:translate-x-1/2">
        <PaperFrame>
          <PlanCover title={coverTitle} patient={patientName} className="h-full w-full" />
        </PaperFrame>
        <span className="absolute start-[10%] bottom-[10%] rounded bg-red-500 px-1.5 py-0.5 text-[9px] leading-none font-bold text-white">
          PDF
        </span>
      </div>
      <YouMarker label={youLabel} />
    </div>
  );
}

interface SceneProps {
  readonly youLabel: string;
  readonly coverTitle: string;
  readonly patientName: string;
}

export function LandingMadeFor({ copy, coverTitle, patientName }: LandingMadeForProps) {
  const scene = { youLabel: copy.you, coverTitle, patientName };
  const [tourism, local] = copy.cards;

  return (
    <section
      id="made-for"
      aria-labelledby="made-for-title"
      className="relative overflow-hidden bg-[#f5f5f7] py-20 md:py-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute start-1/2 top-24 h-[420px] w-[760px] -translate-x-1/2 rounded-full bg-indigo-200/40 blur-[110px] rtl:translate-x-1/2"
      />
      <div className="landing-reveal relative mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading heading={copy.heading} id="made-for-title" />
        <p className="mx-auto mt-5 max-w-xl text-center text-base leading-relaxed text-balance text-slate-500 sm:text-lg">
          {copy.description}
        </p>

        <div className="mt-14 grid gap-14 md:grid-cols-2 md:gap-6">
          {[
            { card: tourism, scene: <TourismScene key="t" {...scene} /> },
            { card: local, scene: <LocalScene key="l" {...scene} /> },
          ].map(({ card, scene: visual }) => (
            <article key={card.title} className="text-center">
              {visual}
              <h3 className="text-grad-light mt-2 text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">
                {card.title}
              </h3>
              <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-balance text-slate-500">
                {card.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
