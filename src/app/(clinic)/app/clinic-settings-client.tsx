"use client";

import React, { useState, useTransition } from "react";
import type {
  ClinicSettings,
  Palette,
  WorkspaceProducts,
} from "@/modules/clinic/domain/clinic";
import type { Currency } from "@/shared/money";
import { Badge } from "@/ui/badge";
import { updateClinicSettingsAction } from "./actions";

interface Props {
  initialProducts: WorkspaceProducts;
  initialSettings: ClinicSettings;
  userEmail: string;
}

const PALETTE_CONFIGS: Record<
  Palette,
  {
    name: string;
    description: string;
    primaryHex: string;
    accentHex: string;
    bgSoft: string;
    borderHex: string;
    textColor: string;
  }
> = {
  navy: {
    name: "Derin Lacivert (Navy)",
    description: "Kurumsal, güven veren prestijli gece mavisi tonu.",
    primaryHex: "#0f172a",
    accentHex: "#2563eb",
    bgSoft: "#f1f5f9",
    borderHex: "#cbd5e1",
    textColor: "#0f172a",
  },
  forest: {
    name: "Zümrüt Orman (Forest)",
    description: "Sağlık, dinginlik ve yenilenmeyi temsil eden doğal yeşil.",
    primaryHex: "#064e3b",
    accentHex: "#059669",
    bgSoft: "#ecfdf5",
    borderHex: "#a7f3d0",
    textColor: "#064e3b",
  },
  rose: {
    name: "Zarif Gül (Rose)",
    description: "Sıcak, estetik ve premium gül kurusu tonu.",
    primaryHex: "#881337",
    accentHex: "#e11d48",
    bgSoft: "#fff1f2",
    borderHex: "#fecdd3",
    textColor: "#881337",
  },
  slate: {
    name: "Arduvaz Taş (Slate)",
    description: "Modern, minimalist ve tarafsız gri-füme dokusu.",
    primaryHex: "#334155",
    accentHex: "#64748b",
    bgSoft: "#f8fafc",
    borderHex: "#cbd5e1",
    textColor: "#334155",
  },
};

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  TRY: "₺",
  EUR: "€",
  USD: "$",
};

export function ClinicSettingsClient({
  initialProducts,
  initialSettings,
  userEmail,
}: Props) {
  const classicProduct = initialProducts.products.find((p) => p.id === "classic");
  const ultimateProduct = initialProducts.products.find((p) => p.id === "ultimate");
  const [settings, setSettings] = useState<ClinicSettings>(initialSettings);
  const [activeDoor, setActiveDoor] = useState<"classic" | "ultimate">("classic");
  const [ultimateAlert, setUltimateAlert] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const currentPalette = PALETTE_CONFIGS[settings.palette] || PALETTE_CONFIGS.navy;
  const currencySymbol = CURRENCY_SYMBOLS[settings.currency] || "₺";

  const handleFieldChange = <K extends keyof ClinicSettings>(
    field: K,
    val: ClinicSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [field]: val }));
    setSaveStatus("idle");
  };

  const handleSave = () => {
    setSaveStatus("idle");
    startTransition(async () => {
      const res = await updateClinicSettingsAction({
        name: settings.name,
        locale: settings.locale,
        currency: settings.currency,
        palette: settings.palette,
        logoKey: settings.logoKey,
        phone: settings.phone,
        mapUrl: settings.mapUrl,
        intro: settings.intro,
        legal: settings.legal,
      });

      if (res.success && res.data) {
        setSettings(res.data);
        setSaveStatus("success");
        setFeedbackMessage("Şablon ayarları başarıyla kaydedildi!");
        setTimeout(() => setSaveStatus("idle"), 4000);
      } else {
        setSaveStatus("error");
        setFeedbackMessage(res.error || "Ayarlar kaydedilemedi.");
      }
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Üst Karşılama ve Kullanıcı Bilgisi */}
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-line pb-6 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block size-2.5 rounded-full bg-teal" />
            <span className="text-xs font-semibold tracking-wider text-ink-soft uppercase">
              Klinik Çalışma Alanı
            </span>
          </div>
          <h1 className="mt-1 font-serif text-3xl font-normal tracking-tight text-ink md:text-4xl">
            {settings.name || "Klinik Paneli"}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            Oturum: <strong className="font-medium text-ink">{userEmail}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full border border-line bg-paper-2 px-3.5 py-1.5 text-xs font-medium text-ink-soft shadow-xs">
            Workspace ID:{" "}
            <code className="text-xs text-ink">
              {settings.workspaceId ? `${settings.workspaceId.slice(0, 10)}...` : "Aktif"}
            </code>
          </span>
        </div>
      </div>

      {/* 1. BÖLÜM: İKİ KAPI (CLASSIC & ULTIMATE) */}
      <section className="mb-12">
        <div className="mb-4">
          <h2 className="text-sm font-semibold tracking-wide text-ink uppercase">
            Platform Kapıları
          </h2>
          <p className="text-xs text-ink-soft">
            Kullanmak istediğiniz ürün kapısını seçin.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Classic Kapısı (Açık) */}
          <div
            onClick={() => {
              setActiveDoor("classic");
              setUltimateAlert(false);
            }}
            className={`group relative cursor-pointer overflow-hidden rounded-2xl border-2 p-6 transition-all duration-200 ${
              activeDoor === "classic"
                ? "border-teal bg-paper-2 shadow-md ring-2 ring-teal/20"
                : "border-line bg-paper-2/60 hover:border-teal/50 hover:bg-paper-2"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-xl bg-teal/10 text-teal">
                  <svg
                    className="size-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-medium text-ink">
                    Classic
                  </h3>
                  <span className="text-xs text-teal font-medium">
                    Tedavi Planı & Standart PDF
                  </span>
                </div>
              </div>
              <Badge tone={classicProduct?.open ? "ok" : "off"}>
                {classicProduct?.open ? "Açık" : "Kapalı"}
              </Badge>
            </div>

            <p className="mt-4 text-sm leading-6 text-ink-soft">
              Hızlı, güvenilir ve sade tedavi planlama deneyimi. Kurumsal antetli
              ve kapalı renk setli PDF şablonunuzu tek tıkla yapılandırın.
            </p>

            <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-teal">
              <span>Seçili Kapı • Şablonu Düzenle</span>
              <svg
                className="size-4 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </div>
          </div>

          {/* Ultimate Kapısı (Kapalı) */}
          <div
            onClick={() => {
              setUltimateAlert(true);
            }}
            className="group relative cursor-not-allowed overflow-hidden rounded-2xl border border-line/80 bg-paper-2/40 p-6 opacity-75 transition-all duration-200 hover:opacity-90"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-xl bg-ink/5 text-ink-soft">
                  <svg
                    className="size-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-medium text-ink/70">
                    Ultimate
                  </h3>
                  <span className="text-xs text-ink-soft">
                    Yapay Zekâ & Dinamik Sunum
                  </span>
                </div>
              </div>
              <Badge tone={ultimateProduct?.open ? "ok" : "off"}>
                {ultimateProduct?.open ? "Açık" : "Kapalı"}
              </Badge>
            </div>

            <p className="mt-4 text-sm leading-6 text-ink-soft/80">
              AI destekli tedavi alternatifleri, interaktif hasta portalı ve
              özel video/3D destekli zengin sunum motoru.
            </p>

            <div className="mt-5 flex items-center gap-1.5 text-xs font-medium text-ink-soft">
              <svg
                className="size-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
              <span>Ultimate sürüm kilitli • Yakında aktif</span>
            </div>
          </div>
        </div>

        {ultimateAlert && (
          <div className="mt-3 flex items-center justify-between rounded-xl border border-wait/30 bg-wait-soft/40 px-4 py-3 text-sm text-wait">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Bilgi:</span>
              <span>
                Ultimate kapısı Faz 8 (AI) kapsamında açılacaktır. Şu anda Classic
                kapısı aktiftir.
              </span>
            </div>
            <button
              onClick={() => setUltimateAlert(false)}
              className="text-xs font-semibold underline hover:no-underline"
            >
              Kapat
            </button>
          </div>
        )}
      </section>

      {/* 2. BÖLÜM: “PDF’im nasıl görünsün?” ŞABLON FORMU & CANLI A4 ÖNİZLEME */}
      <section className="mt-10">
        <div className="mb-6 flex flex-col justify-between gap-2 border-b border-line pb-4 md:flex-row md:items-end">
          <div>
            <Badge tone="ok">Classic Şablonu</Badge>
            <h2 className="mt-2 font-serif text-2xl font-medium text-ink">
              “PDF’im nasıl görünsün?”
            </h2>
            <p className="text-sm text-ink-soft">
              Hastalarınıza ileteceğiniz tedavi planı PDF belgesinin kurumsal
              marka kimliğini ve dil/para birimi tercihlerini yapılandırın.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={isPending}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-teal px-6 py-2.5 text-sm font-semibold text-paper shadow-sm transition-all hover:bg-teal-deep disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? (
                <>
                  <svg
                    className="size-4 animate-spin text-paper"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  <span>Kaydediliyor...</span>
                </>
              ) : (
                <span>Değişiklikleri Kaydet</span>
              )}
            </button>
          </div>
        </div>

        {/* Başarı / Hata Bildirimi */}
        {saveStatus === "success" && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-teal/30 bg-ok-soft px-4 py-3 text-sm text-teal">
            <svg
              className="size-5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-medium">{feedbackMessage}</span>
          </div>
        )}

        {saveStatus === "error" && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-danger/30 bg-red-50 px-4 py-3 text-sm text-danger">
            <svg
              className="size-5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
            <span className="font-medium">{feedbackMessage}</span>
          </div>
        )}

        {/* İKİ SÜTUNLU DÜZEN: FORM + CANLI A4 ÖNİZLEME */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* SOL: FORM (7 SÜTUN) */}
          <div className="space-y-6 lg:col-span-7">
            {/* 1. Dil & Para Birimi */}
            <div className="rounded-2xl border border-line bg-paper-2 p-5 shadow-xs">
              <h3 className="text-sm font-semibold tracking-wide text-ink uppercase">
                1. Dil ve Para Birimi
              </h3>
              <p className="mt-1 text-xs text-ink-soft">
                PDF dokümanında kullanılacak resmi dil ve fiyat para birimi.
              </p>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Dil Seçimi (tr | en) */}
                <div>
                  <label className="block text-xs font-semibold text-ink-soft">
                    Belge Dili
                  </label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleFieldChange("locale", "tr")}
                      className={`cursor-pointer rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
                        settings.locale === "tr"
                          ? "border-teal bg-teal/10 text-teal font-semibold shadow-xs"
                          : "border-line bg-paper text-ink hover:border-teal/50"
                      }`}
                    >
                      🇹🇷 Türkçe (tr)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFieldChange("locale", "en")}
                      className={`cursor-pointer rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
                        settings.locale === "en"
                          ? "border-teal bg-teal/10 text-teal font-semibold shadow-xs"
                          : "border-line bg-paper text-ink hover:border-teal/50"
                      }`}
                    >
                      🇬🇧 English (en)
                    </button>
                  </div>
                </div>

                {/* Para Birimi (TRY | EUR | USD) */}
                <div>
                  <label className="block text-xs font-semibold text-ink-soft">
                    Para Birimi (Kur)
                  </label>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {(["TRY", "EUR", "USD"] as const).map((curr) => (
                      <button
                        key={curr}
                        type="button"
                        onClick={() => handleFieldChange("currency", curr)}
                        className={`cursor-pointer rounded-xl border px-2 py-2 text-xs font-medium transition-all ${
                          settings.currency === curr
                            ? "border-teal bg-teal/10 text-teal font-semibold shadow-xs"
                            : "border-line bg-paper text-ink hover:border-teal/50"
                        }`}
                      >
                        {CURRENCY_SYMBOLS[curr]} {curr}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Palet Seçimi (Kapalı Set) */}
            <div className="rounded-2xl border border-line bg-paper-2 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold tracking-wide text-ink uppercase">
                    2. Renk Paleti (Kapalı Set)
                  </h3>
                  <p className="mt-1 text-xs text-ink-soft">
                    Kurumsal kimlik kuralları gereği serbest hex yasaktır;
                    özenle hazırlanmış 4 paletten birini seçin.
                  </p>
                </div>
                <span className="text-xs font-medium text-teal capitalize">
                  {settings.palette}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {(["navy", "forest", "rose", "slate"] as const).map((key) => {
                  const p = PALETTE_CONFIGS[key];
                  const isSelected = settings.palette === key;
                  return (
                    <div
                      key={key}
                      onClick={() => handleFieldChange("palette", key)}
                      className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                        isSelected
                          ? "border-teal bg-teal/5 shadow-xs ring-2 ring-teal/20"
                          : "border-line bg-paper hover:border-ink-soft/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="size-5 rounded-full shadow-inner ring-1 ring-black/10"
                            style={{ backgroundColor: p.primaryHex }}
                          />
                          <span className="text-xs font-semibold text-ink">
                            {p.name.split(" ")[0]}
                          </span>
                        </div>
                        {isSelected && (
                          <span className="text-xs font-bold text-teal">
                            ✓
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 text-[11px] leading-4 text-ink-soft">
                        {p.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Klinik / Marka Bilgileri */}
            <div className="rounded-2xl border border-line bg-paper-2 p-5 shadow-xs">
              <h3 className="text-sm font-semibold tracking-wide text-ink uppercase">
                3. Marka & İletişim Bilgileri
              </h3>
              <p className="mt-1 text-xs text-ink-soft">
                PDF antetinde ve altbilgide görüntülenecek resmi klinik bilgileri.
              </p>

              <div className="mt-4 space-y-4">
                {/* Klinik Adı */}
                <div>
                  <label className="block text-xs font-medium text-ink-soft">
                    Klinik / Hekim Adı *
                  </label>
                  <input
                    type="text"
                    value={settings.name}
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                    placeholder="Örn: Dent Plus Estetik Diş Kliniği"
                    className="mt-1 w-full rounded-xl border border-line bg-paper px-3.5 py-2 text-sm text-ink placeholder:text-ink-soft/50 focus:border-teal focus:outline-hidden"
                  />
                </div>

                {/* Telefon ve Logo URL */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-ink-soft">
                      İletişim Telefonu
                    </label>
                    <input
                      type="tel"
                      value={settings.phone}
                      onChange={(e) => handleFieldChange("phone", e.target.value)}
                      placeholder="+90 212 555 0101"
                      className="mt-1 w-full rounded-xl border border-line bg-paper px-3.5 py-2 text-sm text-ink placeholder:text-ink-soft/50 focus:border-teal focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-ink-soft">
                      Logo (URL veya Depolama Anahtarı)
                    </label>
                    <input
                      type="text"
                      value={settings.logoKey}
                      onChange={(e) =>
                        handleFieldChange("logoKey", e.target.value)
                      }
                      placeholder="https://... / logo_key"
                      className="mt-1 w-full rounded-xl border border-line bg-paper px-3.5 py-2 text-sm text-ink placeholder:text-ink-soft/50 focus:border-teal focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Adres / Harita URL */}
                <div>
                  <label className="block text-xs font-medium text-ink-soft">
                    Harita Bağlantısı / Konum URL
                  </label>
                  <input
                    type="url"
                    value={settings.mapUrl}
                    onChange={(e) =>
                      handleFieldChange("mapUrl", e.target.value)
                    }
                    placeholder="https://maps.google.com/..."
                    className="mt-1 w-full rounded-xl border border-line bg-paper px-3.5 py-2 text-sm text-ink placeholder:text-ink-soft/50 focus:border-teal focus:outline-hidden"
                  />
                </div>

                {/* Tanıtım Metni */}
                <div>
                  <label className="block text-xs font-medium text-ink-soft">
                    Karşılama & Tanıtım Metni (Giriş)
                  </label>
                  <textarea
                    rows={2}
                    value={settings.intro}
                    onChange={(e) =>
                      handleFieldChange("intro", e.target.value)
                    }
                    placeholder="Değerli hastamız, size özel hazırlanan tedavi planı detayları aşağıda sunulmuştur..."
                    className="mt-1 w-full rounded-xl border border-line bg-paper px-3.5 py-2 text-sm text-ink placeholder:text-ink-soft/50 focus:border-teal focus:outline-hidden"
                  />
                </div>

                {/* Yasal Metin */}
                <div>
                  <label className="block text-xs font-medium text-ink-soft">
                    Yasal Bilgilendirme & KVKK Metni (Altbilgi)
                  </label>
                  <textarea
                    rows={2}
                    value={settings.legal}
                    onChange={(e) =>
                      handleFieldChange("legal", e.target.value)
                    }
                    placeholder="Bu planlama tıbbi muayene sonrası revize edilebilir. Fiyatlar 30 gün geçerlidir."
                    className="mt-1 w-full rounded-xl border border-line bg-paper px-3.5 py-2 text-sm text-ink placeholder:text-ink-soft/50 focus:border-teal focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SAĞ: CANLI A4 / PDF ŞABLON ÖNİZLEMESİ (5 SÜTUN) */}
          <div className="lg:col-span-5">
            <div className="sticky top-6">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider text-ink-soft uppercase">
                  Canlı PDF Belge Önizlemesi
                </span>
                <span className="rounded-md bg-paper-2 px-2 py-0.5 text-[11px] font-mono text-ink-soft border border-line">
                  A4 Formatı
                </span>
              </div>

              {/* A4 Kağıt Görünümü */}
              <div className="relative min-h-[580px] overflow-hidden rounded-xl border border-line/90 bg-white p-6 shadow-xl transition-all duration-300">
                {/* Antet Şeridi (Seçili Palet Rengi) */}
                <div
                  className="absolute top-0 right-0 left-0 h-3 transition-colors duration-300"
                  style={{ backgroundColor: currentPalette.primaryHex }}
                />

                {/* PDF Header */}
                <div className="mt-2 flex items-start justify-between border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    {settings.logoKey ? (
                      <div className="size-10 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 p-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={settings.logoKey}
                          alt="Logo"
                          className="size-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      </div>
                    ) : (
                      <div
                        className="flex size-10 items-center justify-center rounded-lg text-white font-serif font-bold text-lg"
                        style={{ backgroundColor: currentPalette.primaryHex }}
                      >
                        {settings.name ? settings.name.charAt(0).toUpperCase() : "T"}
                      </div>
                    )}
                    <div>
                      <h4
                        className="font-serif text-lg font-bold transition-colors duration-300"
                        style={{ color: currentPalette.textColor }}
                      >
                        {settings.name || "Klinik Adı"}
                      </h4>
                      <p className="text-[11px] text-gray-500">
                        {settings.phone || "+90 (xxx) xxx xx xx"}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className="inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold text-white uppercase"
                      style={{ backgroundColor: currentPalette.accentHex }}
                    >
                      {settings.locale === "en" ? "TREATMENT PLAN" : "TEDAVİ PLANI"}
                    </span>
                    <p className="mt-1 text-[10px] text-gray-400">
                      Tarih: {new Date().toLocaleDateString(settings.locale === "en" ? "en-US" : "tr-TR")}
                    </p>
                  </div>
                </div>

                {/* Karşılama Notu */}
                <div className="mt-4 rounded-lg bg-gray-50 p-3 text-xs leading-relaxed text-gray-600">
                  <p className="italic">
                    &ldquo;{settings.intro || "Değerli hastamız, size özel hazırlanan tedavi planı detayları aşağıda sunulmuştur."}&rdquo;
                  </p>
                </div>

                {/* Örnek Tedavi Tablosu (Önizleme İllüstrasyonu) */}
                <div className="mt-4">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr
                        className="border-b text-[10px] font-semibold uppercase"
                        style={{
                          borderColor: currentPalette.borderHex,
                          color: currentPalette.primaryHex,
                        }}
                      >
                        <th className="py-1.5">İşlem / Tedavi</th>
                        <th className="py-1.5 text-center">Seans</th>
                        <th className="py-1.5 text-right">Tutar ({settings.currency})</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-600 text-[11px]">
                      <tr>
                        <td className="py-2 font-medium">Panoramik Röntgen & Konsültasyon</td>
                        <td className="py-2 text-center">1</td>
                        <td className="py-2 text-right">{currencySymbol} 800</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-medium">Kompozit Dolgu (2 Adet)</td>
                        <td className="py-2 text-center">1</td>
                        <td className="py-2 text-right">{currencySymbol} 3.200</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-medium">Zirkonyum Kuron Kaplama</td>
                        <td className="py-2 text-center">2</td>
                        <td className="py-2 text-right">{currencySymbol} 8.500</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-gray-200 font-bold text-gray-900">
                        <td colSpan={2} className="py-2 text-right">
                          {settings.locale === "en" ? "Estimated Total:" : "Tahmini Toplam:"}
                        </td>
                        <td
                          className="py-2 text-right text-sm"
                          style={{ color: currentPalette.accentHex }}
                        >
                          {currencySymbol} 12.500
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Önizleme Altbilgi (Footer) */}
                <div className="absolute right-6 bottom-4 left-6 border-t border-gray-100 pt-3 text-[10px] text-gray-400">
                  <div className="flex items-center justify-between">
                    <span className="truncate max-w-[240px]">
                      {settings.legal || "KVKK ve tıbbi bilgilendirme metni burada yer alır."}
                    </span>
                    {settings.mapUrl && (
                      <span
                        className="font-semibold underline cursor-pointer"
                        style={{ color: currentPalette.accentHex }}
                      >
                        {settings.locale === "en" ? "View Map" : "Haritada Gör"}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Alt Bilgilendirme Notu */}
              <p className="mt-2 text-center text-xs text-ink-soft">
                Seçilen palet rengi ({settings.palette}) ve yazı tipleri PDF motoruna uygulanacaktır.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
