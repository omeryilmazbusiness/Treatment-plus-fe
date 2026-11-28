"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Building2,
  Check,
  ChevronRight,
  Palette as PaletteIcon,
  Stethoscope,
  Tags,
  type LucideIcon,
} from "lucide-react";

import type { ClinicSettings, Locale } from "@/modules/clinic/domain/clinic";
import {
  buildSetupOverview,
  initialStep,
  isStepLocked,
  neighborStep,
  needsSetup,
  SETUP_STEPS,
  type SetupOverview,
  type SetupStepKey,
} from "@/modules/clinic/domain/setup";
import { Mark } from "@/ui/mark";

import { deferSetupAction, type SetupCatalog } from "./actions";
import { AppIcon, GlassGroup, PillButton, StepHero } from "./setup-glass";
import {
  ClinicStep,
  DoctorStep,
  PricesStep,
  PrefsStep,
  Segmented,
} from "./steps";

const STEP_META: Record<SetupStepKey, { icon: LucideIcon; label: string }> = {
  clinic: { icon: Building2, label: "Klinik" },
  doctor: { icon: Stethoscope, label: "Hekim" },
  prefs: { icon: PaletteIcon, label: "Tercihler" },
  prices: { icon: Tags, label: "Fiyatlar" },
};

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="setup-night relative isolate min-h-dvh text-white">
      <div aria-hidden className="setup-aurora fixed inset-0 -z-10" />
      {children}
    </div>
  );
}

export function SetupScreen({
  settings: initialSettings,
  catalog: initialCatalog,
}: {
  settings: ClinicSettings;
  catalog: SetupCatalog;
}) {
  const initialOverview = buildSetupOverview(initialSettings, {
    treatmentCount: initialCatalog.treatments.length,
    prefsConfirmed: !needsSetup(initialSettings, initialCatalog.treatments.length),
  });
  const [intro, setIntro] = useState(!initialOverview.completed);
  const [locale, setLocale] = useState<Locale>(initialSettings.locale);

  return (
    <Frame>
      {intro ? (
        <Intro
          clinicName={initialSettings.name}
          locale={locale}
          onLocale={setLocale}
          onDone={() => {
            window.scrollTo({ top: 0 });
            setIntro(false);
          }}
        />
      ) : (
        <div className="animate-setup-stage-in">
          <Flow
            initialSettings={initialSettings}
            initialCatalog={initialCatalog}
            locale={locale}
          />
        </div>
      )}
    </Frame>
  );
}

/* ── Karşılama ────────────────────────────────────────────────────────── */

function Intro({
  clinicName,
  locale,
  onLocale,
  onDone,
}: {
  clinicName: string;
  locale: Locale;
  onLocale: (l: Locale) => void;
  onDone: () => void;
}) {
  const [leaving, setLeaving] = useState(false);

  function proceed() {
    if (leaving) return;
    setLeaving(true);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(onDone, still ? 0 : 420);
  }

  return (
    <div
      data-testid="setup-intro"
      className={cx(
        "mx-auto flex min-h-dvh max-w-3xl flex-col items-center justify-center px-6 py-16 text-center transition duration-[420ms] ease-out",
        leaving ? "pointer-events-none scale-[1.04] opacity-0 blur-md" : "animate-setup-card-in"
      )}
    >
      <span className="setup-glass mb-8 inline-flex size-16 items-center justify-center rounded-[20px]">
        <Mark light className="size-9" />
      </span>
      <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/55 sm:text-[13px]">
        Treatment Plus
      </p>
      <h1 className="setup-title mt-3 text-balance text-[44px] font-semibold leading-[1.08] tracking-[-0.045em] sm:text-6xl">
        {clinicName ? `Hoş geldiniz, ${clinicName}` : "Hoş geldiniz"}
      </h1>
      <p className="mx-auto mt-5 max-w-xl text-pretty text-[15px] leading-relaxed text-white/60 sm:text-[17px]">
        Kliniğinizi birkaç adımda kuralım: klinik kimliği, hekim bilgisi, tercihler ve fiyat
        listesi. Yaklaşık iki dakika sürer.
      </p>

      <div className="mt-10 w-full max-w-md space-y-2 text-left">
        <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-white/50">
          Rapor dili
        </p>
        <Segmented
          label="Rapor dili"
          testId="setup-lang"
          value={locale}
          onChange={onLocale}
          options={[
            { value: "tr" as Locale, label: "Türkçe" },
            { value: "en" as Locale, label: "English" },
            { value: "ar" as Locale, label: "Arabic" },
            { value: "ru" as Locale, label: "Russia" },
          ]}
        />
      </div>

      <button
        type="button"
        onClick={proceed}
        disabled={leaving}
        data-testid="setup-continue"
        className="group relative mt-12 flex h-14 min-w-[220px] cursor-pointer items-center justify-center gap-2.5 overflow-hidden rounded-full border border-white/20 bg-white/[0.12] px-8 text-[17px] font-semibold tracking-[-0.01em] text-white backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_24px_48px_-24px_rgba(56,189,248,0.55)] transition duration-200 hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/[0.18] active:scale-95 disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816]"
      >
        Kuruluma Başla
        <ArrowRight
          className="h-[18px] w-[18px] transition-transform duration-300 group-hover:translate-x-0.5"
          strokeWidth={2.2}
          aria-hidden
        />
      </button>
    </div>
  );
}

/* ── Adım dock'u ──────────────────────────────────────────────────────── */

function StepDock({
  overview,
  active,
  onSelect,
}: {
  overview: SetupOverview;
  active: SetupStepKey | null;
  onSelect: (key: SetupStepKey) => void;
}) {
  const settled = overview.steps.filter((s) => s.status === "done").length;
  const fill =
    overview.steps.length > 1
      ? Math.min(settled, overview.steps.length - 1) / (overview.steps.length - 1)
      : 0;

  return (
    <nav aria-label="Kurulum adımları" className="relative mx-auto w-full max-w-[520px]">
      <div
        aria-hidden
        className="absolute inset-x-[12.5%] top-[22px] h-[2px] overflow-hidden rounded-full bg-white/[0.12]"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-300 via-white to-violet-200 transition-[width] duration-700 ease-out"
          style={{ width: `${fill * 100}%` }}
        />
      </div>
      <ol className="relative grid grid-cols-4">
        {overview.steps.map((step, i) => {
          const meta = STEP_META[step.key];
          const Icon = meta.icon;
          const isActive = step.key === active;
          const disabled = isStepLocked(overview, step.key);
          return (
            <li key={step.key} className="flex justify-center">
              <button
                type="button"
                onClick={() => onSelect(step.key)}
                disabled={disabled}
                aria-current={isActive ? "step" : undefined}
                data-testid={`setup-dock-${step.key}`}
                className="group flex cursor-pointer flex-col items-center gap-2 transition active:scale-95 disabled:cursor-not-allowed"
              >
                <span
                  className={cx(
                    "relative flex h-11 w-11 items-center justify-center rounded-full transition duration-300",
                    step.status === "done"
                      ? "bg-white text-zinc-950 shadow-[0_8px_18px_-10px_rgba(15,23,42,0.8)]"
                      : "bg-[#151a31] text-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_0_0_0.5px_rgba(255,255,255,0.16)]",
                    isActive && "ring-[3px] ring-sky-300/55 ring-offset-0"
                  )}
                >
                  {step.status === "done" ? (
                    <Check className="h-[18px] w-[18px]" strokeWidth={2.5} />
                  ) : (
                    <Icon
                      className={cx("h-[18px] w-[18px]", isActive && "text-white")}
                      strokeWidth={1.9}
                    />
                  )}
                </span>
                <span className="flex flex-col items-center leading-tight">
                  <span className="text-[10px] font-medium tabular-nums text-white/40">
                    {i + 1}
                  </span>
                  <span
                    className={cx(
                      "text-[12px] font-semibold tracking-[-0.01em] transition-colors duration-300",
                      isActive ? "text-white" : "text-white/55"
                    )}
                  >
                    {meta.label}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* ── Akış ─────────────────────────────────────────────────────────────── */

function Flow({
  initialSettings,
  initialCatalog,
  locale,
}: {
  initialSettings: ClinicSettings;
  initialCatalog: SetupCatalog;
  locale: Locale;
}) {
  const [settings, setSettings] = useState(initialSettings);
  const [catalog, setCatalog] = useState(initialCatalog);
  const [prefsConfirmed, setPrefsConfirmed] = useState(
    !needsSetup(initialSettings, initialCatalog.treatments.length)
  );
  const [leaving, setLeaving] = useState(false);

  const overview = useMemo(
    () =>
      buildSetupOverview(settings, {
        treatmentCount: catalog.treatments.length,
        prefsConfirmed,
      }),
    [settings, catalog.treatments.length, prefsConfirmed]
  );

  // Katalog hiç yoksa klinik yeni kurulmuş demektir: bilgileri baştan gözden geçirtelim.
  const [step, setStep] = useState<SetupStepKey | null>(() =>
    initialCatalog.treatments.length === 0 ? SETUP_STEPS[0] : initialStep(overview)
  );

  const back = step ? neighborStep(overview, step, -1) : null;
  const goBack = back ? () => setStep(back) : null;
  const position = step ? SETUP_STEPS.indexOf(step) + 1 : SETUP_STEPS.length;

  function advance(from: SetupStepKey) {
    setStep(neighborStep(overview, from, 1));
  }

  async function later() {
    setLeaving(true);
    if (!overview.completed) await deferSetupAction();
    // Tam yükleme: istemci yönlendirme önbelleği /app'in eski "/setup'a git" yanıtını tutabilir.
    window.location.replace("/app");
  }

  return (
    <>
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 pt-5 sm:px-8 sm:pt-7">
        <span className="inline-flex items-center gap-2.5 text-[14px] font-semibold tracking-tight text-white/90">
          <Mark light className="size-6" />
          Treatment+
        </span>
        <PillButton
          variant="glass"
          className="h-10 px-4 text-[13px]"
          onClick={() => void later()}
          disabled={leaving}
          data-testid="setup-later"
        >
          {overview.completed ? "Panele Git" : "Daha Sonra"}
        </PillButton>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col items-center px-5 pb-16 pt-8 sm:px-8 sm:pt-10">
        <div className="mb-8 space-y-2 text-center">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-white/55">
            {step ? `Adım ${position} / ${overview.totalSteps}` : "Kurulum tamamlandı"}
          </p>
          <h1 className="setup-title text-[34px] font-semibold leading-[1.15] tracking-[-0.035em] sm:text-[44px]">
            Klinik Kurulumu
          </h1>
        </div>

        <StepDock overview={overview} active={step} onSelect={setStep} />

        <section
          key={step ?? "done"}
          className="setup-glass animate-setup-card-in mt-10 w-full max-w-[600px] rounded-[32px] p-5 sm:p-8"
          data-testid={`setup-card-${step ?? "done"}`}
        >
          {step === "clinic" ? (
            <ClinicStep
              settings={settings}
              locale={locale}
              onBack={goBack}
              onSaved={(next) => {
                setSettings(next);
                advance("clinic");
              }}
            />
          ) : step === "doctor" ? (
            <DoctorStep
              settings={settings}
              onBack={goBack}
              onSaved={(next) => {
                setSettings(next);
                advance("doctor");
              }}
            />
          ) : step === "prefs" ? (
            <PrefsStep
              settings={settings}
              onBack={goBack}
              onSaved={(next) => {
                setSettings(next);
                setPrefsConfirmed(true);
                advance("prefs");
              }}
            />
          ) : step === "prices" ? (
            <PricesStep
              catalog={catalog}
              currency={settings.currency}
              onBack={goBack}
              onCatalog={setCatalog}
              onDone={(next) => {
                setCatalog(next);
                setPrefsConfirmed(true);
                setStep(null);
              }}
            />
          ) : (
            <Done overview={overview} onEdit={setStep} onFinish={() => void later()} />
          )}
        </section>
      </main>
    </>
  );
}

/* ── Özet ─────────────────────────────────────────────────────────────── */

function Done({
  overview,
  onEdit,
  onFinish,
}: {
  overview: SetupOverview;
  onEdit: (step: SetupStepKey) => void;
  onFinish: () => void;
}) {
  return (
    <div className="space-y-6">
      <StepHero
        icon={Check}
        tint="done"
        title="Kliniğiniz hazır"
        subtitle="Artık hasta ekleyip tedavi planı hazırlayabilirsiniz. Ayarları istediğiniz zaman değiştirebilirsiniz."
      />
      <GlassGroup title="Özet">
        {overview.steps.map((step) => {
          const meta = STEP_META[step.key];
          return (
            <button
              key={step.key}
              type="button"
              onClick={() => onEdit(step.key)}
              data-testid={`setup-summary-${step.key}`}
              className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-start transition-colors hover:bg-white/[0.08]"
            >
              <AppIcon icon={meta.icon} tint={step.key} size="sm" />
              <span className="min-w-0 flex-1 text-[14px] font-semibold text-white">
                {meta.label}
              </span>
              <span
                className={cx(
                  "text-[12px] font-medium",
                  step.status === "done" ? "text-emerald-300" : "text-white/40"
                )}
              >
                {step.status === "done" ? "Tamam" : "Bekliyor"}
              </span>
              <ChevronRight className="h-4 w-4 text-white/30" />
            </button>
          );
        })}
      </GlassGroup>
      <PillButton className="w-full" onClick={onFinish} data-testid="setup-go-dashboard">
        Panele Git
      </PillButton>
    </div>
  );
}
