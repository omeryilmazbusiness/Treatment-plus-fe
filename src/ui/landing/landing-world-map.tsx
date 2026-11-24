import React from "react";

import type { LandingDictionary } from "./i18n";
import {
  MAP_BASE,
  MAP_COLS,
  MAP_GROWING,
  MAP_NEW,
  MAP_ROWS,
  MAP_STEP,
} from "./landing-map-data";

export interface LandingWorldMapProps {
  readonly copy: LandingDictionary["languages"]["map"];
}

const ROW_HEIGHT = MAP_STEP * 0.866;
const PAD = 14;
const WIDTH = MAP_COLS * MAP_STEP + PAD * 2;
const HEIGHT = MAP_ROWS * ROW_HEIGHT + PAD * 2;

/** Veri üretiminde kullanılan ızgarayla aynı izdüşüm (bkz. landing-map-data.ts). */
const LON_MIN = -168;
const LAT_MAX = 74;
const DEG_STEP = 2.2;

function project(lon: number, lat: number): { readonly x: number; readonly y: number } {
  return {
    x: ((lon - LON_MIN) / DEG_STEP) * MAP_STEP + PAD,
    y: ((LAT_MAX - lat) / (DEG_STEP * 0.866)) * ROW_HEIGHT + PAD,
  };
}

/** Düz [x2, satır, …] dizisini tek bir "nokta" yoluna çevirir (yuvarlak uçlu sıfır uzunluklu çizgiler). */
function dotsPath(points: readonly number[]): string {
  let d = "";
  for (let i = 0; i < points.length; i += 2) {
    const x2 = points[i] ?? 0;
    const row = points[i + 1] ?? 0;
    const x = (x2 * MAP_STEP) / 2 + PAD;
    const y = row * ROW_HEIGHT + PAD;
    d += `M${x.toFixed(1)} ${y.toFixed(1)}h0`;
  }
  return d;
}

const BASE_PATH = dotsPath(MAP_BASE);
const GROWING_PATH = dotsPath(MAP_GROWING);
const NEW_PATH = dotsPath(MAP_NEW);

/** Gelişen bölgelerdeki şehir "ping"leri: İstanbul ve Riyad. */
const PINGS = [project(28.97, 41.01), project(46.68, 24.71)] as const;

const GREEN = "#3dff95";
const BLUE = "#38b6ff";

/**
 * Noktalı dünya haritası: yeşil neon = klinik sayısının arttığı bölgeler,
 * mavi = yeni kurulan bölgeler. Salt dekoratif SVG; açıklama aşağıdaki gösterge ve aria-label'da.
 */
export function LandingWorldMap({ copy }: LandingWorldMapProps) {
  return (
    <figure className="mx-auto mt-12 max-w-6xl">
      <div dir="ltr" className="[mask-image:radial-gradient(ellipse_80%_85%_at_50%_50%,#000_58%,transparent_100%)]">
        <svg
          role="img"
          aria-label={copy.ariaLabel}
          viewBox={`0 0 ${WIDTH.toFixed(0)} ${HEIGHT.toFixed(0)}`}
          className="h-auto w-full"
        >
          <defs>
            <filter id="map-glow-soft" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="7" />
            </filter>
            <filter id="map-glow-tight" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="2.6" />
            </filter>
          </defs>

          <path
            d={BASE_PATH}
            fill="none"
            stroke="rgba(148,163,210,0.38)"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Mavi: yeni kurulan bölgeler */}
          <path
            d={NEW_PATH}
            fill="none"
            stroke={BLUE}
            strokeWidth="9"
            strokeLinecap="round"
            opacity="0.32"
            filter="url(#map-glow-soft)"
          />
          <path
            d={NEW_PATH}
            fill="none"
            stroke={BLUE}
            strokeWidth="4.8"
            strokeLinecap="round"
            opacity="0.92"
          />

          {/* Yeşil neon: klinik sayısı artan bölgeler */}
          <g className="landing-pulse">
            <path
              d={GROWING_PATH}
              fill="none"
              stroke={GREEN}
              strokeWidth="17"
              strokeLinecap="round"
              opacity="0.8"
              filter="url(#map-glow-soft)"
            />
            <path
              d={GROWING_PATH}
              fill="none"
              stroke={GREEN}
              strokeWidth="8"
              strokeLinecap="round"
              opacity="1"
              filter="url(#map-glow-tight)"
            />
          </g>
          <path
            d={GROWING_PATH}
            fill="none"
            stroke="#b8ffd6"
            strokeWidth="5.4"
            strokeLinecap="round"
          />

          {PINGS.map((pin, index) => (
            <g key={index}>
              <circle cx={pin.x} cy={pin.y} r="4" fill="#ffffff" />
              <circle
                cx={pin.x}
                cy={pin.y}
                r="14"
                fill="none"
                stroke={GREEN}
                strokeWidth="2"
                className="landing-ping"
              />
            </g>
          ))}
        </svg>
      </div>

      <figcaption className="mt-6 flex flex-wrap items-center justify-center gap-x-9 gap-y-3 text-sm text-slate-300">
        <span className="inline-flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="h-2.5 w-2.5 rounded-full bg-[#3dff95] shadow-[0_0_14px_3px_rgba(61,255,149,0.75)]"
          />
          {copy.growing}
        </span>
        <span className="inline-flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="h-2.5 w-2.5 rounded-full bg-[#38b6ff] shadow-[0_0_14px_3px_rgba(56,182,255,0.7)]"
          />
          {copy.fresh}
        </span>
      </figcaption>
    </figure>
  );
}
