"use client";

import React, { useId, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  Check,
  FileText,
  Globe,
  Monitor,
  Play,
  Smartphone,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";

import { Mark } from "@/ui/mark";

import type { LandingDictionary } from "./i18n";
import {
  LaptopFrame,
  MOCK_CLINIC_NAME,
  PaperFrame,
  PhoneFrame,
  PlanCover,
} from "./landing-devices";
import { PillLink, SectionHeading } from "./landing-ui";

/** 13 MB'lık ağız modeli yalnızca film sekmesi açılınca indirilir. */
const MouthPreview = dynamic(
  () => import("./mouth-preview").then((module) => module.MouthPreview),
  { ssr: false, loading: () => null },
);

type Format = "desktop" | "mobile" | "pdf";

/** Tasarım genişliği (em): ekran, bu genişliğe göre kapsayıcıya ölçeklenir. */
const DESIGN_WIDTH_EM: Record<Format, number> = {
  desktop: 60,
  mobile: 24,
  pdf: 36,
};

const FORMAT_ICONS: Record<Format, LucideIcon> = {
  pdf: FileText,
  desktop: Monitor,
  mobile: Smartphone,
};

const FORMAT_ORDER: readonly Format[] = ["pdf", "desktop", "mobile"];

export interface LandingShowcaseProps {
  readonly copy: LandingDictionary["showcase"];
  readonly scene: Pick<LandingDictionary["hero"]["scene"], "coverTitle" | "patientName">;
  readonly approveLabel: string;
  readonly demoHref: string;
  readonly demoLabel: string;
  readonly demoNote: string;
}

interface ScreenProps {
  readonly index: number;
  readonly format: Format;
  readonly tab: { readonly title: string; readonly description: string };
  readonly coverTitle: string;
  readonly patientName: string;
  readonly approveLabel: string;
}

function Bar({ className }: { readonly className: string }) {
  return <span className={`block rounded-full bg-slate-200 ${className}`} />;
}

/** Üst şerit: klinik adı ve marka. */
function ScreenTopBar({ mobile }: { mobile: boolean }) {
  return (
    <div
      dir="ltr"
      className={`flex shrink-0 items-center gap-[0.9em] border-b border-slate-100 px-[1.8em] pb-[1.1em] ${mobile ? "pt-[4em]" : "pt-[1.1em]"}`}
    >
      <Mark className="h-[2.2em] w-[2.2em]" />
      <span className="text-[1.05em] font-bold tracking-[0.14em] text-slate-700 uppercase">
        {MOCK_CLINIC_NAME}
      </span>
    </div>
  );
}

function ScreenHeading({
  tab,
  wide,
}: {
  readonly tab: ScreenProps["tab"];
  readonly wide: boolean;
}) {
  return (
    <div className={wide ? "max-w-[70%]" : ""}>
      <p className="text-[2.7em] leading-[1.1] font-extrabold tracking-tight text-[#1d1d1f] rtl:leading-[1.3]">
        {tab.title}
      </p>
      <p className="mt-[0.5em] text-[1.4em] text-slate-500">{tab.description}</p>
    </div>
  );
}

function ScreenBody({
  index,
  format,
  tab,
  coverTitle,
  patientName,
  approveLabel,
}: ScreenProps) {
  const wide = format === "desktop";

  if (index === 0) {
    return (
      <div className={`flex h-full ${wide ? "flex-row" : "flex-col"}`}>
        <PlanCover
          title={coverTitle}
          patient={patientName}
          className={wide ? "h-full w-[46%] shrink-0" : "h-full w-full"}
        />
        {wide ? (
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-[1.2em] p-[4em]">
            <p className="text-[1.2em] font-semibold tracking-[0.16em] text-blue-600 uppercase">
              {MOCK_CLINIC_NAME}
            </p>
            <p className="text-[3.6em] leading-[1.05] font-extrabold tracking-tight text-[#1d1d1f] rtl:leading-[1.3]">
              {tab.title}
            </p>
            <p className="text-[1.4em] text-slate-500">{tab.description}</p>
            <span className="mt-[1em] block h-[2.8em] w-[11em] rounded-full bg-[#1d1d1f]" />
          </div>
        ) : null}
      </div>
    );
  }

  if (index === 2) {
    return (
      <div className="relative isolate h-full w-full overflow-hidden bg-[radial-gradient(75%_70%_at_50%_42%,#2b3f9a_0%,#141c4d_55%,#0a0f2b_100%)]">
        <span
          aria-hidden="true"
          className="absolute start-1/2 top-1/2 h-[10em] w-[10em] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-sky-300/10 blur-2xl rtl:translate-x-1/2"
        />
        <MouthPreview className="absolute inset-0" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#070b22]/90 via-[#070b22]/50 to-transparent px-[2.4em] pt-[5em] pb-[2em]">
          <p className="text-[2.2em] leading-[1.1] font-extrabold tracking-tight text-white rtl:leading-[1.3]">
            {tab.title}
          </p>
          <div dir="ltr" className="mt-[1.1em] flex items-center gap-[1em]">
            <span className="flex h-[2.6em] w-[2.6em] shrink-0 items-center justify-center rounded-full bg-white/95 text-blue-600">
              <Play className="h-[1.1em] w-[1.1em] translate-x-[0.08em] fill-current" aria-hidden="true" />
            </span>
            <span className="relative h-[0.35em] flex-1 rounded-full bg-white/25">
              <span className="absolute inset-y-0 start-0 w-[38%] rounded-full bg-sky-300" />
              <span className="absolute start-[38%] top-1/2 h-[1em] w-[1em] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow" />
            </span>
            <span className="text-[1em] font-medium text-white/70 tabular-nums">00:48 / 02:10</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <ScreenTopBar mobile={format === "mobile"} />
      <div className="flex min-h-0 flex-1 flex-col gap-[2em] p-[2.4em]">
        <ScreenHeading tab={tab} wide={wide} />

        {index === 1 ? (
          <div className={`grid gap-[1.4em] ${format === "mobile" ? "grid-cols-1" : "grid-cols-3"}`}>
            {[0, 1, 2].map((n) => (
              <div
                key={n}
                className="flex items-center gap-[1.2em] rounded-[1.4em] bg-slate-50 p-[1.4em] ring-1 ring-slate-100"
              >
                <span className="flex h-[4em] w-[4em] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-sky-400 text-white">
                  <Stethoscope className="h-[2em] w-[2em]" aria-hidden="true" />
                </span>
                <span className="flex-1 space-y-[0.7em]">
                  <Bar className="h-[0.9em] w-[80%] bg-slate-300" />
                  <Bar className="h-[0.7em] w-[55%]" />
                </span>
              </div>
            ))}
          </div>
        ) : null}

        {index === 3 ? (
          <div className="space-y-[0.9em]">
            {[
              ["w-[46%]", "€2,400"],
              ["w-[60%]", "€5,800"],
              ["w-[38%]", "€1,900"],
              ["w-[52%]", "€3,300"],
            ].map(([width, price]) => (
              <div
                key={price}
                className="flex items-center justify-between rounded-[1em] bg-slate-50 px-[1.4em] py-[1.1em] ring-1 ring-slate-100"
              >
                <Bar className={`h-[0.9em] ${width}`} />
                <span dir="ltr" className="text-[1.3em] font-bold text-slate-700">
                  {price}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between rounded-[1em] bg-blue-600 px-[1.4em] py-[1.2em] text-white">
              <Bar className="h-[0.9em] w-[24%] bg-white/50" />
              <span dir="ltr" className="text-[1.5em] font-extrabold">
                €13,400
              </span>
            </div>
          </div>
        ) : null}

        {index === 4 ? (
          <div className="overflow-hidden rounded-[1.4em] ring-1 ring-slate-200">
            <div dir="ltr" className="flex items-center gap-[0.6em] bg-slate-100 px-[1.2em] py-[0.9em]">
              {["bg-red-300", "bg-amber-300", "bg-emerald-300"].map((c) => (
                <span key={c} className={`h-[0.9em] w-[0.9em] rounded-full ${c}`} />
              ))}
              <span className="ms-[1em] flex flex-1 items-center gap-[0.6em] rounded-full bg-white px-[1.2em] py-[0.5em] text-[1.1em] text-slate-500">
                <Globe className="h-[1.2em] w-[1.2em]" aria-hidden="true" />
                smile-clinic.com
              </span>
            </div>
            <div className="relative h-[11em] bg-gradient-to-br from-[#7c5ce0] via-[#4a6fe3] to-[#2fb4f0]">
              <Image
                src="/tooth-hero.png"
                alt=""
                width={120}
                height={120}
                className="absolute end-[3em] top-1/2 h-[9em] w-[9em] -translate-y-1/2 object-contain"
              />
              <span className="absolute start-[2.4em] top-[3.4em] space-y-[0.8em]">
                <Bar className="h-[1.3em] w-[16em] bg-white/90" />
                <Bar className="h-[0.9em] w-[11em] bg-white/55" />
              </span>
            </div>
            <div className={`grid gap-[1em] p-[1.4em] ${format === "mobile" ? "grid-cols-2" : "grid-cols-3"}`}>
              {[0, 1, 2].map((n) => (
                <span
                  key={n}
                  className={`block h-[5em] rounded-[1em] bg-slate-50 ring-1 ring-slate-100 ${n === 2 && format === "mobile" ? "hidden" : ""}`}
                />
              ))}
            </div>
          </div>
        ) : null}

        {index === 5 ? (
          <div className="flex flex-1 flex-col justify-end gap-[1em]">
            <div className="max-w-[78%] space-y-[0.7em] rounded-[1.4em] rounded-es-[0.4em] bg-slate-100 p-[1.4em]">
              <Bar className="h-[0.9em] w-full bg-slate-300" />
              <Bar className="h-[0.9em] w-[70%] bg-slate-300" />
            </div>
            <span className="inline-flex w-fit items-center gap-[0.8em] self-end rounded-full bg-emerald-500 px-[2em] py-[1.1em] text-[1.4em] font-bold text-white shadow-lg shadow-emerald-500/30">
              <Check className="h-[1.2em] w-[1.2em]" aria-hidden="true" />
              {approveLabel}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** Telefon durum çubuğu: kapak üzerinde de beyaz zeminde de okunur (mix-blend). */
function PhoneStatusBar() {
  return (
    <div
      dir="ltr"
      className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between px-[2.4em] pt-[1.1em] text-[1em] font-semibold text-white mix-blend-difference"
    >
      <span>9:41</span>
      <span className="flex items-center gap-[0.5em]">
        <span className="flex items-end gap-[0.14em]">
          {[0.45, 0.65, 0.85, 1].map((h) => (
            <span
              key={h}
              className="block w-[0.28em] rounded-[0.05em] bg-current"
              style={{ height: `${h * 0.95}em` }}
            />
          ))}
        </span>
        <span className="relative block h-[0.9em] w-[1.8em] rounded-[0.28em] border border-current p-[0.1em]">
          <span className="block h-full w-[78%] rounded-[0.14em] bg-current" />
        </span>
      </span>
    </div>
  );
}

function Screen(props: ScreenProps) {
  return (
    <div
      className="relative h-full w-full"
      style={{ fontSize: `calc(100cqw / ${DESIGN_WIDTH_EM[props.format]})` }}
    >
      {props.format === "mobile" ? <PhoneStatusBar /> : null}
      {/* key: sekme değişince içerik yumuşakça yeniden belirir */}
      <div key={props.index} className="landing-swap h-full w-full">
        <ScreenBody {...props} />
      </div>
    </div>
  );
}

export function LandingShowcase({
  copy,
  scene,
  approveLabel,
  demoHref,
  demoLabel,
  demoNote,
}: LandingShowcaseProps) {
  const [format, setFormat] = useState<Format>("desktop");
  const [active, setActive] = useState(0);
  const baseId = useId();

  const activeTab = copy.tabs[active] ?? copy.tabs[0];
  const screenProps: ScreenProps = {
    index: active,
    format,
    tab: activeTab,
    coverTitle: scene.coverTitle,
    patientName: scene.patientName,
    approveLabel,
  };

  return (
    <section
      id="showcase"
      aria-labelledby={`${baseId}-title`}
      className="bg-white py-20 md:py-28"
    >
      <div className="landing-reveal mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading heading={copy.heading} id={`${baseId}-title`} />

        <div className="mt-12 grid items-center gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Cihaz alanı */}
          <div className="lg:col-span-8">
            <div className="flex justify-center">
              <div
                role="group"
                aria-label={copy.formatsAriaLabel}
                className="inline-flex rounded-full bg-slate-100 p-1"
              >
                {FORMAT_ORDER.map((id) => {
                  const Icon = FORMAT_ICONS[id];
                  const selected = id === format;
                  return (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setFormat(id)}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                        selected
                          ? "bg-[#1d1d1f] text-white shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      <Icon aria-hidden="true" className="h-3.5 w-3.5" />
                      {copy.formats[id]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              role="tabpanel"
              aria-labelledby={`${baseId}-tab-${active}`}
              className="relative mt-8 flex min-h-[340px] items-center justify-center sm:min-h-[560px]"
            >
              <div
                key={format}
                className="landing-swap flex w-full items-center justify-center"
              >
              {format === "desktop" ? (
                <LaptopFrame className="w-full max-w-[680px]">
                  <Screen {...screenProps} />
                </LaptopFrame>
              ) : null}
              {format === "mobile" ? (
                <PhoneFrame className="w-[210px] sm:w-[255px]">
                  <Screen {...screenProps} />
                </PhoneFrame>
              ) : null}
              {format === "pdf" ? (
                <PaperFrame className="w-[250px] ring-slate-200 sm:w-[310px] [filter:drop-shadow(0_24px_34px_rgba(30,41,90,0.18))]">
                  <Screen {...screenProps} />
                </PaperFrame>
              ) : null}
              </div>
            </div>
          </div>

          {/* Bölüm listesi */}
          <div
            role="tablist"
            aria-orientation="vertical"
            aria-label={copy.tabsAriaLabel}
            className="grid gap-1 lg:col-span-4"
          >
            {copy.tabs.map((tab, index) => {
              const selected = index === active;
              return (
                <button
                  key={tab.title}
                  type="button"
                  role="tab"
                  id={`${baseId}-tab-${index}`}
                  aria-selected={selected}
                  onClick={() => setActive(index)}
                  className={`group grid grid-cols-[auto_1fr] items-baseline gap-x-4 border-b py-3.5 text-start transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                    selected
                      ? "border-blue-600 text-[#1d1d1f]"
                      : "border-slate-200 text-slate-400 hover:text-slate-700"
                  }`}
                >
                  <span
                    dir="ltr"
                    className={`text-[11px] font-semibold tabular-nums ${
                      selected ? "text-blue-600" : "text-slate-400"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[15px] font-semibold tracking-tight">
                    {tab.title}
                  </span>
                  <span
                    className={`col-start-2 grid text-[13px] leading-snug font-normal text-slate-500 transition-[grid-template-rows,opacity,margin] duration-500 ease-out ${
                      selected ? "mt-1.5 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <span className="overflow-hidden">{tab.description}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center text-center">
          <PillLink href={demoHref}>{demoLabel}</PillLink>
          <p className="mt-3 text-xs text-slate-500">{demoNote}</p>
        </div>
      </div>
    </section>
  );
}
