"use client";

import React, { useEffect, useMemo, useState, useTransition } from "react";
import {
  Activity,
  Award,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FileCheck2,
  FileDown,
  FileText,
  HeartHandshake,
  HelpCircle,
  Info,
  Layers,
  Loader2,
  MapPin,
  Maximize2,
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

// FDI Standard 2-Digit Tooth Numbering & Turkish Names
const TOOTH_NAMES: Record<string, string> = {
  // Upper Right (11-18)
  "18": "Sağ Üst 3. Azı (Akıl)",
  "17": "Sağ Üst 2. Azı",
  "16": "Sağ Üst 1. Azı",
  "15": "Sağ Üst 2. Küçük Azı",
  "14": "Sağ Üst 1. Küçük Azı",
  "13": "Sağ Üst Köpek (Kanin)",
  "12": "Sağ Üst Yan Kesici",
  "11": "Sağ Üst Orta Kesici",
  // Upper Left (21-28)
  "21": "Sol Üst Orta Kesici",
  "22": "Sol Üst Yan Kesici",
  "23": "Sol Üst Köpek (Kanin)",
  "24": "Sol Üst 1. Küçük Azı",
  "25": "Sol Üst 2. Küçük Azı",
  "26": "Sol Üst 1. Azı",
  "27": "Sol Üst 2. Azı",
  "28": "Sol Üst 3. Azı (Akıl)",
  // Lower Right (41-48)
  "48": "Sağ Alt 3. Azı (Akıl)",
  "47": "Sağ Alt 2. Azı",
  "46": "Sağ Alt 1. Azı",
  "45": "Sağ Alt 2. Küçük Azı",
  "44": "Sağ Alt 1. Küçük Azı",
  "43": "Sağ Alt Köpek (Kanin)",
  "42": "Sağ Alt Yan Kesici",
  "41": "Sağ Alt Orta Kesici",
  // Lower Left (31-38)
  "31": "Sol Alt Orta Kesici",
  "32": "Sol Alt Yan Kesici",
  "33": "Sol Alt Köpek (Kanin)",
  "34": "Sol Alt 1. Küçük Azı",
  "35": "Sol Alt 2. Küçük Azı",
  "36": "Sol Alt 1. Azı",
  "37": "Sol Alt 2. Azı",
  "38": "Sol Alt 3. Azı (Akıl)",
};

const UPPER_TEETH = ["18", "17", "16", "15", "14", "13", "12", "11", "21", "22", "23", "24", "25", "26", "27", "28"];
const LOWER_TEETH = ["48", "47", "46", "45", "44", "43", "42", "41", "31", "32", "33", "34", "35", "36", "37", "38"];

export function PatientPresentationClient({ data, token }: Props) {
  const plan = data?.plan || ({} as any);
  const clinic = data?.clinic || ({} as any);
  const initialAccepted = Boolean(data?.accepted);
  const initialAcceptedAt = data?.accepted_at;
  const initialSignature = data?.signature || "";

  const visits = Array.isArray(plan?.visits) ? plan.visits : [];
  const allItems = useMemo(() => {
    const list: any[] = [];
    visits.forEach((v: any) => {
      if (Array.isArray(v?.items)) {
        v.items.forEach((it: any) => {
          list.push({ ...it, visitTitle: v.title || `${v.order_num}. Seans` });
        });
      }
    });
    // If no visits have items, check top-level plan.items
    if (list.length === 0 && Array.isArray(plan?.items)) {
      return plan.items;
    }
    return list;
  }, [visits, plan?.items]);

  const doctor = clinic?.doctor || {};
  const doctorStats = Array.isArray(doctor?.stats) ? doctor.stats : [];
  const reviews = Array.isArray(clinic?.reviews) ? clinic.reviews : [];
  const beforeAfterCases = Array.isArray(data?.before_after) && data.before_after.length > 0
    ? data.before_after
    : Array.isArray(clinic?.before_after)
    ? clinic.before_after
    : [];

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

  // 3D Viz Modal state
  const [show3DModal, setShow3DModal] = useState(false);

  // Dental Map State
  const [selectedVisitFilter, setSelectedVisitFilter] = useState<string>("all");
  const [selectedTooth, setSelectedTooth] = useState<string | null>(null);

  // Mapping teeth to treatments & findings
  const { toothTreatmentsMap, toothFindingsMap, allTreatedTeeth } = useMemo(() => {
    const tMap: Record<string, Array<{ treatmentName: string; visitTitle: string; quantity: number }>> = {};
    const fMap: Record<string, { status: string; note: string }> = {};
    const treatedSet = new Set<string>();

    // Collect from visits and items
    visits.forEach((v: any) => {
      const vTitle = v.title || `${v.order_num}. Seans`;
      if (Array.isArray(v.chart_teeth)) {
        v.chart_teeth.forEach((t: string) => treatedSet.add(t));
      }
      if (Array.isArray(v.items)) {
        v.items.forEach((it: any) => {
          const teeth = Array.isArray(it.teeth) && it.teeth.length > 0
            ? it.teeth
            : it.tooth_number ? [it.tooth_number] : [];

          teeth.forEach((t: string) => {
            const cleanT = t.trim();
            if (!cleanT) return;
            treatedSet.add(cleanT);
            if (!tMap[cleanT]) tMap[cleanT] = [];
            tMap[cleanT].push({
              treatmentName: it.treatment_name || "Tedavi",
              visitTitle: vTitle,
              quantity: it.quantity || 1,
            });
          });
        });
      }
    });

    // Check plan items if visits were empty
    if (visits.length === 0 && Array.isArray(plan?.items)) {
      plan.items.forEach((it: any) => {
        const teeth = Array.isArray(it.teeth) && it.teeth.length > 0
          ? it.teeth
          : it.tooth_number ? [it.tooth_number] : [];
        teeth.forEach((t: string) => {
          const cleanT = t.trim();
          if (!cleanT) return;
          treatedSet.add(cleanT);
          if (!tMap[cleanT]) tMap[cleanT] = [];
          tMap[cleanT].push({
            treatmentName: it.treatment_name || "Tedavi",
            visitTitle: "Planlanan İşlem",
            quantity: it.quantity || 1,
          });
        });
      });
    }

    // Collect from situation tooth findings
    if (plan?.situation && Array.isArray(plan.situation.tooth_findings)) {
      plan.situation.tooth_findings.forEach((tf: any) => {
        if (tf.tooth) {
          fMap[tf.tooth] = {
            status: tf.status || "Mevcut",
            note: tf.note || "",
          };
          treatedSet.add(tf.tooth);
        }
      });
    }

    return {
      toothTreatmentsMap: tMap,
      toothFindingsMap: fMap,
      allTreatedTeeth: Array.from(treatedSet),
    };
  }, [visits, plan?.situation, plan?.items]);

  // Teeth active for currently selected visit filter
  const activeTeethForFilter = useMemo(() => {
    if (selectedVisitFilter === "all") return allTreatedTeeth;
    const matchingVisit = visits.find((v: any) => v.id === selectedVisitFilter);
    if (!matchingVisit) return allTreatedTeeth;

    const set = new Set<string>();
    if (Array.isArray(matchingVisit.chart_teeth)) {
      matchingVisit.chart_teeth.forEach((t: string) => set.add(t));
    }
    if (Array.isArray(matchingVisit.items)) {
      matchingVisit.items.forEach((it: any) => {
        const teeth = Array.isArray(it.teeth) && it.teeth.length > 0
          ? it.teeth
          : it.tooth_number ? [it.tooth_number] : [];
        teeth.forEach((t: string) => set.add(t.trim()));
      });
    }
    return Array.from(set);
  }, [selectedVisitFilter, visits, allTreatedTeeth]);

  // Set default selected tooth to first treated tooth if available
  useEffect(() => {
    if (!selectedTooth && allTreatedTeeth.length > 0) {
      setSelectedTooth(allTreatedTeeth[0] ?? null);
    }
  }, [allTreatedTeeth, selectedTooth]);

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

  // 3D Player URL with plan items encoded
  const vizPlayerUrl = useMemo(() => {
    const itemParts: string[] = [];
    allItems.forEach((it: any) => {
      const code = it.animation_code || "composite_filling";
      const teeth = Array.isArray(it.teeth) && it.teeth.length > 0
        ? it.teeth
        : it.tooth_number ? [it.tooth_number] : ["16"];
      teeth.forEach((t: string) => {
        itemParts.push(`${code}:${t}`);
      });
    });
    const itemsParam = itemParts.length > 0 ? itemParts.join(",") : "composite_filling:16";
    return `/v1/viz/player?items=${encodeURIComponent(itemsParam)}&locale=tr&autoplay=1`;
  }, [allItems]);

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 selection:bg-slate-900 selection:text-white pb-16 font-sans">
      {/* 1. Header (Sticky & High-End Minimalist) */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 sm:px-6 transition-all duration-200">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {clinic?.logo_key ? (
              <img
                src={`/api/media/${clinic.logo_key}`}
                alt={clinicDisplayName}
                className="h-9 w-auto max-w-[130px] object-contain rounded-lg"
              />
            ) : (
              <div className="size-9 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-xs tracking-wider">
                {clinicDisplayName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-bold text-slate-900 leading-tight">
                  {clinicDisplayName}
                </h1>
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200/60">
                  Doğrulandı
                </span>
              </div>
              {clinic?.slogan && (
                <p className="text-[11px] text-slate-500 font-normal truncate max-w-[180px] sm:max-w-xs">
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
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition active:scale-95"
              >
                <MessageCircle className="size-3.5" />
                <span className="hidden sm:inline">WhatsApp İletişim</span>
              </a>
            )}

            {cleanPhone && (
              <a
                href={`tel:${cleanPhone}`}
                onClick={() => handleTrackCTA("phone_header")}
                className="inline-flex size-8.5 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition active:scale-95 shadow-2xs"
                title="Kliniği Ara"
              >
                <Phone className="size-3.5" />
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 pt-6 sm:pt-8 space-y-6 sm:space-y-8">
        {/* 2. Hero Patient Card (Aesthetic & Reassuring) */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-700">
              <Sparkles className="size-3.5 text-slate-800" />
              Kişiye Özel Tedavi Planı
            </span>
            {accepted && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-800">
                <CheckCircle2 className="size-3.5 text-emerald-600" />
                Plan Onaylandı
              </span>
            )}
          </div>

          <h2 className="mt-3 text-2xl sm:text-3xl text-slate-900 font-extrabold tracking-tight">
            Sayın {patientDisplayName}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            Ağız ve diş sağlığınız için kliniğimiz tarafından hazırlanan interaktif tedavi planı, diş haritası ve seans detayları.
          </p>

          {/* Key Metrics Grid */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-slate-100">
            <div className="rounded-2xl bg-slate-50/80 p-3.5 border border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Tedavi Süreci
              </span>
              <p className="mt-1 text-sm font-bold text-slate-900">
                {visits.length > 0 ? `${visits.length} Seans` : "Planlanıyor"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50/80 p-3.5 border border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                İşlem Adedi
              </span>
              <p className="mt-1 text-sm font-bold text-slate-900">
                {allItems.length > 0 ? `${allItems.length} Prosedür` : "İncelemede"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50/80 p-3.5 border border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Sorumlu Hekim
              </span>
              <p className="mt-1 text-sm font-bold text-slate-900 truncate">
                {doctor?.name || clinic?.signer_name || clinicDisplayName}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-900 text-white p-3.5 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Toplam Tutar
              </span>
              <p className="mt-1 text-sm sm:text-base font-extrabold">
                {formatCurrency(plan?.totals_grand, plan?.currency)}
              </p>
            </div>
          </div>
        </section>

        {/* 3. Doctor's Personal Welcome Note */}
        {(plan?.welcome_letter || clinic?.welcome_body) && (
          <section className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="flex size-9 items-center justify-center rounded-xl bg-slate-100 text-slate-900">
                <HeartHandshake className="size-4.5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Hekiminizden Mesaj
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  {doctor?.name || clinic?.signer_name || clinicDisplayName}
                </h3>
              </div>
            </div>
            <div className="mt-3.5 text-xs sm:text-sm leading-relaxed text-slate-700 whitespace-pre-line font-normal">
              {plan?.welcome_letter || clinic?.welcome_body}
            </div>
          </section>
        )}

        {/* 4. İNTERAKTİF DİŞ HARİTASI (Interactive Dental Odontogram Map) */}
        <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-slate-900 text-white">
                  <Layers className="size-3.5" />
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Kişiselleştirilmiş Diş Haritanız
                </h3>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                Planlanan işlemlerin çene üzerindeki dağılımı. Dişlerin üzerine tıklayarak yapılacak işlemleri görebilirsiniz.
              </p>
            </div>

            {/* Visit Filter Pills */}
            {visits.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setSelectedVisitFilter("all")}
                  className={`cursor-pointer rounded-xl px-3 py-1.5 text-xs font-bold transition active:scale-95 ${
                    selectedVisitFilter === "all"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Tüm Dişler ({allTreatedTeeth.length})
                </button>
                {visits.map((v: any, idx: number) => {
                  const isCurrent = selectedVisitFilter === v.id;
                  return (
                    <button
                      key={v.id || idx}
                      type="button"
                      onClick={() => setSelectedVisitFilter(v.id)}
                      className={`cursor-pointer rounded-xl px-3 py-1.5 text-xs font-bold transition active:scale-95 ${
                        isCurrent
                          ? "bg-slate-900 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {idx + 1}. Seans
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Dental Odontogram Grid (Responsive Container) */}
          <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:p-6 space-y-6">
            <div className="min-w-[620px] space-y-6">
              {/* Üst Çene (Upper Arch) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                  <span>Sağ Üst</span>
                  <span className="font-extrabold text-slate-600">Üst Çene (Maksilla)</span>
                  <span>Sol Üst</span>
                </div>
                <div className="grid grid-cols-16 gap-1 sm:gap-1.5">
                  {UPPER_TEETH.map((tooth) => {
                    const isTreated = allTreatedTeeth.includes(tooth);
                    const isFiltered = activeTeethForFilter.includes(tooth);
                    const isSelected = selectedTooth === tooth;

                    return (
                      <button
                        key={tooth}
                        type="button"
                        onClick={() => setSelectedTooth(tooth)}
                        title={`${tooth} - ${TOOTH_NAMES[tooth] || ""}`}
                        className={`group relative flex flex-col items-center justify-center rounded-xl p-1 sm:p-1.5 transition-all duration-150 cursor-pointer ${
                          isSelected
                            ? "bg-slate-900 text-white ring-2 ring-slate-900/30 scale-105 z-10 shadow-sm"
                            : isFiltered
                            ? "bg-white text-slate-900 border-2 border-slate-900 font-bold shadow-2xs hover:scale-105"
                            : isTreated
                            ? "bg-white/80 text-slate-700 border border-slate-300 opacity-60"
                            : "bg-white/40 text-slate-400 border border-slate-200/60 hover:bg-white/70"
                        }`}
                      >
                        {/* Tooth Crown Representation */}
                        <svg
                          className={`size-3.5 sm:size-4 mb-0.5 transition ${
                            isSelected ? "text-white" : isFiltered ? "text-slate-900" : "text-slate-400"
                          }`}
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 2C8 2 6 4 6 7c0 3 1 6 2 9 1 3 1 6 2 6s2-4 2-6c0-2 1-6 2-9 1-3 0-5-2-7zm-4 4c0-1.5 1-2.5 3-2.5s3 1 3 2.5-1 3-3 3-3-1.5-3-3z" />
                        </svg>
                        <span className="text-[10px] sm:text-xs font-mono font-bold leading-none">
                          {tooth}
                        </span>
                        {isFiltered && (
                          <span className={`size-1 rounded-full mt-0.5 ${isSelected ? "bg-cyan-300" : "bg-slate-900"}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Orta Ayrım Çizgisi */}
              <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-slate-200" />
                <span className="absolute bg-slate-50 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Isırma Hattı
                </span>
              </div>

              {/* Alt Çene (Lower Arch) */}
              <div className="space-y-2">
                <div className="grid grid-cols-16 gap-1 sm:gap-1.5">
                  {LOWER_TEETH.map((tooth) => {
                    const isTreated = allTreatedTeeth.includes(tooth);
                    const isFiltered = activeTeethForFilter.includes(tooth);
                    const isSelected = selectedTooth === tooth;

                    return (
                      <button
                        key={tooth}
                        type="button"
                        onClick={() => setSelectedTooth(tooth)}
                        title={`${tooth} - ${TOOTH_NAMES[tooth] || ""}`}
                        className={`group relative flex flex-col items-center justify-center rounded-xl p-1 sm:p-1.5 transition-all duration-150 cursor-pointer ${
                          isSelected
                            ? "bg-slate-900 text-white ring-2 ring-slate-900/30 scale-105 z-10 shadow-sm"
                            : isFiltered
                            ? "bg-white text-slate-900 border-2 border-slate-900 font-bold shadow-2xs hover:scale-105"
                            : isTreated
                            ? "bg-white/80 text-slate-700 border border-slate-300 opacity-60"
                            : "bg-white/40 text-slate-400 border border-slate-200/60 hover:bg-white/70"
                        }`}
                      >
                        <span className="text-[10px] sm:text-xs font-mono font-bold leading-none mb-0.5">
                          {tooth}
                        </span>
                        {/* Tooth Crown inverted for lower arch */}
                        <svg
                          className={`size-3.5 sm:size-4 mt-0.5 transition rotate-180 ${
                            isSelected ? "text-white" : isFiltered ? "text-slate-900" : "text-slate-400"
                          }`}
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 2C8 2 6 4 6 7c0 3 1 6 2 9 1 3 1 6 2 6s2-4 2-6c0-2 1-6 2-9 1-3 0-5-2-7zm-4 4c0-1.5 1-2.5 3-2.5s3 1 3 2.5-1 3-3 3-3-1.5-3-3z" />
                        </svg>
                        {isFiltered && (
                          <span className={`size-1 rounded-full mt-0.5 ${isSelected ? "bg-cyan-300" : "bg-slate-900"}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                  <span>Sağ Alt</span>
                  <span className="font-extrabold text-slate-600">Alt Çene (Mandibula)</span>
                  <span>Sol Alt</span>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Tooth Detail Banner */}
          {selectedTooth ? (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-slate-900 text-white font-mono font-extrabold text-base">
                    {selectedTooth}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">
                        Diş {selectedTooth} - {TOOTH_NAMES[selectedTooth] || "Belirtilen Diş"}
                      </h4>
                      {toothTreatmentsMap[selectedTooth]?.length ? (
                        <span className="rounded-full bg-slate-900 text-white px-2 py-0.5 text-[10px] font-bold">
                          {toothTreatmentsMap[selectedTooth].length} İşlem
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 text-slate-500 px-2 py-0.5 text-[10px] font-medium">
                          İşlem Yok
                        </span>
                      )}
                    </div>
                    {toothFindingsMap[selectedTooth] && (
                      <p className="text-[11px] text-amber-700 font-medium mt-0.5">
                        Klinik Bulgu: {toothFindingsMap[selectedTooth].status}
                        {toothFindingsMap[selectedTooth].note ? ` (${toothFindingsMap[selectedTooth].note})` : ""}
                      </p>
                    )}
                  </div>
                </div>

                {/* Planned treatments list for this tooth */}
                <div className="space-y-1.5">
                  {toothTreatmentsMap[selectedTooth]?.length ? (
                    toothTreatmentsMap[selectedTooth].map((proc, pIdx) => (
                      <div
                        key={pIdx}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-800 mr-2"
                      >
                        <CheckCircle2 className="size-3.5 text-slate-900" />
                        <span>{proc.treatmentName}</span>
                        <span className="text-[10px] text-slate-500">({proc.visitTitle})</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">
                      Bu diş için aktif bir işlem planlanmamıştır.
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-2 text-xs text-slate-400">
              Detayları görmek için diş haritasından herhangi bir dişe tıklayabilirsiniz.
            </div>
          )}
        </section>

        {/* 5. 3D İNTERAKTİF MODELLEME & SİMÜLASYON (High-Tech & Immersive) */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 p-6 sm:p-8 text-white shadow-lg">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/15 px-3 py-1 text-[11px] font-bold text-cyan-300 border border-cyan-500/25">
                <Sparkles className="size-3.5" />
                3D İnteraktif Çene & Diş Simülasyonu
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Tedavinizi 3 Boyutlu Olarak Deneyimleyin
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                Planlanan tedavi aşamalarınızı 32 dişli çene anatomisi üzerinde 360 derece serbest açıyla döndürün, yakınlaştırın ve adım adım görselleştirin.
              </p>

              {/* Feature Highlights */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-medium text-slate-200">
                  32 Dişli Çene Anatomisi
                </span>
                <span className="rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-medium text-slate-200">
                  Adım Adım Hamleler
                </span>
                <span className="rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-medium text-slate-200">
                  360° Serbest Kontrol
                </span>
                {allItems.length > 0 && (
                  <span className="rounded-lg bg-cyan-500/20 px-2.5 py-1 text-[11px] font-semibold text-cyan-300">
                    {allItems.length} Planlanmış Hamle
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleOpen3D}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-6 py-3.5 text-xs sm:text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/25 hover:bg-cyan-300 transition active:scale-95"
              >
                <Play className="size-4 fill-slate-950" />
                <span>3D Simülasyonu Başlat</span>
              </button>
            </div>
          </div>
        </section>

        {/* 6. AŞAMALI TEDAVİ SEANSLARI & İŞLEM DÖKÜMÜ (Visits Schedule) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Planlanan Tedavi Aşamaları & Seanslar
              </h3>
              <p className="text-xs text-slate-500">
                Uygulanacak prosedürlerin seans bazlı takvimi ve açıklamaları
              </p>
            </div>
            <span className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs">
              {visits.length > 0 ? `${visits.length} Aşamalı Seans` : `${allItems.length} Prosedür`}
            </span>
          </div>

          <div className="space-y-4">
            {visits.length === 0 ? (
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-3">
                <h4 className="text-sm font-bold text-slate-900">İşlem Listesi</h4>
                {allItems.length === 0 ? (
                  <p className="text-xs text-slate-400">Bu tedavi planına henüz işlem detayı eklenmemiş.</p>
                ) : (
                  <div className="space-y-2.5">
                    {allItems.map((item: any, iIdx: number) => {
                      const teeth = Array.isArray(item?.teeth) && item.teeth.length > 0
                        ? item.teeth
                        : item.tooth_number ? [item.tooth_number] : [];
                      return (
                        <div
                          key={item.id || iIdx}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 sm:p-4 gap-2 text-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-slate-900 text-xs sm:text-sm">
                                {item.treatment_name || "Tedavi"}
                              </span>
                              {teeth.length > 0 && (
                                <span className="rounded-md bg-slate-900 text-white px-2 py-0.5 font-mono text-[11px] font-bold">
                                  Diş {teeth.join(", ")}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400">
                              Birim: {item.quantity || 1} Adet
                            </p>
                          </div>
                          <div className="text-right sm:shrink-0 font-extrabold text-slate-900 text-xs sm:text-sm">
                            {formatCurrency(
                              (item.unit_price || 0) * (item.quantity || 1),
                              plan?.currency
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              visits.map((visit: any, vIdx: number) => {
                const visitItems = Array.isArray(visit?.items) ? visit.items : [];
                return (
                  <div
                    key={visit.id || vIdx}
                    className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-xs space-y-4"
                  >
                    {/* Visit Header */}
                    <div className="flex items-start justify-between pb-3.5 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-slate-900 text-white font-mono text-sm font-bold">
                          {vIdx + 1}
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {visit.phase_label || `${vIdx + 1}. Aşama`}
                          </span>
                          <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                            {visit.title || `${vIdx + 1}. Seans`}
                          </h4>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-600 rounded-lg bg-slate-50 px-2.5 py-1 border border-slate-200">
                        {visitItems.length} Prosedür
                      </span>
                    </div>

                    {visit.healing_note && (
                      <div className="flex items-start gap-2.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 p-3.5 text-xs text-amber-900">
                        <Info className="size-4 text-amber-600 shrink-0 mt-0.5" />
                        <p className="font-medium leading-relaxed">{visit.healing_note}</p>
                      </div>
                    )}

                    {/* Items in this visit */}
                    <div className="space-y-2.5">
                      {visitItems.length === 0 ? (
                        <p className="text-xs text-slate-400 py-1">Bu seans için işlem detayı bulunmuyor.</p>
                      ) : (
                        visitItems.map((item: any, iIdx: number) => {
                          const teeth = Array.isArray(item?.teeth) && item.teeth.length > 0
                            ? item.teeth
                            : item.tooth_number ? [item.tooth_number] : [];
                          return (
                            <div
                              key={item.id || iIdx}
                              className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 sm:p-4 gap-2 text-xs hover:border-slate-200 transition"
                            >
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-bold text-slate-900 text-xs sm:text-sm">
                                    {item.treatment_name || "Tedavi"}
                                  </span>
                                  {teeth.length > 0 && (
                                    <span className="rounded-md bg-slate-900 text-white px-2 py-0.5 font-mono text-[11px] font-bold">
                                      Diş {teeth.join(", ")}
                                    </span>
                                  )}
                                  {item.is_package && (
                                    <span className="rounded-md bg-purple-100 text-purple-800 px-2 py-0.5 text-[10px] font-bold">
                                      Paket Dahili
                                    </span>
                                  )}
                                </div>
                                {item.description && (
                                  <p className="text-[11px] text-slate-500 leading-normal">{item.description}</p>
                                )}
                                <p className="text-[11px] text-slate-400">
                                  Birim: {item.quantity || 1} Adet
                                </p>
                              </div>

                              <div className="text-right sm:shrink-0 font-extrabold text-slate-900 text-xs sm:text-sm">
                                {item.is_package
                                  ? "Paket İçi (0 ₺)"
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

        {/* 7. PANORAMİK RÖNTGEN & KLİNİK TANI BULGULARI (If available) */}
        {(plan?.situation?.xray_key || (plan?.situation?.general_diagnoses && plan.situation.general_diagnoses.length > 0)) && (
          <section className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Activity className="size-4 text-slate-700" />
              <span>Klinik Tanı & Bulgular</span>
            </div>

            {plan?.situation?.general_diagnoses && plan.situation.general_diagnoses.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {plan.situation.general_diagnoses.map((diag: string, dIdx: number) => (
                  <span
                    key={dIdx}
                    className="rounded-xl bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-800"
                  >
                    {diag}
                  </span>
                ))}
              </div>
            )}

            {plan?.situation?.xray_key && (
              <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
                <img
                  src={`/api/media/${plan.situation.xray_key}`}
                  alt="Panoramik Röntgen"
                  className="w-full h-auto max-h-[420px] object-contain opacity-95 hover:opacity-100 transition"
                />
                <div className="p-3 bg-slate-900/90 text-slate-300 text-[11px] flex items-center justify-between">
                  <span>Panoramik Röntgen Radyografisi</span>
                  <span className="font-mono text-slate-400">Klinik Arşiv Kaydı</span>
                </div>
              </div>
            )}
          </section>
        )}

        {/* 8. ÖNCESİ & SONRASI VAKA DÖNÜŞÜMLERİ (Before & After Showcase) */}
        {beforeAfterCases.length > 0 && (
          <section className="space-y-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Klinik Vaka Dönüşümleri (Öncesi & Sonrası)
              </h3>
              <p className="text-xs text-slate-500">
                Benzer endikasyonlardaki başarılı tedavi ve estetik gülüş sonuçlarımız
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {beforeAfterCases.map((c: any, cIdx: number) => (
                <div
                  key={c.id || cIdx}
                  className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900">{c.title || "Vaka Sonucu"}</h4>
                    {c.tag && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
                        {c.tag}
                      </span>
                    )}
                  </div>
                  {c.description && (
                    <p className="text-xs text-slate-600 line-clamp-2">{c.description}</p>
                  )}

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Öncesi
                      </span>
                      <div className="aspect-4/3 overflow-hidden rounded-xl bg-slate-100 border border-slate-200">
                        {c.before_image_key ? (
                          <img
                            src={`/api/media/${c.before_image_key}`}
                            alt="Öncesi"
                            className="size-full object-cover"
                          />
                        ) : (
                          <div className="size-full flex items-center justify-center text-[10px] text-slate-400">
                            Öncesi Fotoğraf
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                        Sonrası
                      </span>
                      <div className="aspect-4/3 overflow-hidden rounded-xl bg-slate-100 border border-emerald-200">
                        {c.after_image_key ? (
                          <img
                            src={`/api/media/${c.after_image_key}`}
                            alt="Sonrası"
                            className="size-full object-cover"
                          />
                        ) : (
                          <div className="size-full flex items-center justify-center text-[10px] text-emerald-600">
                            Sonrası Fotoğraf
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 9. FATURA & YATIRIM ÖZETİ (Financial Investment Breakdown) */}
        <section className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-slate-900 text-white">
                <FileText className="size-3.5" />
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Tedavi Yatırım Özeti
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              KDV Dahil Resmi Tutar
            </span>
          </div>

          <div className="space-y-2.5 text-xs sm:text-sm">
            <div className="flex justify-between py-1 text-slate-600">
              <span>Ara Toplam</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(plan?.totals_subtotal, plan?.currency)}
              </span>
            </div>

            {Boolean(plan?.totals_discount && plan.totals_discount > 0) && (
              <div className="flex justify-between py-1 text-emerald-700">
                <span>Özel Klinik İndirimi</span>
                <span className="font-bold">
                  -{formatCurrency(plan?.totals_discount, plan?.currency)}
                </span>
              </div>
            )}

            {Array.isArray(plan?.discounts) &&
              plan.discounts.map((d: any, dIdx: number) => (
                <div key={d.id || dIdx} className="flex justify-between py-0.5 text-xs text-slate-500">
                  <span>{d.label || "İndirim"}</span>
                  <span className="font-medium text-emerald-600">
                    -{formatCurrency(d.amount, plan?.currency)}
                  </span>
                </div>
              ))}

            {/* Genel Toplam Vurgulu Kutusu */}
            <div className="mt-4 rounded-2xl bg-slate-900 p-5 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
                  Genel Toplam (KDV Dahil)
                </span>
                <div className="text-2xl sm:text-3xl font-black tracking-tight">
                  {formatCurrency(plan?.totals_grand, plan?.currency)}
                </div>
              </div>

              {/* PDF Download Button */}
              <a
                href={`/api/public/plans/${token}/pdf`}
                target="_blank"
                rel="noreferrer"
                onClick={handleTrackPdfDownload}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2.5 text-xs font-bold text-white transition active:scale-95 border border-white/10"
              >
                <Download className="size-4" />
                <span>Resmi PDF Teklifini İndir</span>
              </a>
            </div>
          </div>
        </section>

        {/* 10. HEKİM & KLİNİK GÜVENCESİ (Doctor & Clinic Authority) */}
        <section className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-5 border-b border-slate-100">
            {doctor?.photo_key ? (
              <img
                src={`/api/media/${doctor.photo_key}`}
                alt={doctor.name || "Hekim"}
                className="size-16 rounded-2xl object-cover border border-slate-200"
              />
            ) : (
              <div className="size-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg">
                <Stethoscope className="size-7 text-white" />
              </div>
            )}
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                <ShieldCheck className="size-3 text-slate-900" />
                Tedavi Sorumlusu & Başhekim
              </span>
              <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {doctor?.name || clinic?.signer_name || clinicDisplayName}
              </h4>
              <p className="text-xs text-slate-500 font-medium">
                {doctor?.title || clinic?.signer_title || "Diş Hekimi"} {doctor?.subtitle ? `• ${doctor.subtitle}` : ""}
              </p>
            </div>
          </div>

          {doctor?.bio && (
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light">
              {doctor.bio}
            </p>
          )}

          {/* Doctor Key Stats */}
          {doctorStats.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {doctorStats.map((st: any, sIdx: number) => (
                <div key={sIdx} className="rounded-2xl bg-slate-50 p-3.5 text-center border border-slate-100">
                  <div className="text-base font-extrabold text-slate-900">{st.value}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-0.5">
                    {st.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Clinic Reviews */}
          {reviews.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Doğrulanmış Hasta Değerlendirmeleri
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {reviews.slice(0, 2).map((rev: any, rIdx: number) => (
                  <div
                    key={rIdx}
                    className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{rev.author}</span>
                      <div className="flex text-amber-500">
                        {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                          <Star key={i} className="size-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-600 italic">"{rev.text}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clinic Address & Hours */}
          {(clinic?.address || clinic?.hours) && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100 text-xs text-slate-500">
              {clinic?.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="size-3.5 text-slate-400 shrink-0" />
                  <span>{clinic.address}</span>
                </div>
              )}
              {clinic?.hours && (
                <div className="flex items-center gap-2">
                  <Clock className="size-3.5 text-slate-400 shrink-0" />
                  <span>Çalışma Saatleri: {clinic.hours}</span>
                </div>
              )}
            </div>
          )}
        </section>

        {/* 11. DİJİTAL ONAY & HUKUKİ KABUL KARTI */}
        <section className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs text-center space-y-4">
          {accepted ? (
            <div className="space-y-3">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="size-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Tedavi Planı Dijital Olarak Onaylandı
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Bu plan <strong>{signature || patientDisplayName}</strong> adına{" "}
                {acceptedAt ? new Date(acceptedAt).toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "yakın zamanda"}{" "}
                tarihinde elektronik onaylanmıştır. Kliniğimiz randevu hazırlığı için sizinle irtibata geçecektir.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-w-lg mx-auto">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-900">
                <FileCheck2 className="size-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Tedavi Planınızı Onaylamak İster misiniz?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hazırlanan seans takvimini ve tutarı uygun buluyorsanız, planınızı dijital olarak onaylayabilir ve kliniğimizin sizin için hazırlıklara başlamasını sağlayabilirsiniz.
              </p>
              <button
                type="button"
                onClick={() => setShowAcceptModal(true)}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-slate-800 transition active:scale-95"
              >
                <Check className="size-4 text-emerald-400" />
                <span>Tedavi Planını Onayla</span>
              </button>
            </div>
          )}
        </section>
      </main>

      {/* 3D Viz Player Modal */}
      {show3DModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 sm:p-6 backdrop-blur-md">
          <div className="relative w-full max-w-5xl h-[88vh] rounded-3xl bg-slate-900 border border-slate-800 flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/70">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="size-4" />
                <span>3D Parametrik Çene & Diş Simülasyonu</span>
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
              src={vizPlayerUrl}
              title="3D Viz Player"
              className="w-full flex-1 border-0"
            />
          </div>
        </div>
      )}

      {/* Digital Acceptance Signature Modal */}
      {showAcceptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-900 text-white mb-3.5">
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
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-slate-900"
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
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 disabled:opacity-50"
              >
                {isAccepting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Kaydediliyor...</span>
                  </>
                ) : (
                  <>
                    <Check className="size-3.5 text-emerald-400" />
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
