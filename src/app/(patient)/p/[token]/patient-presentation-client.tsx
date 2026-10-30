"use client";

import React, { useEffect, useState, useTransition } from "react";
import {
  Award,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  ExternalLink,
  FileDown,
  FileText,
  HeartHandshake,
  Info,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  Play,
  RotateCcw,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  X,
} from "lucide-react";

import type { UltimatePlanDTO } from "@/modules/share/domain/share";
import { acceptPublicPlanAction, recordPublicEventAction } from "@/app/(clinic)/app/plans/actions";

interface Props {
  data: UltimatePlanDTO;
  token: string;
}

function formatCurrency(amountKurus?: number, currency: string = "TRY"): string {
  const major = (amountKurus || 0) / 100;
  const symbol = currency === "EUR" ? "€" : currency === "USD" ? "$" : "₺";
  return (
    new Intl.NumberFormat("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(major) +
    " " +
    symbol
  );
}

export function PatientPresentationClient({ data, token }: Props) {
  const plan = data?.plan || ({} as any);
  const clinic = data?.clinic || ({} as any);
  const initialAccepted = Boolean(data?.accepted);
  const initialAcceptedAt = data?.accepted_at;
  const initialSignature = data?.signature || "";

  const visits = Array.isArray(plan?.visits) ? plan.visits : [];
  const doctor = clinic?.doctor || {};
  const doctorStats = Array.isArray(doctor?.stats) ? doctor.stats : [];
  const reviews = Array.isArray(clinic?.reviews) ? clinic.reviews : [];
  const cta = clinic?.cta || {
    whatsapp_number: "",
    whatsapp_message: "",
    phone_number: "",
    booking_url: "",
    enable_acceptance: true,
  };

  const [accepted, setAccepted] = useState(initialAccepted);
  const [acceptedAt, setAcceptedAt] = useState(initialAcceptedAt);
  const [signature, setSignature] = useState(initialSignature);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [signatureInput, setSignatureInput] = useState(plan?.patient_name || "");
  const [isAccepting, startAccepting] = useTransition();
  const [acceptError, setAcceptError] = useState<string | null>(null);

  // 3D Player Modal state
  const [show3DModal, setShow3DModal] = useState(false);

  // Send telemetry: opened
  useEffect(() => {
    if (!token) return;
    recordPublicEventAction(token, "opened", {
      screen_width: typeof window !== "undefined" ? window.innerWidth : 0,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    });
  }, [token]);

  const handleTrackCTA = (ctaType: string) => {
    recordPublicEventAction(token, "cta", { cta: ctaType });
  };

  const handleTrackPdfDownload = () => {
    recordPublicEventAction(token, "pdf_downloaded", {});
  };

  const handleOpen3D = () => {
    recordPublicEventAction(token, "viz_played", {});
    setShow3DModal(true);
  };

  const handleConfirmAccept = () => {
    if (!signatureInput.trim()) {
      setAcceptError("Lütfen onay için adınızı ve soyadınızı giriniz.");
      return;
    }

    startAccepting(async () => {
      setAcceptError(null);
      const res = await acceptPublicPlanAction(token, signatureInput.trim());
      if (res.success && res.data) {
        setAccepted(true);
        setSignature(signatureInput.trim());
        setAcceptedAt(res.data.accepted_at);
        setShowAcceptModal(false);
      } else {
        setAcceptError(res.error || "Onay kaydedilemedi, lütfen tekrar deneyiniz.");
      }
    });
  };

  const cleanPhone = (cta.phone_number || clinic?.phone || "").replace(/[^\d]/g, "");
  const cleanWhatsApp = (cta.whatsapp_number || clinic?.phone || "").replace(/[^\d]/g, "");

  const patientDisplayName = plan?.patient_name || "Değerli Hastamız";
  const clinicDisplayName = clinic?.name || "Treatment Plus";

  const waMessage = encodeURIComponent(
    `Merhaba ${clinicDisplayName}, ben ${patientDisplayName}. Bana iletilen tedavi planımı inceledim, görüşmek istiyorum.`
  );

  const waUrl = cleanWhatsApp ? `https://wa.me/${cleanWhatsApp}?text=${waMessage}` : "";

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#14241c] selection:bg-teal-700 selection:text-white pb-32">
      {/* 1. Header (Sticky) */}
      <header className="sticky top-0 z-40 bg-[#faf8f5]/90 backdrop-blur-md border-b border-[#e5dfd5] px-4 py-3.5 sm:px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {clinic?.logo_key ? (
              <img
                src={`/api/media/${clinic.logo_key}`}
                alt={clinicDisplayName}
                className="h-9 w-auto max-w-[120px] object-contain rounded-lg"
              />
            ) : (
              <div className="size-9 rounded-xl bg-teal-800 text-white font-serif font-bold text-sm flex items-center justify-center shadow-xs">
                {clinicDisplayName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-sm font-bold text-slate-900 leading-tight">
                {clinicDisplayName}
              </h1>
              {clinic?.slogan && (
                <p className="text-[11px] text-slate-500 font-medium truncate max-w-[180px] sm:max-w-xs">
                  {clinic.slogan}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => handleTrackCTA("whatsapp_header")}
                className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-700 transition"
              >
                <MessageCircle className="size-3.5" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
            )}

            {cleanPhone && (
              <a
                href={`tel:${cleanPhone}`}
                onClick={() => handleTrackCTA("phone_header")}
                className="flex size-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition"
                title="Kliniği Ara"
              >
                <Phone className="size-3.5" />
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 pt-6 sm:pt-8 space-y-6 sm:space-y-8">
        {/* 2. Hero Card */}
        <section className="relative overflow-hidden rounded-3xl border border-[#e5dfd5] bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-800">
            <Sparkles className="size-4 text-teal-600" />
            <span>Kişiselleştirilmiş Tedavi Deneyimi</span>
          </div>

          <h2 className="mt-3 font-serif text-2xl sm:text-3xl text-slate-900 font-bold tracking-tight">
            Sayın {patientDisplayName}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Kliniğimiz tarafından sizin için hazırlanan özel tedavi planı ve aşamaları.
          </p>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-100">
            <div className="rounded-2xl bg-[#f5f1ea] p-3.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Tedavi Süreci
              </span>
              <p className="mt-1 text-sm font-bold text-slate-900">
                {visits.length > 0 ? `${visits.length} Seans / Aşamalı` : "Planlanıyor"}
              </p>
            </div>

            <div className="rounded-2xl bg-[#f5f1ea] p-3.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Sorumlu Hekim
              </span>
              <p className="mt-1 text-sm font-bold text-slate-900 truncate">
                {doctor?.name || clinicDisplayName}
              </p>
            </div>

            <div className="col-span-2 sm:col-span-1 rounded-2xl bg-teal-50 border border-teal-100 p-3.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">
                Toplam Tutar
              </span>
              <p className="mt-1 text-base font-extrabold text-teal-900">
                {formatCurrency(plan?.totals_grand, plan?.currency)}
              </p>
            </div>
          </div>
        </section>

        {/* 3. Doctor's Personalized Welcome Message */}
        {(plan?.welcome_letter || clinic?.welcome_body) && (
          <section className="rounded-3xl border border-[#e5dfd5] bg-white p-6 sm:p-7 shadow-xs">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="flex size-9 items-center justify-center rounded-xl bg-teal-50 text-teal-800">
                <HeartHandshake className="size-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Hekiminizden Mesaj
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  {clinic?.signer_name || doctor?.name || clinicDisplayName}
                </h3>
              </div>
            </div>
            <div className="mt-4 text-sm leading-relaxed text-slate-700 whitespace-pre-line font-light">
              {plan?.welcome_letter || clinic?.welcome_body}
            </div>
          </section>
        )}

        {/* 4. 3D Interactive Treatment Simulation Banner (Ultimate Feature) */}
        <section className="relative overflow-hidden rounded-3xl border border-cyan-200/80 bg-gradient-to-br from-slate-900 via-slate-850 to-cyan-950 p-6 sm:p-7 text-white shadow-md">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1.5 max-w-md">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-semibold text-cyan-300 border border-cyan-500/30">
                <Sparkles className="size-3.5" />
                İnteraktif 3D Deneyim
              </span>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Diş Tedavinizi 3 Boyutlu İnceleyin
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-light">
                Tedavi basamaklarınızı 32 dişli çene modeli üzerinde 360 derece döndürerek adım adım görüntüleyin.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpen3D}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/25 hover:bg-cyan-400 transition active:scale-95 shrink-0"
            >
              <Play className="size-4 fill-slate-950" />
              <span>3D Simülasyonu Başlat</span>
            </button>
          </div>
        </section>

        {/* 5. Treatment Steps / Visits Timeline */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Planlanan Tedavi Aşamaları
              </h3>
              <p className="text-xs text-slate-500">
                Adım adım seans dökümü ve uygulanacak prosedürler
              </p>
            </div>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-2xs">
              {visits.length} Seans
            </span>
          </div>

          <div className="space-y-4">
            {visits.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#e5dfd5] bg-white p-8 text-center text-xs text-slate-500 font-light">
                Bu tedavi planına henüz seans ve kalem detayı eklenmemiş.
              </div>
            ) : (
              visits.map((visit: any, vIdx: number) => {
                const visitItems = Array.isArray(visit?.items) ? visit.items : [];
                return (
                  <div
                    key={visit.id || vIdx}
                    className="overflow-hidden rounded-3xl border border-[#e5dfd5] bg-white p-5 sm:p-6 shadow-xs space-y-4"
                  >
                    {/* Visit Header */}
                    <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                      <div>
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-teal-800">
                          {visit.phase_label || `${vIdx + 1}. Aşama`}
                        </span>
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
                          {visit.title || `${vIdx + 1}. Seans`}
                        </h4>
                      </div>
                      <span className="text-xs font-bold text-slate-500 rounded-lg bg-slate-50 px-2.5 py-1 border border-slate-200">
                        {visitItems.length} İşlem
                      </span>
                    </div>

                    {visit.healing_note && (
                      <div className="flex items-start gap-2 rounded-2xl bg-amber-50/70 border border-amber-200/80 p-3 text-xs text-amber-900">
                        <Info className="size-4 text-amber-600 shrink-0 mt-0.5" />
                        <p className="font-medium leading-relaxed">{visit.healing_note}</p>
                      </div>
                    )}

                    {/* Items in this visit */}
                    <div className="space-y-2">
                      {visitItems.length === 0 ? (
                        <p className="text-xs text-slate-400 py-1">Bu seans için işlem detayı bulunmuyor.</p>
                      ) : (
                        visitItems.map((item: any, iIdx: number) => {
                          const teeth = Array.isArray(item?.teeth) ? item.teeth : [];
                          return (
                            <div
                              key={item.id || iIdx}
                              className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-100 bg-[#faf8f5] p-3.5 gap-2 text-xs"
                            >
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="font-bold text-slate-900">
                                    {item.treatment_name || "Tedavi"}
                                  </span>
                                  {teeth.length > 0 && (
                                    <span className="rounded-md bg-teal-100 text-teal-900 px-2 py-0.5 font-mono text-[11px] font-semibold">
                                      Diş {teeth.join(", ")}
                                    </span>
                                  )}
                                  {item.is_package && (
                                    <span className="rounded-md bg-purple-100 text-purple-800 px-1.5 py-0.5 text-[10px] font-semibold">
                                      Paket
                                    </span>
                                  )}
                                </div>
                                {item.description && (
                                  <p className="text-[11px] text-slate-500">{item.description}</p>
                                )}
                                <p className="text-[11px] text-slate-400">Miktar: {item.quantity || 1}</p>
                              </div>

                              <div className="text-right sm:shrink-0 font-bold text-slate-900 text-xs sm:text-sm">
                                {item.is_package
                                  ? "Paket İçi"
                                  : formatCurrency(
                                      (item.unit_price || 0) * (item.quantity || 1),
                                      plan?.currency
                                    )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* 6. Pricing & Totals Card */}
        <section className="rounded-3xl border border-[#e5dfd5] bg-white p-6 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-400">
            Yatırım ve Ödeme Özeti
          </h3>

          <div className="space-y-2 text-xs text-slate-600 pt-2">
            <div className="flex justify-between">
              <span>Ara Toplam</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(plan?.totals_subtotal, plan?.currency)}
              </span>
            </div>

            {Number(plan?.totals_discount || 0) > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Özel İndirim</span>
                <span className="font-semibold">
                  -{formatCurrency(plan?.totals_discount, plan?.currency)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-baseline pt-3 border-t border-slate-100 text-sm sm:text-base">
              <span className="font-bold text-slate-900">Net Toplam Tutar</span>
              <span className="font-extrabold text-teal-900 text-lg sm:text-xl font-mono">
                {formatCurrency(plan?.totals_grand, plan?.currency)}
              </span>
            </div>
          </div>
        </section>

        {/* 7. Doctor & Clinic Credentials */}
        {doctor && doctor.name && (
          <section className="rounded-3xl border border-[#e5dfd5] bg-white p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center gap-4">
              {doctor.photo_key ? (
                <img
                  src={`/api/media/${doctor.photo_key}`}
                  alt={doctor.name}
                  className="size-16 rounded-2xl object-cover shadow-2xs border border-slate-200"
                />
              ) : (
                <div className="size-16 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xl">
                  {doctor.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">
                  Hekiminiz
                </span>
                <h4 className="text-base font-bold text-slate-900 leading-snug">
                  {doctor.name}
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  {doctor.title || "Diş Hekimi"}
                </p>
              </div>
            </div>

            {doctor.bio && (
              <p className="text-xs leading-relaxed text-slate-600 font-light border-t border-slate-100 pt-3">
                {doctor.bio}
              </p>
            )}

            {doctorStats.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                {doctorStats.map((st: any, i: number) => (
                  <div key={i} className="rounded-xl bg-[#faf8f5] p-3 text-center border border-slate-100">
                    <p className="text-sm font-extrabold text-slate-900">{st.value}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-medium">{st.label}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 8. Clinic Reviews (if available) */}
        {reviews.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Hasta Deneyimleri & Değerlendirmeler</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {reviews.slice(0, 4).map((r: any, i: number) => (
                <div key={i} className="rounded-2xl border border-[#e5dfd5] bg-white p-4 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{r.author}</span>
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {Array.from({ length: r.rating || 5 }).map((_, starI) => (
                        <Star key={starI} className="size-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-light">{r.text}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 9. Final Action & Acceptance Section */}
        <section className="rounded-3xl border border-teal-200 bg-teal-50/60 p-6 sm:p-8 text-center space-y-4 shadow-xs">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-teal-800 text-white shadow-md shadow-teal-900/20">
            <ShieldCheck className="size-6" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">
              Yeni Gülüşünüz İçin Hazır mısınız?
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Bu tedavi planını dijital olarak onaylayabilir ya da hekimimizle aklınıza takılan sorular için iletişime geçebilirsiniz.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {accepted ? (
              <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 text-xs font-bold text-white shadow-md">
                <Check className="size-4" />
                <span>Tedavi Planı Onaylandı ({signature})</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAcceptModal(true)}
                className="w-full sm:w-auto inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-teal-800 px-6 py-3.5 text-xs font-bold text-white shadow-md shadow-teal-900/20 hover:bg-teal-900 transition active:scale-95"
              >
                <CheckCircle2 className="size-4" />
                <span>Tedavi Planını Dijital Olarak Onayla</span>
              </button>
            )}

            <a
              href={`/api/public/plans/${token}/pdf`}
              download="tedavi-plani.pdf"
              onClick={handleTrackPdfDownload}
              className="w-full sm:w-auto inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition active:scale-95"
            >
              <Download className="size-4 text-slate-500" />
              <span>24 Sayfalık PDF İndir</span>
            </a>
          </div>
        </section>
      </main>

      {/* Floating Bottom Bar for Mobile Conversion */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#e5dfd5] px-4 py-3 sm:px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Toplam Tutar</span>
            <p className="text-sm sm:text-base font-extrabold text-slate-900">
              {formatCurrency(plan?.totals_grand, plan?.currency)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => handleTrackCTA("whatsapp_footer")}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-emerald-700 transition"
              >
                <MessageCircle className="size-4" />
                <span>WhatsApp</span>
              </a>
            )}

            {!accepted && (
              <button
                type="button"
                onClick={() => setShowAcceptModal(true)}
                className="flex items-center gap-1.5 rounded-xl bg-teal-800 px-4 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-teal-900 transition cursor-pointer"
              >
                <Check className="size-4" />
                <span>Onayla</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3D Viz Modal */}
      {show3DModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 sm:p-6 backdrop-blur-md">
          <div className="relative w-full max-w-4xl h-[85vh] rounded-3xl bg-slate-900 border border-slate-800 flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="size-4" />
                <span>3D Parametrik Diş Simülasyonu</span>
              </div>
              <button
                type="button"
                onClick={() => setShow3DModal(false)}
                className="flex size-8 cursor-pointer items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="size-4" />
              </button>
            </div>
            <iframe
              src={`/v1/viz/player`}
              title="3D Viz Player"
              className="w-full flex-1 border-0"
            />
          </div>
        </div>
      )}

      {/* Digital Acceptance Modal */}
      {showAcceptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-800 mb-3.5">
              <ShieldCheck className="size-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900">
              Tedavi Planını Onaylıyor musunuz?
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              Sayın <strong>{patientDisplayName}</strong>, kliniğimiz tarafından hazırlanan <strong>{plan?.title || "Tedavi Planı"}</strong> içeriğini ve şartlarını kabul ettiğinizi teyit etmek için lütfen adınızı onaylayınız.
            </p>

            <div className="mt-4 space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700">
                Dijital Onay İmzası (Ad Soyad)
              </label>
              <input
                type="text"
                value={signatureInput}
                onChange={(e) => setSignatureInput(e.target.value)}
                placeholder="Adınız ve Soyadınız"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-teal-700"
              />
            </div>

            {acceptError && (
              <p className="mt-2 text-xs font-semibold text-rose-600">{acceptError}</p>
            )}

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowAcceptModal(false)}
                className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Vazgeç
              </button>
              <button
                type="button"
                disabled={isAccepting}
                onClick={handleConfirmAccept}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-teal-800 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-teal-900 disabled:opacity-50"
              >
                {isAccepting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Kaydediliyor...</span>
                  </>
                ) : (
                  <>
                    <Check className="size-3.5" />
                    <span>Onaylıyorum</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
