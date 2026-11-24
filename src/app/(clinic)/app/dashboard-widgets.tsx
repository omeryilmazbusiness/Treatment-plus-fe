"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Crown,
  Infinity as InfinityIcon,
  Plus,
  Sparkles,
} from "lucide-react";

import {
  EXTRA_PDF_PACKS,
  intervalLabel,
  isProfessionalTier,
  statusLabel,
  tierLabel,
  usageOf,
  type Subscription,
  type UpgradeOffer,
  type UsageLevel,
} from "@/modules/subscription/domain/subscription";

import { requestExtraPdfPackAction, requestUpgradeAction } from "./actions";

function formatMinor(minor: number, currency: string): string {
  try {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency,
      minimumFractionDigits: minor % 100 === 0 ? 0 : 2,
    }).format(minor / 100);
  } catch {
    return `${(minor / 100).toFixed(2)} ${currency}`;
  }
}

/* ------------------------------------------------------------------ */
/* Kurulum ilerlemesi                                                  */
/* ------------------------------------------------------------------ */

export function SetupProgressChip({
  percent,
  doneCount,
  totalSteps,
}: {
  percent: number;
  doneCount: number;
  totalSteps: number;
}) {
  // Tamamlanmış kurulumu göstermiyoruz; yalnızca eksik adımlar kaldığında görünür.
  if (percent >= 100) return null;

  const radius = 11;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percent));
  const offset = circumference * (1 - clamped / 100);

  return (
    <Link
      href="/setup"
      data-testid="setup-progress"
      data-percent={percent}
      title="Kuruluma devam et"
      aria-label={`Kurulum yüzde ${percent} tamamlandı. Kuruluma devam et`}
      className="tp-btn group inline-flex h-11 items-center gap-2.5 rounded-2xl bg-white/90 px-3.5 shadow-[0_10px_28px_-16px_rgba(15,23,42,0.28)] ring-1 ring-slate-900/[0.04] backdrop-blur hover:shadow-[0_14px_32px_-14px_rgba(79,70,229,0.28)]"
    >
      <span className="relative flex size-8 shrink-0 items-center justify-center">
        <svg viewBox="0 0 28 28" className="size-8 -rotate-90" aria-hidden="true">
          <circle cx="14" cy="14" r={radius} fill="none" strokeWidth="3" className="stroke-slate-100" />
          <circle
            cx="14"
            cy="14"
            r={radius}
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="stroke-indigo-500 transition-[stroke-dashoffset] duration-700"
          />
        </svg>
      </span>
      <span className="flex flex-col items-start leading-tight">
        <span className="text-sm font-bold tabular-nums text-[#0b1f4d]">Kurulum %{percent}</span>
        <span className="text-[11px] font-medium text-slate-400">
          {doneCount}/{totalSteps} · Devam et
        </span>
      </span>
      <ArrowRight
        className="size-4 text-indigo-400 transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 group-hover:text-indigo-500"
        strokeWidth={2.2}
      />
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Planlarım                                                           */
/* ------------------------------------------------------------------ */

const LEVEL_BAR: Record<UsageLevel, string> = {
  ok: "from-indigo-400 to-violet-400",
  warn: "from-amber-300 to-orange-400",
  full: "from-rose-400 to-red-400",
};

const STATUS_DOT: Record<string, string> = {
  active: "bg-emerald-400",
  trialing: "bg-sky-400",
  past_due: "bg-amber-400",
  paused: "bg-slate-400",
  canceled: "bg-rose-400",
};

/** Communication: soft beyaz. */
const SOFT_SURFACE =
  "relative overflow-hidden rounded-[1.5rem] bg-white p-4 shadow-[0_14px_34px_-18px_rgba(15,23,42,0.28)]";

/**
 * Professional: su yeşili · turkuaz · açık mavi · beyaz.
 * İkon ve sayı büyük; küçük açıklama metni yok.
 */
const PRO_SURFACE =
  "relative overflow-hidden rounded-[1.5rem] bg-[linear-gradient(135deg,#ecfeff_0%,#ccfbf1_38%,#a5f3fc_72%,#e0f2fe_100%)] p-4 text-teal-950 shadow-[0_20px_40px_-20px_rgba(13,148,136,0.55)]";

function ExtraPdfPacks({ pro }: { pro: boolean }) {
  const [selected, setSelected] = useState<number>(EXTRA_PDF_PACKS[0]?.pdfs ?? 0);
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<"idle" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  const submit = () => {
    setMessage("");
    startTransition(async () => {
      const res = await requestExtraPdfPackAction(selected);
      if (res.unauthenticated) {
        window.location.replace("/login");
        return;
      }
      if (!res.success) {
        setState("error");
        setMessage(res.error ?? "Talep gönderilemedi.");
        return;
      }
      setState("sent");
    });
  };

  const accent = pro ? "text-teal-600" : "text-indigo-500";
  const ring = pro
    ? "bg-teal-500/10 shadow-[inset_0_0_0_1.5px_rgba(20,184,166,0.75)]"
    : "bg-indigo-500/10 shadow-[inset_0_0_0_1.5px_rgba(99,102,241,0.55)]";

  return (
    <div
      data-testid="extra-pdf"
      className={`relative mt-3 rounded-2xl p-2 ${pro ? "bg-white/90 shadow-sm shadow-teal-900/5" : "bg-slate-50"}`}
    >
      {state === "sent" ? (
        <p
          role="status"
          data-testid="extra-pdf-sent"
          className="flex items-center gap-1.5 px-1 py-1.5 text-sm font-semibold text-emerald-700"
        >
          <Check className="size-4 shrink-0" strokeWidth={2.6} />
          Talebiniz alındı.
        </p>
      ) : (
        <>
          <div className="flex items-stretch gap-2">
            <div role="radiogroup" aria-label="Ek PDF paketi" className="grid flex-1 grid-cols-2 gap-1.5">
              {EXTRA_PDF_PACKS.map((pack) => {
                const active = pack.pdfs === selected;
                return (
                  <button
                    key={pack.pdfs}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    data-testid={`extra-pack-${pack.pdfs}`}
                    onClick={() => {
                      setSelected(pack.pdfs);
                      setState("idle");
                    }}
                    className={`tp-tab cursor-pointer rounded-xl px-2.5 py-2 text-left ${
                      active ? ring : "bg-white hover:bg-slate-50"
                    }`}
                  >
                    <span className="flex items-center gap-0.5 text-sm font-bold leading-none text-[#0b1f4d]">
                      <Plus className={`size-3.5 ${accent}`} strokeWidth={2.8} />
                      {pack.pdfs}
                    </span>
                    <span className="mt-1 block text-xs font-semibold tabular-nums leading-none text-slate-500">
                      {formatMinor(pack.priceMinor, pack.currency)}
                    </span>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={submit}
              disabled={pending}
              data-testid="extra-pdf-cta"
              aria-label="Ek PDF paketi talep et"
              className={`tp-btn shrink-0 cursor-pointer rounded-xl px-3.5 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-70 ${
                pro
                  ? "tp-btn-primary bg-gradient-to-br from-teal-500 to-cyan-500 shadow-md shadow-teal-500/30"
                  : "bg-[#0b1f4d] hover:bg-[#13306e]"
              }`}
            >
              {pending ? "…" : "Talep et"}
            </button>
          </div>
          {state === "error" && (
            <p role="alert" className="mt-1.5 text-xs font-medium text-rose-600">
              {message}
            </p>
          )}
        </>
      )}
    </div>
  );
}

function UpgradeBlock({ offer }: { offer: UpgradeOffer }) {
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<"idle" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  const { target, discountedMinor, discountPercent } = offer;
  const period = target.interval === "year" ? "yıl" : "ay";

  const submit = () => {
    setMessage("");
    startTransition(async () => {
      const res = await requestUpgradeAction();
      if (res.unauthenticated) {
        window.location.replace("/login");
        return;
      }
      if (!res.success) {
        setState("error");
        setMessage(res.error ?? "Talep gönderilemedi.");
        return;
      }
      setState("sent");
    });
  };

  return (
    <div
      data-testid="upgrade-card"
      className="relative overflow-hidden rounded-[1.5rem] bg-[linear-gradient(135deg,#ecfeff_0%,#ccfbf1_50%,#e0f2fe_100%)] p-4 shadow-[0_14px_34px_-18px_rgba(13,148,136,0.5)]"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-white/80 blur-2xl" />
      <div className="relative flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white text-teal-600 shadow-sm">
            <Crown className="size-5" strokeWidth={2} />
          </span>
          <p className="truncate text-lg font-bold leading-tight tracking-tight text-teal-950">
            {tierLabel(target.tier)}
          </p>
        </div>
        <span
          data-testid="upgrade-offer-badge"
          className="shrink-0 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-2.5 py-1 text-[11px] font-extrabold tracking-wide text-white shadow-sm"
        >
          %{discountPercent}
        </span>
      </div>

      {state === "sent" ? (
        <div
          data-testid="upgrade-sent"
          role="status"
          className="relative mt-3 flex items-center gap-2 rounded-xl bg-white/85 px-3 py-2 text-sm font-semibold text-emerald-700"
        >
          <Check className="size-4 shrink-0" strokeWidth={2.6} />
          Talebiniz alındı.
        </div>
      ) : (
        <div className="relative mt-3 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-baseline gap-1.5">
            <span
              data-testid="upgrade-price"
              className="text-3xl font-extrabold tracking-tight tabular-nums text-teal-950"
            >
              {formatMinor(discountedMinor, target.currency)}
            </span>
            <span className="text-sm tabular-nums text-teal-900/45 line-through">
              {formatMinor(target.priceMinor, target.currency)}
            </span>
            <span className="text-xs text-teal-900/55">/ {period}</span>
          </div>
          <button
            type="button"
            onClick={submit}
            disabled={pending}
            data-testid="upgrade-cta"
            className="tp-btn tp-btn-primary inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 px-4 text-sm font-semibold text-white shadow-lg shadow-teal-500/30 disabled:cursor-wait disabled:opacity-70"
          >
            {pending ? "…" : "Yükselt"}
            {!pending && <ArrowRight className="size-4" strokeWidth={2.4} />}
          </button>
        </div>
      )}
      {state === "error" && (
        <p role="alert" className="relative mt-1.5 text-xs font-medium text-rose-600">
          {message}
        </p>
      )}
    </div>
  );
}

export function PlansCard({
  subscription,
  upgradeOffer,
}: {
  subscription: Subscription | null;
  upgradeOffer: UpgradeOffer | null;
}) {
  if (!subscription) {
    return (
      <section data-testid="plans-card" aria-label="Planlarım" className={`mt-3 shrink-0 ${SOFT_SURFACE}`}>
        <h3 className="text-sm font-semibold text-[#0b1f4d]">Planlarım</h3>
        <p className="mt-1.5 text-sm text-slate-400">Paket bilgisi şu anda alınamadı.</p>
      </section>
    );
  }

  const usage = usageOf(subscription);
  const pro = isProfessionalTier(subscription.tier);
  const fill = usage.unlimited ? 100 : Math.max(usage.ratio * 100, usage.used > 0 ? 4 : 0);
  const strong = pro ? "text-teal-950" : "text-[#0b1f4d]";

  return (
    <section data-testid="plans-card" aria-label="Planlarım" className="mt-3 shrink-0 space-y-3">
      <div className={pro ? PRO_SURFACE : SOFT_SURFACE} data-theme={pro ? "pro" : "soft"}>
        {pro && (
          <>
            <div className="pointer-events-none absolute -left-10 -top-12 size-44 rounded-full bg-white/80 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 left-4 size-48 rounded-full bg-teal-300/50 blur-3xl" />
            <div className="pointer-events-none absolute -right-12 top-0 size-40 rounded-full bg-sky-200/70 blur-3xl" />
          </>
        )}

        <div className="relative flex items-center gap-3.5">
          <span
            className={`flex size-16 shrink-0 items-center justify-center rounded-[1.15rem] shadow-lg ${
              pro
                ? "bg-white text-teal-600 shadow-teal-500/25"
                : "bg-gradient-to-br from-sky-400 to-indigo-400 text-white shadow-sky-400/30"
            }`}
          >
            {pro ? (
              <Sparkles className="size-8" strokeWidth={2.1} />
            ) : (
              <Crown className="size-8" strokeWidth={1.9} />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p
              data-testid="plan-name"
              className={`truncate text-[1.65rem] font-black leading-none tracking-tight ${strong}`}
            >
              {tierLabel(subscription.tier)}
            </p>
            <span
              data-testid="plan-status"
              className={`mt-2 inline-flex items-center gap-1.5 text-sm font-bold ${
                pro ? "text-teal-800" : "text-emerald-700"
              }`}
            >
              <span
                className={`size-2 rounded-full ${
                  STATUS_DOT[subscription.status] ?? STATUS_DOT.active
                }`}
              />
              {statusLabel(subscription.status)}
            </span>
          </div>
        </div>

        <div className="relative mt-4 flex items-end justify-between gap-3">
          <span
            data-testid="plan-remaining"
            className={`text-[4.25rem] font-black leading-none tracking-tighter tabular-nums ${strong}`}
            title="Kalan PDF hakkı"
          >
            {usage.unlimited ? (
              <>
                <InfinityIcon className="inline size-16" strokeWidth={2.4} />
                <span className="sr-only">Sınırsız</span>
              </>
            ) : (
              usage.remaining
            )}
          </span>
          <span
            data-testid="plan-usage"
            className={`pb-1.5 text-2xl font-extrabold tabular-nums ${strong}`}
            title="Kullanılan / kota"
          >
            {usage.unlimited ? usage.used : `${usage.used}/${usage.quota}`}
          </span>
        </div>

        <div
          role="progressbar"
          aria-label="Aylık PDF hakkı kullanımı"
          aria-valuemin={0}
          aria-valuemax={usage.unlimited ? undefined : usage.quota}
          aria-valuenow={usage.used}
          className={`relative mt-3 h-2.5 overflow-hidden rounded-full ${
            pro ? "bg-white/70" : "bg-slate-100"
          }`}
        >
          <div
            className={`h-full rounded-full ${
              pro
                ? "bg-gradient-to-r from-teal-500 via-cyan-400 to-sky-400 shadow-[0_0_12px_rgba(20,184,166,0.45)]"
                : `bg-gradient-to-r ${usage.unlimited ? "from-emerald-300 to-teal-400" : LEVEL_BAR[usage.level]}`
            }`}
            style={{ width: `${fill}%` }}
          />
        </div>

        {/* E2E / a11y için gizli meta */}
        <span data-testid="plan-days" className="sr-only">
          {Math.max(0, subscription.usageDaysRemaining)} gün
        </span>
        <span data-testid="plan-end" className="sr-only">
          {subscription.periodEnd}
        </span>
        <span className="sr-only">
          {intervalLabel(subscription.interval)} ·{" "}
          {formatMinor(subscription.priceMinor, subscription.currency)}
        </span>

        {usage.level === "full" && (
          <p role="alert" className="relative mt-2 text-sm font-bold text-rose-600">
            PDF hakkınız doldu.
          </p>
        )}

        <ExtraPdfPacks pro={pro} />
      </div>

      {!pro && upgradeOffer && <UpgradeBlock offer={upgradeOffer} />}
    </section>
  );
}
