import React from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import type { SectionHeading as SectionHeadingCopy } from "./i18n/dictionary";

export type SurfaceTone = "light" | "dark";

export interface SectionHeadingProps {
  readonly heading: SectionHeadingCopy;
  readonly tone?: SurfaceTone;
  readonly id?: string;
  readonly align?: "center" | "start";
  readonly as?: "h1" | "h2";
  readonly className?: string;
}

/** BrightPlans tarzı: küçük mavi etiket + iki tonlu iri başlık. */
export function SectionHeading({
  heading,
  tone = "light",
  id,
  align = "center",
  as: Tag = "h2",
  className = "",
}: SectionHeadingProps) {
  const dark = tone === "dark";
  return (
    <div
      className={`${align === "center" ? "text-center" : "text-start"} ${className}`}
    >
      <p
        className={`text-[11px] font-semibold tracking-[0.2em] uppercase ${
          dark ? "text-sky-300" : "text-blue-600"
        }`}
      >
        {heading.eyebrow}
      </p>
      <Tag
        id={id}
        className={`mt-3 text-[2rem] leading-[1.08] font-extrabold tracking-[-0.03em] text-balance sm:text-5xl lg:text-6xl rtl:leading-[1.3] ${
          dark ? "text-white" : "text-[#1d1d1f]"
        }`}
      >
        {heading.title}
        {heading.titleMuted ? (
          <>
            {" "}
            <span
              className={`${dark ? "text-slate-400" : "text-[#86868b]"} block sm:inline`}
            >
              {heading.titleMuted}
            </span>
          </>
        ) : null}
      </Tag>
    </div>
  );
}

export interface PillLinkProps {
  readonly href: string;
  readonly children: React.ReactNode;
  readonly variant?: "primary" | "outline-dark" | "ghost-dark";
  readonly className?: string;
}

const PILL_BASE =
  "group items-center justify-center gap-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400";

const PILL_VARIANTS: Record<NonNullable<PillLinkProps["variant"]>, string> = {
  primary:
    "bg-blue-600 px-7 py-3.5 text-white shadow-[0_14px_36px_-10px_rgba(37,99,235,0.75)] hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-[0_18px_44px_-10px_rgba(37,99,235,0.9)]",
  "outline-dark":
    "px-5 py-2.5 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.34)] hover:bg-white/10 hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)]",
  "ghost-dark": "px-4 py-3 text-white/85 hover:text-white",
};

/** Hap şeklinde bağlantı; site içi yollar Link, mailto/harici bağlantılar düz <a>. */
export function PillLink({
  href,
  children,
  variant = "primary",
  className = "",
}: PillLinkProps) {
  // `hidden` ile `inline-flex` aynı katmanda çakışır; yalnızca gizli değilken ekle.
  const display = className.split(" ").includes("hidden") ? "" : "inline-flex";
  const classes = `${display} ${PILL_BASE} ${PILL_VARIANTS[variant]} ${className}`;
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={classes}>
      {children}
    </a>
  );
}

export type SoftTone = "brand" | "brand-dark" | "mint" | "sky" | "white";

const SOFT_GRADIENTS: Readonly<Record<SoftTone, readonly [string, string]>> = {
  brand: ["#6d46c9", "#3f95e0"],
  "brand-dark": ["#a78bfa", "#8ad0ff"],
  mint: ["#10b981", "#5fe3b5"],
  sky: ["#38bdf8", "#8b9cf8"],
  white: ["#ffffff", "#c9d6ff"],
};

/**
 * `SoftIcon` gradyanlarının tanımı; sayfada bir kez render edilir.
 * Boyutsuz ama görünür bırakılır (display:none gradyanı bozar).
 */
export function SoftIconDefs() {
  return (
    <svg aria-hidden="true" focusable="false" width="0" height="0" className="absolute">
      <defs>
        {(Object.keys(SOFT_GRADIENTS) as SoftTone[]).map((tone) => {
          const [from, to] = SOFT_GRADIENTS[tone];
          return (
            <linearGradient
              key={tone}
              id={`soft-${tone}`}
              gradientUnits="userSpaceOnUse"
              x1="2"
              y1="2"
              x2="22"
              y2="22"
            >
              <stop offset="0%" stopColor={from} />
              <stop offset="100%" stopColor={to} />
            </linearGradient>
          );
        })}
      </defs>
    </svg>
  );
}

export interface SoftIconProps {
  readonly icon: LucideIcon;
  readonly tone?: SoftTone;
  readonly className?: string;
}

/** Çerçevesiz, ince çizgili, yumuşak gradyanlı ikon. */
export function SoftIcon({ icon: Icon, tone = "brand", className = "h-6 w-6" }: SoftIconProps) {
  return (
    <Icon
      aria-hidden="true"
      color={`url(#soft-${tone})`}
      strokeWidth={1.5}
      className={`shrink-0 ${className}`}
    />
  );
}
