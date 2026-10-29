"use client";

import React, { useId, useState, useTransition } from "react";
import {
  Building2,
  CheckCircle2,
  FileCheck2,
  Globe,
  ImageIcon,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  Upload,
  UserCheck,
} from "lucide-react";

import { updateClinicSettingsAction, uploadMediaAction } from "@/app/(clinic)/app/actions";
import type {
  ClinicSettings,
  Locale,
  Palette,
} from "@/modules/clinic/domain/clinic";
import type { Currency } from "@/shared/money";

interface ClinicSettingsViewProps {
  initialSettings: ClinicSettings;
  userEmail: string;
  workspaceId: string;
}

type TabType = "general" | "media" | "doctor" | "pdf";

const PALETTE_CONFIGS: Record<
  Palette,
  {
    name: string;
    description: string;
    primaryHex: string;
    accentHex: string;
    bgSoft: string;
    borderHex: string;
  }
> = {
  navy: {
    name: "Derin Lacivert (Navy)",
    description: "Kurumsal, güven veren gece mavisi tonu.",
    primaryHex: "#0f172a",
    accentHex: "#2563eb",
    bgSoft: "#f1f5f9",
    borderHex: "#cbd5e1",
  },
  forest: {
    name: "Zümrüt Orman (Forest)",
    description: "Doğallık, dinginlik ve sağlık tonu.",
    primaryHex: "#064e3b",
    accentHex: "#059669",
    bgSoft: "#ecfdf5",
    borderHex: "#a7f3d0",
  },
  rose: {
    name: "Zarif Gül (Rose)",
    description: "Sıcak, estetik ve premium gül kurusu.",
    primaryHex: "#881337",
    accentHex: "#e11d48",
    bgSoft: "#fff1f2",
    borderHex: "#fecdd3",
  },
  slate: {
    name: "Arduvaz Taş (Slate)",
    description: "Modern, minimalist ve tarafsız gri-füme.",
    primaryHex: "#334155",
    accentHex: "#64748b",
    bgSoft: "#f8fafc",
    borderHex: "#cbd5e1",
  },
};

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  TRY: "₺",
  EUR: "€",
  USD: "$",
};

export function ClinicSettingsView({
  initialSettings,
  userEmail,
  workspaceId,
}: ClinicSettingsViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("pdf");
  const [settings, setSettings] = useState<ClinicSettings>(initialSettings);
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [uploadingKind, setUploadingKind] = useState<string | null>(null);

  const logoInputId = useId();
  const coverInputId = useId();
  const doctorInputId = useId();

  const currentPalette = PALETTE_CONFIGS[settings.palette] || PALETTE_CONFIGS.navy;
  const currencySymbol = CURRENCY_SYMBOLS[settings.currency] || "₺";

  const handleFieldChange = <K extends keyof ClinicSettings>(
    field: K,
    val: ClinicSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [field]: val }));
    setSaveStatus("idle");
  };

  const handleDoctorChange = <K extends keyof ClinicSettings["doctor"]>(
    field: K,
    val: ClinicSettings["doctor"][K]
  ) => {
    setSettings((prev) => ({
      ...prev,
      doctor: {
        ...prev.doctor,
        [field]: val,
      },
    }));
    setSaveStatus("idle");
  };

  // Save Settings Action
  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setStatusMessage("");

    startTransition(async () => {
      const res = await updateClinicSettingsAction(settings);
      if (res.success && res.data) {
        setSettings(res.data);
        setSaveStatus("success");
        setStatusMessage("Değişiklikler başarıyla kaydedildi.");
        setTimeout(() => setSaveStatus("idle"), 4000);
      } else {
        setSaveStatus("error");
        setStatusMessage(res.error || "Ayarlar kaydedilirken bir hata oluştu.");
      }
    });
  };

  // Image File Upload Helper
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    kind: "logo" | "cover" | "doctor"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingKind(kind);
    setStatusMessage("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", kind);

    const res = await uploadMediaAction(formData);
    setUploadingKind(null);

    if (res.success && res.data?.key) {
      if (kind === "logo") {
        handleFieldChange("logoKey", res.data.key);
      } else if (kind === "cover") {
        handleFieldChange("coverKey", res.data.key);
      } else if (kind === "doctor") {
        handleDoctorChange("photoKey", res.data.key);
      }
      setSaveStatus("success");
      setStatusMessage(`${kind === "logo" ? "Logo" : kind === "cover" ? "Kapak" : "Hekim fotoğrafı"} başarıyla yüklendi.`);
      setTimeout(() => setSaveStatus("idle"), 4000);
    } else {
      setSaveStatus("error");
      setStatusMessage(res.error || "Dosya yüklenirken bir hata oluştu.");
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Üst Başlık & Sekme Çubuğu */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Klinik Ayarları & Marka Kimliği
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            {userEmail} • Workspace ID: {workspaceId} • Hastalarınıza sunulacak kurumsal PDF şablonunu ve klinik profilinizi yapılandırın.
          </p>
        </div>

        {/* Bildirim Çubuğu */}
        {saveStatus !== "idle" && (
          <div
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold ${
              saveStatus === "success"
                ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            {saveStatus === "success" ? (
              <CheckCircle2 className="size-4 text-emerald-600" />
            ) : null}
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      {/* Modern Sekme (Tab) Menüsü */}
      <div className="flex overflow-x-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xs gap-1.5">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
            activeTab === "general"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <Building2 className="size-3.5" />
          <span>Genel Bilgiler</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("media")}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
            activeTab === "media"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <ImageIcon className="size-3.5" />
          <span>Medya & Logo Yükleme</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("doctor")}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
            activeTab === "doctor"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <UserCheck className="size-3.5" />
          <span>Hekim Profili</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("pdf")}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
            activeTab === "pdf"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <FileCheck2 className="size-3.5" />
          <span>PDF Şablonu (Canlı Önizleme)</span>
        </button>
      </div>

      {/* 1. SEKME: GENEL BİLGİLER */}
      {activeTab === "general" && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
            <h3 className="text-base font-bold text-slate-900">
              Temel İletişim ve Klinik Bilgileri
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Bu bilgiler hastalarınıza iletilecek PDF planlarının antetinde ve portalında görünür.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Klinik Adı *
                </label>
                <input
                  type="text"
                  value={settings.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  placeholder="Örn: DentArt Ağız ve Diş Sağlığı"
                  required
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Kurumsal Slogan
                </label>
                <input
                  type="text"
                  value={settings.slogan}
                  onChange={(e) => handleFieldChange("slogan", e.target.value)}
                  placeholder="Örn: Gülüşünüz Estetikle Buluşuyor"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Telefon Numarası
                </label>
                <div className="relative mt-1.5">
                  <Phone className="pointer-events-none absolute left-3.5 top-3 size-4 text-slate-400" />
                  <input
                    type="text"
                    value={settings.phone}
                    onChange={(e) => handleFieldChange("phone", e.target.value)}
                    placeholder="+90 212 000 00 00"
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Kurumsal E-posta
                </label>
                <div className="relative mt-1.5">
                  <Mail className="pointer-events-none absolute left-3.5 top-3 size-4 text-slate-400" />
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    placeholder="info@dentart.com"
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Web Sitesi
                </label>
                <div className="relative mt-1.5">
                  <Globe className="pointer-events-none absolute left-3.5 top-3 size-4 text-slate-400" />
                  <input
                    type="text"
                    value={settings.website}
                    onChange={(e) => handleFieldChange("website", e.target.value)}
                    placeholder="https://www.dentart.com"
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Çalışma Gün ve Saatleri
                </label>
                <input
                  type="text"
                  value={settings.hours}
                  onChange={(e) => handleFieldChange("hours", e.target.value)}
                  placeholder="Hafta içi: 09:00 - 19:00, Cmt: 09:00 - 16:00"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-hidden"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Klinik Açık Adresi
                </label>
                <div className="relative mt-1.5">
                  <MapPin className="pointer-events-none absolute left-3.5 top-3 size-4 text-slate-400" />
                  <textarea
                    rows={2}
                    value={settings.address}
                    onChange={(e) => handleFieldChange("address", e.target.value)}
                    placeholder="Levent Mah. Nispetiye Cad. No:12 Beşiktaş / İstanbul"
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Google Harita Linki (Map URL)
                </label>
                <input
                  type="text"
                  value={settings.mapUrl}
                  onChange={(e) => handleFieldChange("mapUrl", e.target.value)}
                  placeholder="https://maps.google.com/..."
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              <span>Genel Bilgileri Kaydet</span>
            </button>
          </div>
        </form>
      )}

      {/* 2. SEKME: MEDYA & LOGO YÜKLEME */}
      {activeTab === "media" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
            <h3 className="text-base font-bold text-slate-900">
              Görsel Varlıklar & Marka Logoları
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Klinik logonuzu ve sunumlarda kullanılacak kapak fotoğraflarını yükleyin.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Logo Yükleme */}
              <div className="flex flex-col justify-between rounded-xl border border-slate-200 p-5 bg-slate-50/50">
                <div>
                  <span className="text-xs font-bold text-slate-900">1. Kurumsal Logo</span>
                  <p className="mt-1 text-[11px] text-slate-500">
                    PDF antetinde ve hasta portalında kullanılır.
                  </p>
                  <div className="mt-4 flex h-32 w-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white">
                    {settings.logoKey ? (
                      <div className="text-center p-2">
                        <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                          {settings.logoKey}
                        </span>
                        <p className="mt-1 text-[10px] text-slate-400">Yüklü Logo</p>
                      </div>
                    ) : (
                      <div className="text-center text-slate-400">
                        <ImageIcon className="mx-auto size-8 text-slate-300" />
                        <span className="mt-1 block text-xs">Logo yüklenmedi</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <input
                    id={logoInputId}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "logo")}
                    className="hidden"
                  />
                  <label
                    htmlFor={logoInputId}
                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
                  >
                    {uploadingKind === "logo" ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Upload className="size-3.5" />
                    )}
                    <span>Logo Seç & Yükle</span>
                  </label>
                </div>
              </div>

              {/* Kapak Görseli */}
              <div className="flex flex-col justify-between rounded-xl border border-slate-200 p-5 bg-slate-50/50">
                <div>
                  <span className="text-xs font-bold text-slate-900">2. Kapak Fotoğrafı</span>
                  <p className="mt-1 text-[11px] text-slate-500">
                    24 sayfalık PDF&apos;in 1. kapağında yer alır.
                  </p>
                  <div className="mt-4 flex h-32 w-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white">
                    {settings.coverKey ? (
                      <div className="text-center p-2">
                        <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                          {settings.coverKey}
                        </span>
                        <p className="mt-1 text-[10px] text-slate-400">Yüklü Kapak</p>
                      </div>
                    ) : (
                      <div className="text-center text-slate-400">
                        <ImageIcon className="mx-auto size-8 text-slate-300" />
                        <span className="mt-1 block text-xs">Kapak yüklenmedi</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <input
                    id={coverInputId}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "cover")}
                    className="hidden"
                  />
                  <label
                    htmlFor={coverInputId}
                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
                  >
                    {uploadingKind === "cover" ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Upload className="size-3.5" />
                    )}
                    <span>Kapak Seç & Yükle</span>
                  </label>
                </div>
              </div>

              {/* Tanıtım / About Görseli */}
              <div className="flex flex-col justify-between rounded-xl border border-slate-200 p-5 bg-slate-50/50">
                <div>
                  <span className="text-xs font-bold text-slate-900">3. Klinik Tanıtım Görseli</span>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Klinik içi veya ekip fotoğrafı.
                  </p>
                  <div className="mt-4 flex h-32 w-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white">
                    {settings.aboutKey ? (
                      <div className="text-center p-2">
                        <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                          {settings.aboutKey}
                        </span>
                        <p className="mt-1 text-[10px] text-slate-400">Yüklü Görsel</p>
                      </div>
                    ) : (
                      <div className="text-center text-slate-400">
                        <ImageIcon className="mx-auto size-8 text-slate-300" />
                        <span className="mt-1 block text-xs">Görsel yüklenmedi</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      const key = prompt("Doğrudan Asset Key girin:", settings.aboutKey);
                      if (key !== null) handleFieldChange("aboutKey", key);
                    }}
                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
                  >
                    <span>Key Düzenle</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={isPending}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              <span>Değişiklikleri Kaydet</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. SEKME: HEKİM PROFİLİ */}
      {activeTab === "doctor" && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
            <h3 className="text-base font-bold text-slate-900">
              Sorumlu Hekim ve İmza Yetkilisi
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Hastalarınıza sunulan tedavi planlarında onaylayıcı hekim kartı olarak gösterilir.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Hekim Adı ve Soyadı *
                </label>
                <input
                  type="text"
                  value={settings.doctor.name}
                  onChange={(e) => handleDoctorChange("name", e.target.value)}
                  placeholder="Örn: Dr. Dt. Selim Aydın"
                  required
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Uzmanlık & Ana Unvan
                </label>
                <input
                  type="text"
                  value={settings.doctor.title}
                  onChange={(e) => handleDoctorChange("title", e.target.value)}
                  placeholder="Örn: Protetik Diş Tedavisi Uzmanı & Başhekim"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Alt Başlık / İkinci Unvan
                </label>
                <input
                  type="text"
                  value={settings.doctor.subtitle}
                  onChange={(e) => handleDoctorChange("subtitle", e.target.value)}
                  placeholder="Örn: İmplantoloji ve Estetik Diş Hekimi"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  İmza Yetkilisi Başlığı (PDF Alt İmza)
                </label>
                <input
                  type="text"
                  value={settings.signerTitle}
                  onChange={(e) => handleFieldChange("signerTitle", e.target.value)}
                  placeholder="Örn: Klinik Direktörü & Başhekim"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-hidden"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Hekim Kısa Biyografisi (PDF Hekim Tanıtım Sayfası)
                </label>
                <textarea
                  rows={3}
                  value={settings.doctor.bio}
                  onChange={(e) => handleDoctorChange("bio", e.target.value)}
                  placeholder="15 yılı aşkın süredir ileri cerrahi ve gülüş estetiği alanında uluslararası vakaları yönetmektedir..."
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-hidden"
                />
              </div>

              {/* Hekim Portre Fotoğrafı */}
              <div className="md:col-span-2 flex flex-col md:flex-row items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="size-16 rounded-full border border-slate-300 bg-white flex items-center justify-center overflow-hidden font-bold text-slate-400">
                  {settings.doctor.photoKey ? (
                    <span className="text-[10px] font-mono text-blue-600">Fotoğraf</span>
                  ) : (
                    <UserCheck className="size-8 text-slate-300" />
                  )}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <span className="text-xs font-semibold text-slate-900">Hekim Portre Fotoğrafı</span>
                  <p className="text-[11px] text-slate-500">
                    PDF hasta sunumu ve hekim kartında yer alır.
                  </p>
                </div>
                <div>
                  <input
                    id={doctorInputId}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "doctor")}
                    className="hidden"
                  />
                  <label
                    htmlFor={doctorInputId}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-100"
                  >
                    {uploadingKind === "doctor" ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Upload className="size-3.5" />
                    )}
                    <span>Fotoğraf Yükle</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              <span>Hekim Bilgilerini Kaydet</span>
            </button>
          </div>
        </form>
      )}

      {/* 4. SEKME: PDF ŞABLONU (İKİYE BÖLÜNMÜŞ EKRAN / SPLIT-SCREEN) */}
      {activeTab === "pdf" && (
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* Sol Kolon: Şablon Ayar Butonları */}
          <div className="space-y-6 lg:col-span-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              {/* 1. Belge Resmi Dili */}
              <div>
                <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                  1. Belge Dili
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  PDF belgesinin başlıkları, açıklamaları ve terimleri bu dilde oluşturulur.
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleFieldChange("locale", "tr" as Locale)}
                    className={`cursor-pointer rounded-xl border p-3 text-center text-xs font-semibold transition ${
                      settings.locale === "tr"
                        ? "border-slate-900 bg-slate-900 text-white shadow-xs"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    Türkçe (tr)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFieldChange("locale", "en" as Locale)}
                    className={`cursor-pointer rounded-xl border p-3 text-center text-xs font-semibold transition ${
                      settings.locale === "en"
                        ? "border-slate-900 bg-slate-900 text-white shadow-xs"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    English (en)
                  </button>
                </div>
              </div>

              {/* 2. Para Birimi */}
              <div className="mt-6 border-t border-slate-100 pt-6">
                <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                  2. Fiyat Para Birimi (Kur)
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Tedavi kalemlerinin varsayılan fiyatlandırma para birimi.
                </p>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {(["TRY", "EUR", "USD"] as Currency[]).map((curr) => (
                    <button
                      key={curr}
                      type="button"
                      onClick={() => handleFieldChange("currency", curr)}
                      className={`cursor-pointer rounded-xl border p-3 text-center text-xs font-semibold transition ${
                        settings.currency === curr
                          ? "border-slate-900 bg-slate-900 text-white shadow-xs"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      {CURRENCY_SYMBOLS[curr]} {curr}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Renk Paleti (Kapalı Set) */}
              <div className="mt-6 border-t border-slate-100 pt-6">
                <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                  3. Kurumsal Renk Paleti
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  PDF anteti, tabloları ve vurgularını tek tıkla kurumsal renklerinize uyarlayın.
                </p>

                <div className="mt-3 space-y-2.5">
                  {(Object.keys(PALETTE_CONFIGS) as Palette[]).map((palKey) => {
                    const pal = PALETTE_CONFIGS[palKey];
                    const isSelected = settings.palette === palKey;

                    return (
                      <button
                        key={palKey}
                        type="button"
                        onClick={() => handleFieldChange("palette", palKey)}
                        className={`w-full cursor-pointer rounded-xl border p-3.5 text-left transition ${
                          isSelected
                            ? "border-slate-900 bg-slate-50/80 ring-1 ring-slate-900 shadow-2xs"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span
                              className="size-5 rounded-full border border-black/10 shadow-2xs"
                              style={{ backgroundColor: pal.primaryHex }}
                            />
                            <div>
                              <span className="text-xs font-bold text-slate-900">
                                {pal.name}
                              </span>
                              <p className="text-[11px] text-slate-500">
                                {pal.description}
                              </p>
                            </div>
                          </div>
                          {isSelected && (
                            <span className="text-xs font-semibold text-slate-900">
                              ✓ Seçili
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Kurumsal Ön Yazı & Notlar */}
              <div className="mt-6 border-t border-slate-100 pt-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Hasta Karşılama Ön Yazısı
                  </label>
                  <textarea
                    rows={2}
                    value={settings.welcomeBody || settings.intro}
                    onChange={(e) => {
                      handleFieldChange("welcomeBody", e.target.value);
                      handleFieldChange("intro", e.target.value);
                    }}
                    placeholder="Sayın hastamız, kliniğimizde yapılan detaylı muayene neticesinde size özel hazırlanan tedavi planı sunulmuştur..."
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Yasal Bilgilendirme ve KVKK Notu
                  </label>
                  <textarea
                    rows={2}
                    value={settings.legal}
                    onChange={(e) => handleFieldChange("legal", e.target.value)}
                    placeholder="İşbu tedavi planı hekim muayenesi sonrası ön tanı niteliğindedir. Tedavi süreçlerinde hekim kararıyla revizyon yapılabilir."
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Kaydet Butonu */}
              <div className="mt-6 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => handleSave()}
                  disabled={isPending}
                  className="w-full inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50 transition"
                >
                  {isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  <span>Şablon Değişikliklerini Kaydet</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sağ Kolon: Sticky Beyaz A4 Formunda Canlı PDF Önizleme */}
          <div className="lg:col-span-6 lg:sticky lg:top-6">
            <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
                Canlı PDF Önizlemesi
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-600">
                A4 Sayfa 1 / 24
              </span>
            </div>

            {/* A4 Kağıt Kartı */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-7 shadow-xl">
              {/* Kurumsal Renk Üst Çizgisi */}
              <div
                className="h-1.5 w-full rounded-full transition-colors duration-300"
                style={{ backgroundColor: currentPalette.primaryHex }}
              />

              {/* Antet Başlığı */}
              <div className="mt-5 flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="flex size-11 items-center justify-center rounded-xl font-bold text-white shadow-xs transition-colors duration-300"
                    style={{ backgroundColor: currentPalette.primaryHex }}
                  >
                    {settings.name ? settings.name.charAt(0).toUpperCase() : "D"}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {settings.name || "Klinik Adı"}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {settings.slogan || "Gülüşünüz Estetikle Buluşuyor"}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {settings.phone || "+90 212 000 00 00"}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className="inline-block rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase"
                    style={{
                      backgroundColor: currentPalette.bgSoft,
                      color: currentPalette.primaryHex,
                    }}
                  >
                    {settings.locale === "en" ? "TREATMENT PLAN" : "TEDAVİ PLANI"}
                  </span>
                  <p className="mt-1 text-[10px] text-slate-400">
                    Tarih: {new Date().toLocaleDateString("tr-TR")}
                  </p>
                  <p className="text-[10px] text-slate-400">No: #TP-2026-001</p>
                </div>
              </div>

              {/* Hasta Karşılama */}
              <div className="mt-4 rounded-lg bg-slate-50/70 p-3 text-[11px] leading-relaxed text-slate-600">
                {settings.welcomeBody ||
                  "Değerli hastamız, size özel hazırlanan tedavi planı ve seans detayları aşağıda sunulmuştur."}
              </div>

              {/* Örnek Tedavi Tablosu */}
              <div className="mt-5 overflow-hidden rounded-lg border border-slate-100">
                <table className="w-full text-left text-[11px]">
                  <thead
                    style={{
                      backgroundColor: currentPalette.bgSoft,
                      color: currentPalette.primaryHex,
                    }}
                    className="font-bold border-b border-slate-100"
                  >
                    <tr>
                      <th className="px-3 py-2">
                        {settings.locale === "en" ? "Procedure" : "İşlem / Tedavi"}
                      </th>
                      <th className="px-3 py-2 text-center">
                        {settings.locale === "en" ? "Session" : "Seans"}
                      </th>
                      <th className="px-3 py-2 text-right">
                        {settings.locale === "en" ? "Amount" : "Tutar"} ({settings.currency})
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    <tr>
                      <td className="px-3 py-2 font-medium text-slate-900">
                        Titanyum İmplant Tedavisi (SLA)
                      </td>
                      <td className="px-3 py-2 text-center text-slate-500">1. Seans</td>
                      <td className="px-3 py-2 text-right font-semibold text-slate-900">
                        {currencySymbol} 18.000
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-medium text-slate-900">
                        Zirkonyum Kuron Kaplama (CAD/CAM)
                      </td>
                      <td className="px-3 py-2 text-center text-slate-500">2. Seans</td>
                      <td className="px-3 py-2 text-right font-semibold text-slate-900">
                        {currencySymbol} 12.500
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-medium text-slate-900">
                        Panoramik Röntgen ve 3D Analiz
                      </td>
                      <td className="px-3 py-2 text-center text-slate-500">Dahil</td>
                      <td className="px-3 py-2 text-right font-semibold text-slate-900">
                        {currencySymbol} 0
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Toplam Tutar Alanı */}
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                <span className="text-slate-500">
                  {settings.locale === "en" ? "Grand Total:" : "Genel Toplam:"}
                </span>
                <span
                  className="text-base font-extrabold tracking-tight"
                  style={{ color: currentPalette.primaryHex }}
                >
                  {currencySymbol} 30.500
                </span>
              </div>

              {/* Alt İmza & Hekim Alanı */}
              <div className="mt-6 flex items-end justify-between border-t border-slate-100 pt-4 text-[10px] text-slate-500">
                <div>
                  <p className="font-semibold text-slate-700">
                    {settings.doctor.name || "Dr. Dt. Sorumlu Hekim"}
                  </p>
                  <p className="text-slate-400">
                    {settings.signerTitle || settings.doctor.title || "Klinik Direktörü"}
                  </p>
                </div>
                <div className="text-right">
                  <div className="h-6 w-20 border-b border-dashed border-slate-300" />
                  <span className="text-[9px] text-slate-400">Kaşe & İmza</span>
                </div>
              </div>

              {/* Alt Filigran */}
              <div className="mt-4 text-center text-[9px] text-slate-300">
                Treatment Plus Clinical Systems • 24 Sayfalık Kurumsal Wise PDF
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
