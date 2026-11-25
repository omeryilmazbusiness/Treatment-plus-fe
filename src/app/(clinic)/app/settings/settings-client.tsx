"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Coins,
  FileText,
  Globe,
  Info,
  LayoutPanelTop,
  Mail,
  RotateCcw,
  Settings,
  Wand2,
  type LucideIcon,
} from "lucide-react";

import { logoutClinicAction } from "@/app/login/actions";
import type { ClinicSettings } from "@/modules/clinic/domain/clinic";
import {
  clearTabs,
  readRememberTabs,
  resetTabs,
  setRememberTabs,
  subscribeTabs,
} from "../tabs-store";

/*
 * Settings — mirrors the Duaa OS settings hub: iOS "grouped" canvas, white
 * inset cards, top-lit gradient glyph tiles, solid-blue selected row,
 * large title on the left, welcome / detail pane on the right.
 */

/* ── Tokens (Duaa TONE_GLYPH) ─────────────────────────────────────────── */

type Tone = "amber" | "sky" | "emerald" | "violet" | "indigo" | "teal" | "zinc" | "rose";

const TONE_GLYPH: Record<Tone, string> = {
  rose: "from-rose-400 to-rose-600",
  amber: "from-amber-400 to-orange-500",
  sky: "from-sky-400 to-blue-600",
  emerald: "from-emerald-400 to-emerald-600",
  violet: "from-slate-500 to-[#0b1f4d]",
  indigo: "from-[#3b82f6] to-[#0b1f4d]",
  teal: "from-teal-400 to-cyan-600",
  zinc: "from-zinc-400 to-zinc-600",
};

const GLYPH_SIZE = {
  sm: { box: "h-[30px] w-[30px] rounded-[8px]", icon: "h-[17px] w-[17px]" },
  lg: { box: "h-16 w-16 rounded-[20px]", icon: "h-8 w-8" },
} as const;

/* ── iOS primitives (Duaa ios-settings) ───────────────────────────────── */

function Glyph({
  icon: Icon,
  tone,
  size = "sm",
}: {
  icon: LucideIcon;
  tone: Tone;
  size?: keyof typeof GLYPH_SIZE;
}) {
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center bg-gradient-to-b text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] ${TONE_GLYPH[tone]} ${GLYPH_SIZE[size].box}`}
    >
      <Icon className={GLYPH_SIZE[size].icon} strokeWidth={2.2} />
    </span>
  );
}

function Group({
  header,
  children,
}: {
  header?: string;
  children: ReactNode;
}) {
  return (
    <section>
      {header ? (
        <h2 className="px-4 pb-1.5 text-[12.5px] font-medium uppercase tracking-wide text-zinc-500">
          {header}
        </h2>
      ) : null}
      <div className="divide-y divide-zinc-100 overflow-hidden rounded-[20px] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-zinc-200/60">
        {children}
      </div>
    </section>
  );
}

const ROW =
  "flex min-h-[56px] w-full items-center gap-3 px-3.5 py-2 text-left outline-none transition-colors";
const ROW_PRESS = "hover:bg-zinc-50 active:bg-zinc-100 focus-visible:bg-sky-50";

function Row({
  icon,
  title,
  subtitle,
  value,
  chevron,
  active,
  onClick,
  href,
  trailing,
}: {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  value?: string;
  chevron?: boolean;
  active?: boolean;
  onClick?: () => void;
  href?: string;
  trailing?: ReactNode;
}) {
  const body = (
    <>
      {icon}
      <span className="min-w-0 flex-1">
        <span
          className={`block truncate text-[15px] font-medium ${active ? "text-white" : "text-zinc-950"}`}
        >
          {title}
        </span>
        {subtitle ? (
          <span
            className={`block truncate text-[12px] ${active ? "text-white/80" : "text-zinc-500"}`}
          >
            {subtitle}
          </span>
        ) : null}
      </span>
      {value ? (
        <span
          className={`max-w-[40%] truncate text-[13px] ${active ? "text-white/80" : "text-zinc-500"}`}
        >
          {value}
        </span>
      ) : null}
      {trailing}
      {chevron ? (
        <ChevronRight
          aria-hidden
          strokeWidth={2.4}
          className={`h-[18px] w-[18px] shrink-0 ${active ? "text-white/80" : "text-zinc-300"}`}
        />
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`${ROW} ${ROW_PRESS}`}>
        {body}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-current={active ? "page" : undefined}
        className={`${ROW} cursor-pointer ${active ? "bg-[#007AFF]" : ROW_PRESS}`}
      >
        {body}
      </button>
    );
  }
  return <div className={ROW}>{body}</div>;
}

function IosSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-[31px] w-[51px] shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${
        checked ? "bg-[#34C759]" : "bg-[#E9E9EA]"
      }`}
    >
      <span
        className={`absolute top-[2px] h-[27px] w-[27px] rounded-full bg-white shadow-[0_3px_8px_rgba(0,0,0,0.15),0_1px_1px_rgba(0,0,0,0.06)] transition-transform duration-200 ${
          checked ? "translate-x-[22px]" : "translate-x-[2px]"
        }`}
      />
    </button>
  );
}

function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="-ms-1.5 inline-flex min-h-11 cursor-pointer items-center text-[16px] font-medium text-[#007AFF] lg:hidden"
    >
      <ChevronLeft className="h-6 w-6" strokeWidth={2.4} aria-hidden />
      Ayarlar
    </button>
  );
}

function DetailHeader({
  icon,
  tone,
  title,
  description,
}: {
  icon: LucideIcon;
  tone: Tone;
  title: string;
  description: string;
}) {
  return (
    <header className="flex items-center gap-4">
      <Glyph icon={icon} tone={tone} size="lg" />
      <div className="min-w-0">
        <h1 className="text-[26px] font-bold leading-tight tracking-tight text-zinc-950 sm:text-[30px]">
          {title}
        </h1>
        <p className="mt-1 max-w-2xl text-[14px] leading-relaxed text-zinc-500">{description}</p>
      </div>
    </header>
  );
}

/* ── Helpers ──────────────────────────────────────────────────────────── */

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0];
  const last = parts[parts.length - 1];
  if (!first || !last) return "K";
  if (parts.length === 1) return first.slice(0, 2).toUpperCase();
  return (first.charAt(0) + last.charAt(0)).toUpperCase();
}

const CURRENCY_SYMBOL: Record<string, string> = { TRY: "₺", EUR: "€", USD: "$" };

type Pane = "root" | "account" | "clinic" | "workspace";

const FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", system-ui, sans-serif';

/* ── Page ─────────────────────────────────────────────────────────────── */

export function SettingsClient({
  settings,
  userEmail,
}: {
  settings: ClinicSettings;
  userEmail: string;
}) {
  const [pane, setPane] = useState<Pane>("root");
  const detail = pane !== "root";
  const clinicName = settings.name || "Klinik";
  const currency = `${settings.currency} (${CURRENCY_SYMBOL[settings.currency] ?? settings.currency})`;
  const reportLanguage = settings.locale === "tr" ? "Türkçe" : "English";

  return (
    <div
      style={{ fontFamily: FONT_STACK }}
      className="mx-auto w-full max-w-[1500px] rounded-[2.25rem] bg-[#f2f2f7] p-5 shadow-[0_30px_80px_-40px_rgba(30,27,107,0.45)] ring-1 ring-white/80 sm:p-6 lg:min-h-[calc(100dvh-8.5rem)] lg:p-8"
      data-testid="settings-hub"
    >
      <div className="lg:grid lg:grid-cols-[minmax(300px,360px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        {/* Sol: liste */}
        <aside
          className={`${detail ? "hidden lg:block" : "block"} lg:sticky lg:top-[7rem] lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto lg:pb-6 lg:pe-1`}
        >
          <nav aria-label="Ayarlar" className="space-y-5">
            <h1 className="px-1 text-[34px] font-bold leading-tight tracking-tight text-zinc-950">
              Ayarlar
            </h1>

            <button
              type="button"
              onClick={() => setPane("account")}
              aria-current={pane === "account" ? "page" : undefined}
              className={`flex w-full cursor-pointer items-center gap-3.5 rounded-[20px] p-3.5 text-left ring-1 transition-colors ${
                pane === "account"
                  ? "bg-[#007AFF] ring-[#007AFF]"
                  : "bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-zinc-200/60"
              }`}
            >
              <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-zinc-300 to-zinc-500 text-[18px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
                {getInitials(clinicName || userEmail)}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={`block truncate text-[17px] font-semibold tracking-tight ${
                    pane === "account" ? "text-white" : "text-zinc-950"
                  }`}
                >
                  {clinicName}
                </span>
                <span
                  className={`block truncate text-[12.5px] ${
                    pane === "account" ? "text-white/80" : "text-zinc-500"
                  }`}
                >
                  Klinik Hesabı
                </span>
                <span
                  className={`mt-0.5 block truncate text-[12px] font-medium ${
                    pane === "account" ? "text-white" : "text-[#007AFF]"
                  }`}
                >
                  {userEmail}
                </span>
              </span>
              <ChevronRight
                aria-hidden
                strokeWidth={2.4}
                className={`h-[18px] w-[18px] shrink-0 ${
                  pane === "account" ? "text-white/80" : "text-zinc-300"
                }`}
              />
            </button>

            <Group header="İşletme">
              <Row
                icon={<Glyph icon={Building2} tone="indigo" />}
                title="Klinik"
                subtitle="Profil, antet ve şablon"
                chevron
                active={pane === "clinic"}
                onClick={() => setPane("clinic")}
              />
              <Row
                icon={<Glyph icon={LayoutPanelTop} tone="violet" />}
                title="Çalışma Alanı"
                subtitle="Sekmeler ve görünüm"
                chevron
                active={pane === "workspace"}
                onClick={() => setPane("workspace")}
              />
            </Group>

            <Group header="Tercihler">
              <Row
                icon={<Glyph icon={Coins} tone="emerald" />}
                title="Para Birimi"
                subtitle={currency}
              />
              <Row
                icon={<Glyph icon={Globe} tone="teal" />}
                title="Rapor Dili"
                subtitle={reportLanguage}
              />
              <Row
                icon={<Glyph icon={Info} tone="amber" />}
                title="Sürüm"
                subtitle="Treatment Plus v2.0"
              />
            </Group>

            <Group>
              <form action={logoutClinicAction} onSubmit={clearTabs}>
                <button
                  type="submit"
                  className="w-full cursor-pointer py-3.5 text-center text-[16px] font-medium text-[#FF3B30] transition-colors hover:bg-zinc-50 active:bg-zinc-100"
                >
                  Çıkış Yap
                </button>
              </form>
            </Group>
          </nav>
        </aside>

        {/* Sağ: içerik */}
        <div className={`${detail ? "block" : "hidden lg:block"} min-w-0 lg:min-h-[calc(100dvh-12rem)]`}>
          {pane === "root" && <Welcome />}

          {pane === "account" && (
            <article className="space-y-6">
              <BackButton onBack={() => setPane("root")} />
              <DetailHeader
                icon={Mail}
                tone="sky"
                title="Hesap"
                description="Bu klinik hesabının giriş ve kimlik bilgileri."
              />
              <Group>
                <Row icon={<Glyph icon={Mail} tone="sky" />} title="E-posta" value={userEmail} />
                <Row
                  icon={<Glyph icon={Building2} tone="indigo" />}
                  title="Klinik"
                  value={settings.name || "—"}
                />
              </Group>
            </article>
          )}

          {pane === "clinic" && (
            <article className="space-y-6">
              <BackButton onBack={() => setPane("root")} />
              <DetailHeader
                icon={Building2}
                tone="indigo"
                title="Klinik"
                description="Klinik profili, antet ve şablon ayarları."
              />
              <Group>
                <Row
                  href="/app/clinic"
                  icon={<Glyph icon={Building2} tone="sky" />}
                  title="Klinik Profili"
                  subtitle="Ad, telefon, e-posta ve adres"
                  chevron
                />
                <Row
                  href="/app/clinic"
                  icon={<Glyph icon={FileText} tone="indigo" />}
                  title="Antet & Şablon"
                  subtitle="Teklif ve rapor görünümü"
                  chevron
                />
                <Row
                  href="/setup"
                  icon={<Glyph icon={Wand2} tone="violet" />}
                  title="Kurulum Sihirbazı"
                  subtitle="Klinik, hekim, tercihler ve fiyatlar"
                  chevron
                />
              </Group>
              <Group>
                <Row icon={<Glyph icon={Coins} tone="emerald" />} title="Para Birimi" value={currency} />
                <Row icon={<Glyph icon={Globe} tone="teal" />} title="Rapor Dili" value={reportLanguage} />
              </Group>
            </article>
          )}

          {pane === "workspace" && <WorkspacePane onBack={() => setPane("root")} />}
        </div>
      </div>
    </div>
  );
}

function Welcome() {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[28px] bg-white/70 px-8 text-center ring-1 ring-zinc-200/60 lg:min-h-[calc(100dvh-12rem)]">
      <Glyph icon={Settings} tone="zinc" size="lg" />
      <p className="mt-5 text-[22px] font-semibold tracking-tight text-zinc-950">Ayarlar</p>
      <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-zinc-500">
        Kliniği, çalışma alanını veya hesabı yönetmek için soldan bir bölüm seçin.
      </p>
    </div>
  );
}

function WorkspacePane({ onBack }: { onBack: () => void }) {
  const remember = useSyncExternalStore(subscribeTabs, readRememberTabs, () => true);
  return (
    <article className="space-y-6">
      <BackButton onBack={onBack} />
      <DetailHeader
        icon={LayoutPanelTop}
        tone="violet"
        title="Çalışma Alanı"
        description="Açık sekmelerin bu cihazda nasıl saklanacağını seçin."
      />
      <Group>
        <Row
          icon={<Glyph icon={LayoutPanelTop} tone="indigo" />}
          title="Sekmeleri Hatırla"
          subtitle="Kapatıp açınca sekmeler korunur"
          trailing={<IosSwitch checked={remember} onChange={setRememberTabs} label="Sekmeleri hatırla" />}
        />
        <Row
          icon={<Glyph icon={RotateCcw} tone="zinc" />}
          title="Sekmeleri Sıfırla"
          subtitle="Yalnızca Ayarlar sekmesi kalır"
          onClick={() => resetTabs("/app/settings")}
        />
      </Group>
    </article>
  );
}
