"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Crown,
  Infinity as InfinityIcon,
  Plus,
} from "lucide-react";

import {
  EXTRA_PDF_PACKS,
  extraPackPriceMinor,
  intervalLabel,
  isProfessionalTier,
  statusLabel,
  tierLabel,
  tierPdfAllowanceLabel,
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
      className="tp-btn group inline-flex h-11 items-center gap-2.5 rounded-2xl bg-white/90 px-3.5 shadow-[0_10px_28px_-16px_rgba(15,23,42,0.28)] ring-1 ring-slate-900/[0.04] backdrop-blur hover:shadow-[0_14px_32px_-14px_rgba(11,31,77,0.18)]"
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
            className="stroke-[#0b1f4d] transition-[stroke-dashoffset] duration-700"
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
        className="size-4 text-slate-400 transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 group-hover:text-[#0b1f4d]"
        strokeWidth={2.2}
      />
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Planlarım                                                           */
/* ------------------------------------------------------------------ */

const LEVEL_BAR: Record<UsageLevel, string> = {
  ok: "from-[#0b1f4d] to-[#3b82f6]",
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
  "relative overflow-hidden rounded-[1.5rem] bg-white p-4 shadow-[0_10px_28px_-18px_rgba(15,23,42,0.2)] ring-1 ring-slate-900/[0.04]";

/** Professional: gold + shine. */
const PRO_SURFACE =
  "tp-gold-card relative overflow-hidden rounded-[1.5rem] p-4 text-[#6b4e12]";

function ExtraPdfPacks({ pro }: { pro: boolean }) {
  const [pendingPdf, setPendingPdf] = useState<number | null>(null);
  const [sentPdf, setSentPdf] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const buy = (pdfs: number) => {
    setError("");
    setPendingPdf(pdfs);
    startTransition(async () => {
      const res = await requestExtraPdfPackAction(pdfs);
      setPendingPdf(null);
      if (res.unauthenticated) {
        window.location.replace("/login");
        return;
      }
      if (!res.success) {
        setError(res.error ?? "Talep gönderilemedi.");
        return;
      }
      setSentPdf(pdfs);
    });
  };

  if (pro) {
    return (
      <div data-testid="extra-pdf" className="relative mt-3.5">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8a6a28]/80">
          Hemen ek paket al
        </p>
        {sentPdf !== null ? (
          <p
            role="status"
            data-testid="extra-pdf-sent"
            className="mt-2 flex items-center gap-1.5 rounded-xl bg-white/75 px-3 py-2.5 text-sm font-semibold text-emerald-700"
          >
            <Check className="size-4 shrink-0" strokeWidth={2.6} />
            +{sentPdf} PDF talebiniz alındı.
          </p>
        ) : (
          <div className="mt-2 grid grid-cols-2 gap-2">
            {EXTRA_PDF_PACKS.map((pack) => {
              const price = extraPackPriceMinor(pack);
              const loading = pending && pendingPdf === pack.pdfs;
              return (
                <button
                  key={pack.pdfs}
                  type="button"
                  data-testid={`extra-pack-${pack.pdfs}`}
                  disabled={pending}
                  onClick={() => buy(pack.pdfs)}
                  className="tp-btn group relative flex cursor-pointer flex-col items-start overflow-hidden rounded-2xl bg-white/80 px-3 py-2.5 text-left shadow-[0_10px_28px_-14px_rgba(212,175,55,0.4)] ring-1 ring-white/70 backdrop-blur-sm disabled:cursor-wait disabled:opacity-70"
                >
                  <span
                    data-testid={`extra-discount-${pack.pdfs}`}
                    className="absolute right-2 top-2 rounded-full bg-gradient-to-r from-[#f0c56a] to-[#ffe19a] px-2 py-0.5 text-[10px] font-extrabold tracking-wide text-[#6b4e12] shadow-sm ring-1 ring-white/70"
                  >
                    %{pack.discountPercent}
                  </span>
                  <span className="flex items-center gap-1 text-[15px] font-black leading-none text-[#6b4e12]">
                    <Plus className="size-3.5 text-[#c9a227]" strokeWidth={2.8} />
                    {pack.pdfs} PDF
                  </span>
                  <span className="mt-2 flex items-baseline gap-1.5">
                    <span
                      data-testid={`extra-price-${pack.pdfs}`}
                      className="text-base font-extrabold tabular-nums text-[#6b4e12]"
                    >
                      {formatMinor(price, pack.currency)}
                    </span>
                    <span className="text-[11px] tabular-nums text-[#8a6a28]/50 line-through">
                      {formatMinor(pack.listPriceMinor, pack.currency)}
                    </span>
                  </span>
                  <span className="mt-2 text-[11px] font-bold text-[#a07820]">
                    {loading ? "Gönderiliyor…" : "Satın al"}
                  </span>
                </button>
              );
            })}
          </div>
        )}
        {error && (
          <p role="alert" className="mt-1.5 text-xs font-medium text-rose-700">
            {error}
          </p>
        )}
        {/* E2E uyumu: gizli tek CTA yok; paket butonları doğrudan talep eder */}
        <button type="button" data-testid="extra-pdf-cta" className="sr-only" tabIndex={-1} aria-hidden>
          Talep et
        </button>
      </div>
    );
  }

  // Communication: sade lacivert varyant
  return (
    <div data-testid="extra-pdf" className="relative mt-3 rounded-2xl bg-slate-50 p-2.5">
      <p className="px-0.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500">
        Hemen ek paket al
      </p>
      {sentPdf !== null ? (
        <p
          role="status"
          data-testid="extra-pdf-sent"
          className="mt-2 flex items-center gap-1.5 px-1 py-1.5 text-sm font-semibold text-emerald-700"
        >
          <Check className="size-4 shrink-0" strokeWidth={2.6} />
          +{sentPdf} PDF talebiniz alındı.
        </p>
      ) : (
        <div className="mt-2 grid grid-cols-2 gap-2">
          {EXTRA_PDF_PACKS.map((pack) => {
            const price = extraPackPriceMinor(pack);
            const loading = pending && pendingPdf === pack.pdfs;
            return (
              <button
                key={pack.pdfs}
                type="button"
                data-testid={`extra-pack-${pack.pdfs}`}
                disabled={pending}
                onClick={() => buy(pack.pdfs)}
                className="tp-btn relative flex cursor-pointer flex-col items-start rounded-xl bg-white px-3 py-2 text-left ring-1 ring-slate-900/[0.06] disabled:cursor-wait disabled:opacity-70"
              >
                <span
                  data-testid={`extra-discount-${pack.pdfs}`}
                  className="absolute right-2 top-2 rounded-full bg-[#0b1f4d] px-1.5 py-0.5 text-[10px] font-extrabold text-white"
                >
                  %{pack.discountPercent}
                </span>
                <span className="flex items-center gap-0.5 text-sm font-bold text-[#0b1f4d]">
                  <Plus className="size-3.5" strokeWidth={2.8} />
                  {pack.pdfs} PDF
                </span>
                <span className="mt-1.5 flex items-baseline gap-1">
                  <span
                    data-testid={`extra-price-${pack.pdfs}`}
                    className="text-sm font-extrabold tabular-nums text-[#0b1f4d]"
                  >
                    {formatMinor(price, pack.currency)}
                  </span>
                  <span className="text-[11px] tabular-nums text-slate-400 line-through">
                    {formatMinor(pack.listPriceMinor, pack.currency)}
                  </span>
                </span>
                <span className="mt-1.5 text-[11px] font-semibold text-slate-500">
                  {loading ? "…" : "Satın al"}
                </span>
              </button>
            );
          })}
        </div>
      )}
      {error && (
        <p role="alert" className="mt-1.5 text-xs font-medium text-rose-600">
          {error}
        </p>
      )}
      <button type="button" data-testid="extra-pdf-cta" className="sr-only" tabIndex={-1} aria-hidden>
        Talep et
      </button>
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
          <div className="min-w-0">
            <p className="truncate text-lg font-bold leading-tight tracking-tight text-teal-950">
              {tierLabel(target.tier)}
            </p>
            <p data-testid="upgrade-allowance" className="mt-0.5 text-xs font-bold text-teal-800/80">
              {tierPdfAllowanceLabel(target.tier)}
            </p>
          </div>
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
  const strong = pro ? "text-[#6b4e12]" : "text-[#0b1f4d]";

  return (
    <section data-testid="plans-card" aria-label="Planlarım" className="mt-3 shrink-0 space-y-3">
      <div className={pro ? PRO_SURFACE : SOFT_SURFACE} data-theme={pro ? "pro" : "soft"}>
        {pro && (
          <>
            <div className="tp-gold-sheen" aria-hidden />
            <div className="pointer-events-none absolute -left-8 -top-10 size-40 rounded-full bg-white/70 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-14 -right-8 size-44 rounded-full bg-[#ffe9b0]/70 blur-3xl" />
            <div className="pointer-events-none absolute left-1/2 top-1/3 size-28 -translate-x-1/2 rounded-full bg-[#fffdf6]/50 blur-2xl" />
          </>
        )}

        <div className="relative flex items-center gap-3.5">
          <span
            className={`flex size-16 shrink-0 items-center justify-center rounded-[1.15rem] shadow-lg ${
              pro
                ? "bg-gradient-to-br from-white to-[#ffe9b0] text-[#c9a227] shadow-[0_10px_24px_-10px_rgba(240,197,106,0.7)] ring-1 ring-white/80"
                : "bg-[#0b1f4d] text-white shadow-[#0b1f4d]/25"
            }`}
          >
            {pro ? (
              <Crown className="size-8" strokeWidth={2.1} />
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
            <p
              data-testid="plan-allowance"
              className={`mt-1.5 text-sm font-bold tabular-nums ${
                pro ? "text-[#8a6a28]/90" : "text-[#0b1f4d]/70"
              }`}
            >
              {tierPdfAllowanceLabel(subscription.tier)}
            </p>
            <span
              data-testid="plan-status"
              className={`mt-1.5 inline-flex items-center gap-1.5 text-sm font-bold ${
                pro ? "text-[#8a6a28]" : "text-emerald-700"
              }`}
            >
              <span
                className={`size-2 rounded-full ${
                  pro ? "bg-[#c9a227]" : STATUS_DOT[subscription.status] ?? STATUS_DOT.active
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
            pro ? "bg-white/55" : "bg-slate-100"
          }`}
        >
          <div
            className={`h-full rounded-full ${
              pro
                ? "bg-gradient-to-r from-white via-[#ffe9b0] to-[#f0c56a] shadow-[0_0_16px_rgba(255,233,176,0.9)]"
                : `bg-gradient-to-r ${usage.unlimited ? "from-emerald-300 to-teal-400" : LEVEL_BAR[usage.level]}`
            }`}
            style={{ width: `${fill}%` }}
          />
        </div>

        {/* E2E meta — görünmez */}
        <span data-testid="plan-days" className="sr-only" aria-hidden>
          {Math.max(0, subscription.usageDaysRemaining)} gün
        </span>
        <span data-testid="plan-end" className="sr-only" aria-hidden>
          {subscription.periodEnd}
        </span>
        <span className="sr-only" aria-hidden>
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
