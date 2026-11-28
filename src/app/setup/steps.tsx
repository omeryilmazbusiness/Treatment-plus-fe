"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Palette as PaletteIcon,
  Stethoscope,
  Tags,
} from "lucide-react";

import type { ClinicSettings, Locale, Palette } from "@/modules/clinic/domain/clinic";
import {
  isPlaceholderAddress,
  isPlaceholderPhone,
  validateClinicStep,
  validateDoctorStep,
  type FieldErrors,
} from "@/modules/clinic/domain/setup";
import type { Currency } from "@/shared/money";
import { PriceInput } from "@/ui/price-input";

import { updateClinicSettingsAction } from "../(clinic)/app/actions";
import {
  ensureCatalogAction,
  savePricesAction,
  type SetupCatalog,
} from "./actions";
import {
  GlassField,
  GlassGroup,
  GlassInput,
  PillButton,
  StepHero,
} from "./setup-glass";

type SettingsStepProps = {
  settings: ClinicSettings;
  onBack: (() => void) | null;
  onSaved: (next: ClinicSettings) => void;
};

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** Ayar yamasını kaydeder; oturum düşmüşse girişe yollar. */
async function saveSettings(
  settings: ClinicSettings,
  patch: Partial<ClinicSettings>
): Promise<{ next?: ClinicSettings; error?: string }> {
  const res = await updateClinicSettingsAction({ ...patch, workspaceId: settings.workspaceId });
  if (res.unauthenticated) {
    window.location.replace("/login");
    return { error: "Oturum süreniz doldu." };
  }
  if (!res.success || !res.data) return { error: res.error ?? "Kaydedilemedi." };
  return { next: res.data };
}

export function StepFooter({
  onBack,
  primaryLabel,
  onPrimary,
  busy,
  disabled,
  secondary,
  error,
}: {
  onBack: (() => void) | null;
  primaryLabel: string;
  onPrimary: () => void;
  busy?: boolean;
  disabled?: boolean;
  secondary?: { label: string; onClick: () => void };
  error?: string | null;
}) {
  return (
    <div className="space-y-2 pt-2">
      {error ? (
        <p role="alert" className="px-1 text-center text-[12px] font-medium text-rose-300">
          {error}
        </p>
      ) : null}
      <div className="grid grid-cols-2 gap-3">
        <PillButton
          variant="glass"
          onClick={onBack ?? undefined}
          disabled={!onBack || busy}
          data-testid="setup-back"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2.25} />
          Geri
        </PillButton>
        <PillButton onClick={onPrimary} disabled={disabled || busy} data-testid="setup-primary">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {primaryLabel}
          {busy ? null : <ChevronRight className="h-4 w-4" strokeWidth={2.25} />}
        </PillButton>
      </div>
      {secondary ? (
        <PillButton
          variant="glass"
          className="w-full"
          onClick={secondary.onClick}
          disabled={busy}
          data-testid="setup-skip"
        >
          {secondary.label}
        </PillButton>
      ) : (
        <div className="h-11" aria-hidden />
      )}
    </div>
  );
}

/* ── 1 · Klinik ───────────────────────────────────────────────────────── */

export function ClinicStep({
  settings,
  locale,
  onBack,
  onSaved,
}: SettingsStepProps & { locale: Locale }) {
  const [name, setName] = useState(settings.name);
  // Kayıt formunun bıraktığı yer tutucuyu gerçek değer gibi göstermeyelim.
  const [phone, setPhone] = useState(isPlaceholderPhone(settings.phone) ? "" : settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [address, setAddress] = useState(
    isPlaceholderAddress(settings.address) ? "" : settings.address
  );
  const [hours, setHours] = useState(settings.hours);
  const [errors, setErrors] = useState<FieldErrors<"name" | "phone" | "email" | "address">>({});
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  function clear(key: "name" | "phone" | "email" | "address") {
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setFailure(null);
  }

  async function save() {
    const found = validateClinicStep({ name, phone, email, address });
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    const { next, error } = await saveSettings(settings, {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      hours: hours.trim(),
      locale,
    });
    setBusy(false);
    if (next) onSaved(next);
    else setFailure(error ?? "Kaydedilemedi.");
  }

  return (
    <div className="space-y-6">
      <StepHero
        icon={Building2}
        tint="clinic"
        title="Klinik Kimliği"
        subtitle="Teklif ve hasta sayfalarında görünen temel iletişim bilgileriniz."
      />
      <GlassGroup footer="Bu bilgiler tedavi planı PDF’inde ve hastaya giden bağlantıda yer alır.">
        <GlassField id="setup-name" label="Klinik adı" error={errors.name}>
          <GlassInput
            id="setup-name"
            value={name}
            invalid={Boolean(errors.name)}
            placeholder="Örn. Aydın Diş Kliniği"
            autoComplete="organization"
            data-testid="setup-clinic-name"
            onChange={(e) => {
              setName(e.target.value);
              clear("name");
            }}
          />
        </GlassField>
        <GlassField id="setup-phone" label="Telefon" error={errors.phone}>
          <GlassInput
            id="setup-phone"
            type="tel"
            value={phone}
            invalid={Boolean(errors.phone)}
            placeholder="+90 5xx xxx xx xx"
            autoComplete="tel"
            data-testid="setup-clinic-phone"
            onChange={(e) => {
              setPhone(e.target.value);
              clear("phone");
            }}
          />
        </GlassField>
        <GlassField id="setup-email" label="E-posta" error={errors.email}>
          <GlassInput
            id="setup-email"
            type="email"
            value={email}
            invalid={Boolean(errors.email)}
            placeholder="info@klinik.com"
            autoComplete="email"
            onChange={(e) => {
              setEmail(e.target.value);
              clear("email");
            }}
          />
        </GlassField>
        <GlassField id="setup-address" label="Adres" error={errors.address}>
          <GlassInput
            id="setup-address"
            value={address}
            invalid={Boolean(errors.address)}
            placeholder="Mahalle, cadde, no, ilçe / il"
            autoComplete="street-address"
            data-testid="setup-clinic-address"
            onChange={(e) => {
              setAddress(e.target.value);
              clear("address");
            }}
          />
        </GlassField>
        <GlassField id="setup-hours" label="Çalışma saati">
          <GlassInput
            id="setup-hours"
            value={hours}
            placeholder="Pzt–Cmt 09:00–19:00"
            onChange={(e) => setHours(e.target.value)}
          />
        </GlassField>
      </GlassGroup>
      <StepFooter
        onBack={onBack}
        primaryLabel="Devam"
        onPrimary={() => void save()}
        busy={busy}
        error={failure}
      />
    </div>
  );
}

/* ── 2 · Hekim ────────────────────────────────────────────────────────── */

export function DoctorStep({ settings, onBack, onSaved }: SettingsStepProps) {
  const clinicName = settings.name.trim();
  const signer = settings.signerName.trim();
  const [name, setName] = useState(
    settings.doctor.name || (signer && signer !== clinicName ? signer : "")
  );
  const [title, setTitle] = useState(
    settings.doctor.title || settings.signerTitle || "Diş Hekimi"
  );
  const [errors, setErrors] = useState<FieldErrors<"name" | "title">>({});
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  async function save() {
    const found = validateDoctorStep({ name, title });
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    const { next, error } = await saveSettings(settings, {
      signerName: name.trim(),
      signerTitle: title.trim(),
      doctor: { ...settings.doctor, name: name.trim(), title: title.trim() },
    });
    setBusy(false);
    if (next) onSaved(next);
    else setFailure(error ?? "Kaydedilemedi.");
  }

  return (
    <div className="space-y-6">
      <StepHero
        icon={Stethoscope}
        tint="doctor"
        title="Hekim"
        subtitle="Planı hazırlayan ve imzalayan hekimin adı ve unvanı."
      />
      <GlassGroup footer="Teklif sayfasındaki imza bloğu ve hasta sunumunda kullanılır.">
        <GlassField id="setup-doctor-name" label="Hekim adı" error={errors.name}>
          <GlassInput
            id="setup-doctor-name"
            value={name}
            invalid={Boolean(errors.name)}
            placeholder="Örn. Dt. Ayşe Yılmaz"
            data-testid="setup-doctor-name"
            onChange={(e) => {
              setName(e.target.value);
              setErrors((p) => ({ ...p, name: undefined }));
              setFailure(null);
            }}
          />
        </GlassField>
        <GlassField id="setup-doctor-title" label="Unvan" error={errors.title}>
          <GlassInput
            id="setup-doctor-title"
            value={title}
            invalid={Boolean(errors.title)}
            placeholder="Örn. Başhekim, Periodontolog"
            data-testid="setup-doctor-title"
            onChange={(e) => {
              setTitle(e.target.value);
              setErrors((p) => ({ ...p, title: undefined }));
              setFailure(null);
            }}
          />
        </GlassField>
      </GlassGroup>
      <StepFooter
        onBack={onBack}
        primaryLabel="Devam"
        onPrimary={() => void save()}
        busy={busy}
        error={failure}
      />
    </div>
  );
}

/* ── 3 · Tercihler ────────────────────────────────────────────────────── */

const CURRENCIES: { code: Currency; symbol: string; label: string }[] = [
  { code: "TRY", symbol: "₺", label: "Türk Lirası" },
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "USD", symbol: "$", label: "ABD Doları" },
];

const PALETTES: { key: Palette; label: string; accent: string; base: string }[] = [
  { key: "navy", label: "Lacivert", accent: "#2563eb", base: "#0f172a" },
  { key: "forest", label: "Zümrüt", accent: "#059669", base: "#064e3b" },
  { key: "rose", label: "Gül", accent: "#e11d48", base: "#881337" },
  { key: "slate", label: "Arduvaz", accent: "#64748b", base: "#334155" },
];

const LOCALES: { code: Locale; label: string }[] = [
  { code: "tr", label: "Türkçe" },
  { code: "en", label: "English" },
  { code: "ar", label: "Arabic" },
  { code: "ru", label: "Russia" },
];

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  testId,
}: {
  label: string;
  value: T;
  options: { value: T; label: ReactNode }[];
  onChange: (next: T) => void;
  testId?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      data-testid={testId}
      className="grid gap-1.5 rounded-[14px] bg-white/[0.08] p-1.5"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={cx(
              "h-10 cursor-pointer truncate rounded-[10px] px-2 text-[13px] font-semibold transition duration-200",
              active
                ? "bg-white/[0.2] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_1px_3px_rgba(0,0,0,0.35)]"
                : "text-white/55 hover:text-white/85"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function PrefsStep({
  settings,
  onBack,
  onSaved,
}: SettingsStepProps) {
  const [currency, setCurrency] = useState<Currency>(settings.currency);
  const [palette, setPalette] = useState<Palette>(settings.palette);
  const [locale, setLocale] = useState<Locale>(settings.locale);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    const { next, error } = await saveSettings(settings, { currency, palette, locale });
    setBusy(false);
    if (next) onSaved(next);
    else setFailure(error ?? "Kaydedilemedi.");
  }

  return (
    <div className="space-y-6">
      <StepHero
        icon={PaletteIcon}
        tint="prefs"
        title="Tercihler"
        subtitle="Para birimi, rapor dili ve teklif belgelerinizin renk teması."
      />
      <GlassGroup title="Para Birimi">
        <div className="p-2">
          <Segmented
            label="Para birimi"
            value={currency}
            testId="setup-currency"
            options={CURRENCIES.map((c) => ({ value: c.code, label: `${c.symbol} ${c.code}` }))}
            onChange={(v) => {
              setCurrency(v);
              setFailure(null);
            }}
          />
        </div>
      </GlassGroup>
      <GlassGroup title="Rapor Dili">
        <div className="p-2">
          <Segmented
            label="Rapor dili"
            value={locale}
            options={LOCALES.map((l) => ({ value: l.code, label: l.label }))}
            onChange={setLocale}
          />
        </div>
      </GlassGroup>
      <GlassGroup title="Renk Teması">
        <div
          role="radiogroup"
          aria-label="Renk teması"
          className="grid grid-cols-4 gap-2 p-3"
          data-testid="setup-palette"
        >
          {PALETTES.map((p) => {
            const active = p.key === palette;
            return (
              <button
                key={p.key}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setPalette(p.key)}
                className={cx(
                  "flex cursor-pointer flex-col items-center gap-2 rounded-[14px] px-1 py-2.5 transition duration-200",
                  active ? "bg-white/[0.14] ring-1 ring-white/30" : "hover:bg-white/[0.08]"
                )}
              >
                <span
                  aria-hidden
                  className="relative size-9 rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
                  style={{ background: `linear-gradient(135deg, ${p.base}, ${p.accent})` }}
                >
                  {active ? (
                    <Check className="absolute inset-0 m-auto size-4 text-white" strokeWidth={3} />
                  ) : null}
                </span>
                <span
                  className={cx(
                    "text-[12px] font-semibold",
                    active ? "text-white" : "text-white/55"
                  )}
                >
                  {p.label}
                </span>
              </button>
            );
          })}
        </div>
      </GlassGroup>
      <StepFooter
        onBack={onBack}
        primaryLabel="Devam"
        onPrimary={() => void save()}
        busy={busy}
        error={failure}
      />
    </div>
  );
}

/* ── 4 · Fiyat listesi ────────────────────────────────────────────────── */

const SYMBOL: Record<Currency, string> = { TRY: "₺", EUR: "€", USD: "$" };

export function PricesStep({
  catalog,
  currency,
  onBack,
  onCatalog,
  onDone,
}: {
  catalog: SetupCatalog;
  currency: Currency;
  onBack: (() => void) | null;
  onCatalog: (next: SetupCatalog) => void;
  onDone: (next: SetupCatalog) => void;
}) {
  const [loading, setLoading] = useState(catalog.treatments.length === 0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, number>>(() =>
    Object.fromEntries(catalog.prices.map((p) => [p.treatmentId, p.amount]))
  );
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const requested = useRef(false);

  async function seed() {
    setLoading(true);
    setLoadError(null);
    const res = await ensureCatalogAction();
    if (res.unauthenticated) {
      window.location.replace("/login");
      return;
    }
    if (res.success && res.data) {
      onCatalog(res.data);
      setDraft(Object.fromEntries(res.data.prices.map((p) => [p.treatmentId, p.amount])));
    } else {
      setLoadError(res.error ?? "Tedavi listesi hazırlanamadı.");
    }
    setLoading(false);
  }

  useEffect(() => {
    if (catalog.treatments.length > 0 || requested.current) return;
    requested.current = true;
    void seed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changed = catalog.treatments.filter(
    (t) => (draft[String(t.id)] ?? 0) !== (catalog.prices.find((p) => p.treatmentId === String(t.id))?.amount ?? 0)
  );

  async function save() {
    setBusy(true);
    setFailure(null);
    if (changed.length === 0) {
      setBusy(false);
      onDone(catalog);
      return;
    }
    const res = await savePricesAction(
      changed.map((t) => ({ treatmentId: String(t.id), amount: draft[String(t.id)] ?? 0 }))
    );
    setBusy(false);
    if (res.unauthenticated) {
      window.location.replace("/login");
      return;
    }
    if (res.success && res.data) onDone(res.data);
    else setFailure(res.error ?? "Fiyatlar kaydedilemedi.");
  }

  return (
    <div className="space-y-6">
      <StepHero
        icon={Tags}
        tint="prices"
        title="Fiyat Listesi"
        subtitle="Standart tedavi kataloğunu hazırladık. Kendi tarifenize göre fiyatları düzenleyin."
      />

      {loading ? (
        <div
          role="status"
          className="flex items-center justify-center gap-3 py-10 text-[13px] font-medium text-white/60"
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          Tedavi kataloğu hazırlanıyor…
        </div>
      ) : loadError ? (
        <div className="space-y-3 py-6 text-center">
          <p role="alert" className="text-[13px] text-rose-300">
            {loadError}
          </p>
          <PillButton variant="glass" onClick={() => void seed()}>
            Tekrar dene
          </PillButton>
        </div>
      ) : (
        <GlassGroup footer="Fiyatları sonra Klinik & Şablon sayfasından da değiştirebilirsiniz.">
          <div className="max-h-[320px] divide-y divide-white/[0.08] overflow-y-auto overscroll-contain">
            {catalog.treatments.map((t) => (
              <div key={String(t.id)} className="flex items-center gap-3 px-4 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-white/90">{t.name}</p>
                  <p className="text-[11px] tabular-nums text-white/40">{t.code}</p>
                </div>
                <span className="flex items-center gap-1.5 rounded-xl bg-white/[0.08] px-3 ring-1 ring-white/10 focus-within:bg-white/[0.14]">
                  <span aria-hidden className="text-[13px] text-white/45">
                    {SYMBOL[currency]}
                  </span>
                  <PriceInput
                    aria-label={`${t.name} fiyatı`}
                    value={draft[String(t.id)] ?? 0}
                    onChange={(v) => {
                      setDraft((d) => ({ ...d, [String(t.id)]: v }));
                      setFailure(null);
                    }}
                    className="h-9 w-24 bg-transparent text-right text-[14px] font-semibold tabular-nums text-white outline-none"
                  />
                </span>
              </div>
            ))}
          </div>
        </GlassGroup>
      )}

      <StepFooter
        onBack={onBack}
        primaryLabel={changed.length > 0 ? "Kaydet ve Bitir" : "Bitir"}
        onPrimary={() => void save()}
        busy={busy}
        disabled={loading || Boolean(loadError) || catalog.treatments.length === 0}
        error={failure}
      />
    </div>
  );
}
