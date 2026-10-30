"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Lock,
  MessageCircle,
  Phone,
  QrCode,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Unlock,
} from "lucide-react";
import type { ClinicBrandInfo, PatientInfo, StudioPlanItem, StudioVisit } from "./types";

interface OverviewModuleProps {
  patient: PatientInfo;
  clinic: ClinicBrandInfo;
  items: StudioPlanItem[];
  visits: StudioVisit[];
  currency?: "EUR" | "USD" | "TRY";
  onPatientDobChange?: (dob: string) => void;
}

export function OverviewModule({
  patient,
  clinic,
  items,
  visits,
  currency = "EUR",
  onPatientDobChange,
}: OverviewModuleProps) {
  // Security date of birth lock state
  const [dobInput, setDobInput] = useState(patient.dob || "1988-06-15");
  const [isCopied, setIsCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // Phone Mockup interactive states
  const [mobileLocked, setMobileLocked] = useState(true);
  const [mobileEnteredDob, setMobileEnteredDob] = useState("");
  const [mobileAuthError, setMobileAuthError] = useState(false);
  const [mobileStep, setMobileStep] = useState<"welcome" | "plan">("welcome");

  const currSymbol = currency === "EUR" ? "€" : currency === "USD" ? "$" : "₺";
  const subtotal = items.reduce((acc, it) => acc + (it.unitPrice || 0) * (it.quantity || 1), 0);

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/p/demo-${patient.id || "smith"}`
    : "https://treatment.clinic/p/demo-smith";

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(shareUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleVerifyMobileDob = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileEnteredDob.trim() === dobInput.trim()) {
      setMobileLocked(false);
      setMobileAuthError(false);
    } else {
      setMobileAuthError(true);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left 6 Cols: Realistic iPhone Mobile Simulator (Exact match to Image 3) */}
      <div className="lg:col-span-6 flex flex-col items-center">
        <div className="text-center mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Hasta Cep Telefonu Önizlemesi (Mobile Microsite Preview)
          </span>
          <p className="text-[11px] text-slate-400">
            Hastanın kendi telefonunda göreceği canlı KVKK güvenlikli arayüz
          </p>
        </div>

        {/* iPhone Frame */}
        <div className="relative w-[340px] sm:w-[360px] h-[700px] rounded-[52px] bg-slate-950 p-3.5 shadow-2xl ring-1 ring-white/20 border-4 border-slate-800">
          {/* Dynamic Island / Speaker Notch */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-40 flex items-center justify-center">
            <div className="size-2 rounded-full bg-slate-900 border border-slate-800 mr-3"></div>
            <div className="size-2.5 rounded-full bg-slate-900 border border-slate-800"></div>
          </div>

          {/* Screen Display Container */}
          <div className="relative w-full h-full rounded-[40px] bg-white overflow-hidden overflow-y-auto select-none font-sans flex flex-col justify-between scrollbar-none">
            {/* Top Status Bar */}
            <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md px-6 pt-3 pb-1 flex items-center justify-between text-[11px] font-bold text-slate-800">
              <span>09:41</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px]">5G</span>
                <div className="w-5 h-2.5 border border-slate-700 rounded-xs p-0.5 flex items-center">
                  <div className="w-full h-full bg-slate-900 rounded-2xs"></div>
                </div>
              </div>
            </div>

            {/* SCREEN CONTENT: 1. LOCKED (KVKK / GDPR DoB verification) */}
            {mobileLocked ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="size-16 rounded-3xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shadow-xs">
                  <Lock className="size-8" />
                </div>

                <div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 mb-2">
                    <ShieldCheck className="size-3 text-emerald-600" />
                    KVKK & GDPR Güvenlik Katmanı
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    Kişisel Tedavi Planı Doğrulaması
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                    Sağlık verilerinizin gizliliği için lütfen kliniğe bildirdiğiniz <strong>Doğum Tarihinizi</strong> giriniz.
                  </p>
                </div>

                <form onSubmit={handleVerifyMobileDob} className="w-full space-y-3 pt-2">
                  <div>
                    <input
                      type="date"
                      value={mobileEnteredDob}
                      onChange={(e) => {
                        setMobileEnteredDob(e.target.value);
                        setMobileAuthError(false);
                      }}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-center text-xs font-bold text-slate-900 shadow-2xs focus:border-slate-900 focus:outline-hidden"
                      placeholder="YYYY-MM-DD"
                    />
                    {mobileAuthError && (
                      <p className="mt-1 text-[11px] font-medium text-rose-600">
                        Doğrulama başarısız. ({dobInput} giriniz)
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-slate-900 py-3 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition active:scale-95 cursor-pointer"
                  >
                    Giriş Yap & Planı Gör
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileEnteredDob(dobInput);
                      setMobileLocked(false);
                    }}
                    className="text-[10px] text-slate-500 hover:text-slate-900 underline font-semibold"
                  >
                    (Demo: Otomatik Doldur & Aç)
                  </button>
                </form>
              </div>
            ) : mobileStep === "welcome" ? (
              /* SCREEN CONTENT: 2. WELCOME SCREEN (Image 3 exact match) */
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  {/* Smiling Patient Hero Photo */}
                  <div className="relative h-64 w-full bg-slate-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/patient-hero.jpg"
                      alt="Bright Smile"
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=600&q=80";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/30"></div>

                    {/* Logo Overlay on Photo (Image 3) */}
                    <div className="absolute bottom-4 left-6 right-6 text-center">
                      <div className="inline-block text-lg font-serif font-black tracking-tight text-slate-900">
                        {clinic.name || "Bright Tooth"}
                      </div>
                      <div className="text-[10px] uppercase font-bold tracking-widest text-slate-600">
                        DENTAL CLINIC
                      </div>
                    </div>
                  </div>

                  {/* Welcome Texts */}
                  <div className="p-6 text-center space-y-3">
                    <div>
                      <div className="text-xs font-serif italic text-slate-500">A Warm</div>
                      <h2 className="text-2xl font-black uppercase tracking-tight text-cyan-900">
                        WELCOME
                      </h2>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      Sayın <strong>{patient.name || "Mr. Smith"}</strong>, kliniğimiz tarafından sizin için hazırlanan dijital tedavi planlamasını ve 3D simülasyonu aşağıdan inceleyebilirsiniz.
                    </p>

                    {/* Clinic Highlights */}
                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <div className="rounded-xl bg-slate-50 p-2 border border-slate-100">
                        <div className="text-xs font-bold text-slate-900">{clinic.stats.satisfactionRate}</div>
                        <div className="text-[9px] text-slate-500">Memnuniyet</div>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-2 border border-slate-100">
                        <div className="text-xs font-bold text-slate-900">{clinic.stats.yearsExperience}</div>
                        <div className="text-[9px] text-slate-500">Deneyim</div>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-2 border border-slate-100">
                        <div className="text-xs font-bold text-slate-900">5.0 ★</div>
                        <div className="text-[9px] text-slate-500">Google Skoru</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Midnight Blue CTA Button (Patient Microsite) */}
                <div className="p-6 pt-0">
                  <button
                    type="button"
                    onClick={() => setMobileStep("plan")}
                    className="w-full rounded-2xl bg-slate-900 hover:bg-slate-800 py-3.5 px-4 text-xs font-black uppercase tracking-wider text-white shadow-md transition cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>SEE THE POSSIBILITIES</span>
                    <ArrowRight className="size-4" />
                  </button>
                  <span className="block text-center text-[10px] text-slate-400 mt-2">
                    Tedavi Olasılıklarını ve Detayları İncele
                  </span>
                </div>
              </div>
            ) : (
              /* SCREEN CONTENT: 3. FULL PATIENT MICROSITE EXPERIENCE */
              <div className="flex-1 p-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <button
                    type="button"
                    onClick={() => setMobileStep("welcome")}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900"
                  >
                    ‹ Karşılama Ekranı
                  </button>
                  <span className="rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 border border-emerald-200">
                    Aktif Plan
                  </span>
                </div>

                {/* Patient Summary Card */}
                <div className="rounded-2xl bg-slate-900 text-white p-4 shadow-sm">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400">
                    Tedavi Planı Özeti
                  </span>
                  <div className="text-base font-bold mt-0.5">{patient.name || "Mr. Smith"}</div>
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                    <span className="text-slate-400">Toplam Bütçe</span>
                    <span className="font-bold text-white text-sm">
                      {currSymbol} {subtotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Treatments List in Phone */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Uygulanacak Tedaviler ({items.length})
                  </div>
                  <div className="space-y-1.5">
                    {items.slice(0, 4).map((it) => (
                      <div
                        key={it.id}
                        className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-semibold text-slate-800">{it.treatmentName}</div>
                          <div className="text-[10px] text-slate-500">
                            Diş: {it.teeth.join(", ")}
                          </div>
                        </div>
                        <span className="font-bold text-slate-900">
                          {it.unitPrice ? `${currSymbol} ${it.unitPrice}` : "Dahil"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact CTA */}
                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    className="w-full rounded-xl bg-emerald-600 text-white py-2.5 text-xs font-bold shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle className="size-4" />
                    WhatsApp ile Danış
                  </button>
                  <button
                    type="button"
                    className="w-full rounded-xl border border-slate-200 text-slate-700 py-2 text-xs font-semibold"
                  >
                    Kliniği Ara ({clinic.phone || "+90 212 555 0100"})
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Home Indicator */}
            <div className="py-2 flex justify-center">
              <div className="w-28 h-1 bg-slate-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Right 6 Cols: Security Configuration & Sharing Controls (Image 3 right side) */}
      <div className="lg:col-span-6 space-y-6">
        {/* GDPR / HIPAA Compliance Card (Exact match to Image 3) */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              KVKK & GDPR Hasta Güvenlik Katmanı
            </h3>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            To ensure HIPAA &amp; GDPR compliance secure the patient&apos;s microsite.
            <br />
            (Hastanın sağlık ve kişisel verilerini korumak için mikro site erişimini Doğum Tarihi ile şifreleyin.)
          </p>

          {/* Date of Birth Form (Matching Image 3: [Date of birth] [ éééé. hh. nn. 📅 ]) */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
            <span className="text-xs font-bold text-slate-700 whitespace-nowrap min-w-[100px]">
              Date of birth :
            </span>
            <div className="relative flex-1">
              <input
                type="date"
                value={dobInput}
                onChange={(e) => {
                  setDobInput(e.target.value);
                  onPatientDobChange?.(e.target.value);
                }}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 shadow-2xs focus:border-slate-900 focus:bg-white focus:outline-hidden transition"
              />
            </div>
          </div>

          {/* Create the link button (Image 3: CREATE THE LINK >) */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-900 px-6 py-3 text-xs font-bold text-white shadow-md transition cursor-pointer active:scale-95"
            >
              {isCopied ? (
                <>
                  <Check className="size-4 text-emerald-400" />
                  <span>Bağlantı Kopyalandı!</span>
                </>
              ) : (
                <>
                  <span>CREATE THE LINK</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Share Link Actions Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Paylaşım ve Dağıtım Seçenekleri
          </div>

          <div className="space-y-3">
            {/* Share URL input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-600 select-all"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                title="Kopyala"
              >
                <Copy className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                title="QR Kod"
              >
                <QrCode className="size-4" />
              </button>
            </div>

            {/* Direct WhatsApp Share */}
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `Sayın ${patient.name || "Hastamız"}, kişisel tedavi planınızı incelemek için bağlantıya tıklayınız (Doğum tarihiniz ile giriş yapabilirsiniz): ${shareUrl}`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2.5 px-4 text-xs font-bold text-white shadow-xs transition"
            >
              <MessageCircle className="size-4" />
              <span>WhatsApp ile Hastaya İlet</span>
            </a>
          </div>
        </div>

        {/* Clinic Branding Settings Overview */}
        <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 space-y-3 text-xs">
          <div className="font-bold text-slate-800">Klinik Karşılama Bilgileri</div>
          <div className="grid grid-cols-2 gap-3 text-slate-600">
            <div>
              <span className="block font-medium text-slate-400 text-[10px]">Klinik Adı</span>
              <span className="font-bold text-slate-900">{clinic.name}</span>
            </div>
            <div>
              <span className="block font-medium text-slate-400 text-[10px]">Sorumlu Hekim</span>
              <span className="font-bold text-slate-900">{clinic.doctorName}</span>
            </div>
            <div>
              <span className="block font-medium text-slate-400 text-[10px]">İletişim Tel</span>
              <span className="font-bold text-slate-900">{clinic.phone}</span>
            </div>
            <div>
              <span className="block font-medium text-slate-400 text-[10px]">Hasta Adı</span>
              <span className="font-bold text-slate-900">{patient.name || "Mr. Smith"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center space-y-4 shadow-2xl">
            <h4 className="text-sm font-bold text-slate-900">Hasta QR Kodu</h4>
            <div className="mx-auto size-48 bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  shareUrl
                )}`}
                alt="QR Code"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-xs text-slate-500">
              Hasta telefon kamerasını QR koda doğrultarak planı doğrudan açabilir.
            </p>
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

