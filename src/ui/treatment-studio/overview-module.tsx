"use client";

import React, { useEffect, useState, useTransition } from "react";
import {
  AlertCircle,
  ArrowRight,
  Award,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileCheck2,
  FileText,
  Globe,
  Layers,
  Loader2,
  Lock,
  MessageCircle,
  Phone,
  QrCode,
  RefreshCw,
  Share2,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Trash2,
  X,
} from "lucide-react";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 012.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 01-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24h.02zm-3.6 3.82c-.2 0-.43.08-.66.33-.23.25-.87.85-.87 2.07s.89 2.4 1.01 2.57c.13.16 1.72 2.69 4.23 3.73.6.25 1.07.4 1.43.51.6.19 1.15.16 1.58.1.48-.07 1.48-.6 1.69-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.28s-1.48-.73-1.71-.81c-.23-.08-.4-.12-.57.12-.17.25-.66.81-.81.98-.15.17-.3.19-.55.07-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.48-1.39-1.73-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.57-1.37-.78-1.87-.2-.5-.41-.43-.57-.44-.15-.01-.32-.01-.49-.01z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}
import type { ClinicBrandInfo, PatientInfo, StudioPlanItem, StudioVisit } from "./types";
import {
  createShareLinkAction,
  generatePdfAction,
  getPlanAnalyticsAction,
  listShareLinksAction,
  readyPlanAction,
  revokeShareLinkAction,
} from "@/app/(clinic)/app/plans/actions";

interface OverviewModuleProps {
  patient: PatientInfo;
  clinic: ClinicBrandInfo;
  items: StudioPlanItem[];
  visits: StudioVisit[];
  currency?: "EUR" | "USD" | "TRY";
  planId?: string;
  planTitle?: string;
  planStatus?: string;
  isLocked?: boolean;
  onLockReady?: () => Promise<void> | void;
  onPatientDobChange?: (dob: string) => void;
}

export function OverviewModule({
  patient,
  clinic,
  items,
  visits,
  currency = "EUR",
  planId,
  planTitle,
  planStatus,
  isLocked: isLockedProp,
  onLockReady,
}: OverviewModuleProps) {
  const isInitiallyLocked = Boolean(
    isLockedProp ?? (planStatus && planStatus.toLowerCase() !== "draft")
  );
  const [isLocked, setIsLocked] = useState(isInitiallyLocked);
  const [showConfirmLock, setShowConfirmLock] = useState(false);
  const [isLocking, setIsLocking] = useState(false);

  useEffect(() => {
    if (isLockedProp !== undefined) {
      setIsLocked(isLockedProp);
    } else if (planStatus) {
      setIsLocked(planStatus.toLowerCase() !== "draft");
    }
  }, [isLockedProp, planStatus]);
  const [isCopied, setIsCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showQrInline, setShowQrInline] = useState(true);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [shareToast, setShareToast] = useState<string | null>(null);

  // Phone preview mode: "pdf" (PDF Sunumu) or "web" (İnteraktif Web Sunumu)
  const [previewMode, setPreviewMode] = useState<"pdf" | "web">("pdf");
  const [pdfKey, setPdfKey] = useState(0);

  // Web Presentation Link & Analytics State
  const [isPending, startTransition] = useTransition();
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [activeToken, setActiveToken] = useState<string | null>(null);
  const [activeLink, setActiveLink] = useState<any | null>(null);
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // PDF Generation State
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccessMsg, setPdfSuccessMsg] = useState<string | null>(null);

  const currSymbol = currency === "EUR" ? "€" : currency === "USD" ? "$" : "₺";
  const subtotal = items.reduce(
    (acc, it) => acc + (it.unitPrice || 0) * (it.quantity || 1),
    0
  );

  // Clean Patient Display Name (Title Cased)
  const patientDisplayName = patient?.name
    ? patient.name
        .trim()
        .split(/\s+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ")
    : "Sayın Hastamız";

  const appBase = typeof window !== "undefined" ? window.location.origin : "";

  // Effective plan id (fallback to patient.id if it's a valid ULID)
  const effectivePlanId =
    planId || (patient?.id && patient.id.length >= 20 ? patient.id : undefined);

  // Load existing links and analytics when effectivePlanId is available
  useEffect(() => {
    if (!effectivePlanId) return;

    let mounted = true;
    setLoadingLinks(true);
    setErrorMsg(null);

    const savedToken =
      typeof window !== "undefined"
        ? localStorage.getItem(`tp_share_token_${effectivePlanId}`)
        : null;

    if (savedToken) {
      setActiveToken(savedToken);
    }

    Promise.all([
      listShareLinksAction(effectivePlanId),
      getPlanAnalyticsAction(effectivePlanId),
    ])
      .then(([linksRes, analyticsRes]) => {
        if (!mounted) return;
        if (linksRes.success && linksRes.data) {
          const linksList = Array.isArray(linksRes.data)
            ? linksRes.data
            : (linksRes.data as any)?.links || [];
          const valid = linksList.find(
            (l: any) => !l.revoked_at && new Date(l.expires_at) > new Date()
          );
          if (valid) {
            setActiveLink(valid);
            if (savedToken && savedToken.startsWith(valid.token_prefix || "")) {
              setActiveToken(savedToken);
            } else if (valid.token_prefix) {
              setActiveToken(valid.token_prefix);
            }
          } else if (isLocked && effectivePlanId) {
            // Plan is locked / approved -> automatically generate the presentation share link so it's ready
            createShareLinkAction(effectivePlanId, 720).then((res) => {
              if (res.success && res.data && mounted) {
                setActiveLink(res.data.link);
                setActiveToken(res.data.token);
                if (typeof window !== "undefined") {
                  localStorage.setItem(`tp_share_token_${effectivePlanId}`, res.data.token);
                }
              }
            });
          }
        }
        if (analyticsRes.success && analyticsRes.data) {
          setAnalytics(analyticsRes.data);
        }
      })
      .catch(() => {
        if (mounted) setErrorMsg("Paylaşım bilgileri alınamadı.");
      })
      .finally(() => {
        if (mounted) setLoadingLinks(false);
      });

    return () => {
      mounted = false;
    };
  }, [effectivePlanId, isLocked]);

  // Current Share URL
  const currentToken =
    activeToken ||
    activeLink?.token_prefix ||
    (patient?.id ? `demo-${patient.id}` : "demo-preview");
  const shareUrl = `${appBase}/p/${currentToken}`;

  const totalViews = activeLink
    ? analytics?.total_views ?? activeLink.views_count ?? 0
    : 0;
  const lastViewed = activeLink
    ? analytics?.last_viewed_at || activeLink.last_viewed_at
    : null;
  const formattedLastViewed = lastViewed
    ? new Date(lastViewed).toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(shareUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCreateLink = () => {
    if (!effectivePlanId) {
      setActiveToken(`demo-${patient.id || "preview"}`);
      return;
    }

    startTransition(async () => {
      setErrorMsg(null);
      const res = await createShareLinkAction(effectivePlanId, 720); // 30 days
      if (res.success && res.data) {
        setActiveLink(res.data.link);
        setActiveToken(res.data.token);
        if (typeof window !== "undefined") {
          localStorage.setItem(`tp_share_token_${effectivePlanId}`, res.data.token);
        }
        const aRes = await getPlanAnalyticsAction(effectivePlanId);
        if (aRes.success && aRes.data) setAnalytics(aRes.data);
      } else {
        setErrorMsg(res.error || "Paylaşım linki oluşturulamadı");
      }
    });
  };

  const handleRevoke = (linkId: string) => {
    if (!effectivePlanId) {
      setActiveLink(null);
      setActiveToken(null);
      return;
    }

    startTransition(async () => {
      setErrorMsg(null);
      const res = await revokeShareLinkAction(effectivePlanId, linkId);
      if (res.success) {
        setActiveLink(null);
        setActiveToken(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem(`tp_share_token_${effectivePlanId}`);
        }
      } else {
        setErrorMsg(res.error || "İptal edilemedi");
      }
    });
  };

  const handleLockAndGenerate = async () => {
    setIsLocking(true);
    setErrorMsg(null);
    try {
      if (onLockReady) {
        await onLockReady();
      } else if (effectivePlanId) {
        await readyPlanAction(effectivePlanId);
        await generatePdfAction(effectivePlanId).catch(() => {});
      }

      // Ensure active presentation share link is available
      if (effectivePlanId) {
        try {
          const shareRes = await createShareLinkAction(effectivePlanId, 720);
          if (shareRes.success && shareRes.data) {
            setActiveLink(shareRes.data.link);
            setActiveToken(shareRes.data.token);
            if (typeof window !== "undefined") {
              localStorage.setItem(`tp_share_token_${effectivePlanId}`, shareRes.data.token);
            }
          }
        } catch {
          // ignore
        }
      }
      setIsLocked(true);
      setShowConfirmLock(false);
      setPdfKey((prev) => prev + 1);
      setPdfSuccessMsg("Plan başarıyla kilitlendi ve resmi sunumlar hazırlandı!");
      setTimeout(() => setPdfSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err?.message || "Plan onaylanırken bir hata oluştu.");
    } finally {
      setIsLocking(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!effectivePlanId) {
      window.print();
      return;
    }

    try {
      setIsGeneratingPdf(true);
      setErrorMsg(null);

      // 1. Ensure plan is finalized / ready (creates backend snapshot)
      await readyPlanAction(effectivePlanId);
      // 2. Generate PDF document in backend
      await generatePdfAction(effectivePlanId);
      // 3. Refresh embedded PDF iframe
      setPdfKey((prev) => prev + 1);

      // 4. Open PDF stream in new tab
      window.open(`/api/plans/${effectivePlanId}/pdf`, "_blank");
    } catch {
      window.open(`/api/plans/${effectivePlanId}/pdf`, "_blank");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleRegeneratePdf = async () => {
    if (!effectivePlanId) return;
    setIsGeneratingPdf(true);
    setPdfSuccessMsg(null);
    setErrorMsg(null);
    try {
      // 1. Snapshot the latest plan
      await readyPlanAction(effectivePlanId);
      // 2. Request PDF generation
      const res = await generatePdfAction(effectivePlanId);
      if (res.success) {
        setPdfKey((prev) => prev + 1);
        setPdfSuccessMsg("PDF teklifi başarıyla güncellendi.");
        setTimeout(() => setPdfSuccessMsg(null), 3000);
      } else {
        setErrorMsg(res.error || "PDF güncellenemedi.");
      }
    } catch {
      setErrorMsg("PDF oluşturma sırasında hata oluştu.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Direct frictionless WhatsApp message
  const cleanPhone = (patient.phone || "").replace(/[^0-9]/g, "");
  const whatsappText = `Sayın ${patientDisplayName}, kliniğimiz tarafından hazırlanan kişisel tedavi planınızı ve 3D simülasyonunuzu aşağıdaki bağlantıdan inceleyebilirsiniz:\n\n${shareUrl}`;
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappText)}`
    : `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;

  // Safe Visits List
  const safeVisits: StudioVisit[] =
    visits && visits.length > 0
      ? visits
      : [
          {
            id: "v-1",
            orderNum: 1,
            title: "1. Seans: Cerrahi, Çekim & İmplantasyon",
            phaseLabel: "1. Cerrahi Aşama",
            chartTeeth: ["11", "12", "14", "21", "22", "24"],
          },
          {
            id: "v-2",
            orderNum: 2,
            title: "2. Seans: Kalıcı Zirkonyum Köprü Simantasyonu",
            phaseLabel: "2. Protetik Tamamlama",
            healingNote: "6 Ay İyileşme ve Osteointegrasyon Süresi",
            healingMonths: 6,
            chartTeeth: ["16", "26", "36", "46"],
          },
        ];

  // Distinct treated teeth set
  const allTreatedTeeth = Array.from(
    new Set(items.flatMap((it) => it.teeth || []))
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Sol Kolon: Cep Telefonu Simülatörü */}
      <div className="lg:col-span-5 2xl:col-span-5 flex flex-col items-center">
        {/* PDF Sunumu & Web Sunumu Seçici Butonları */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl mb-3 w-[340px] sm:w-[360px]">
          <button
            type="button"
            onClick={() => setPreviewMode("pdf")}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition cursor-pointer ${
              previewMode === "pdf"
                ? "bg-white text-slate-900 shadow-2xs font-bold"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <FileText className="size-3.5 text-slate-800" />
            <span>PDF Sunumu</span>
          </button>
          <button
            type="button"
            onClick={() => setPreviewMode("web")}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition cursor-pointer ${
              previewMode === "web"
                ? "bg-white text-slate-900 shadow-2xs font-bold"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Globe className="size-3.5 text-blue-600" />
            <span>Web Sunumu</span>
          </button>
        </div>

        {/* iPhone Frame */}
        <div className="relative w-[340px] sm:w-[360px] h-[720px] rounded-[52px] bg-slate-950 p-3.5 shadow-2xl ring-1 ring-white/20 border-4 border-slate-800">
          {/* Dynamic Island / Notch */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-40 flex items-center justify-center pointer-events-none">
            <div className="size-2 rounded-full bg-slate-900 border border-slate-800 mr-3"></div>
            <div className="size-2.5 rounded-full bg-slate-900 border border-slate-800"></div>
          </div>

          {/* Screen Display Container (Scrollable with NO scrollbar visible) */}
          <div
            className={`relative w-full h-full rounded-[40px] select-none font-sans flex flex-col justify-between no-scrollbar transition-colors ${
              previewMode === "pdf" ? "bg-slate-950 overflow-hidden" : "bg-white overflow-y-auto scroll-smooth"
            }`}
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {/* Top Status Bar */}
            <div
              className={`sticky top-0 z-30 px-6 pt-3 pb-2 flex items-center justify-between text-[11px] font-bold border-b transition-colors ${
                previewMode === "pdf"
                  ? "bg-slate-950 text-white border-white/10"
                  : "bg-white/90 backdrop-blur-md text-slate-800 border-slate-100/80"
              }`}
            >
              <span>09:41</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px]">5G</span>
                <div className={`w-4 h-2 border rounded-xs p-0.5 flex items-center ${previewMode === "pdf" ? "border-slate-500" : "border-slate-700"}`}>
                  <div className={`w-full h-full rounded-2xs ${previewMode === "pdf" ? "bg-white" : "bg-slate-900"}`}></div>
                </div>
              </div>
            </div>

            {/* ============================================================== */}
            {/* 1. SEÇENEK: İNTERAKTİF WEB SUNUMU (BİREBİR HASTA SUNUMU)      */}
            {/* ============================================================== */}
            {previewMode === "web" ? (
              <div className="flex-1 flex flex-col space-y-4 pb-6 no-scrollbar">
                {/* 1. Header Şeridi (Birebir patient-presentation Header'ı) */}
                <div className="px-5 pt-3 flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="size-9 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-xs tracking-wider">
                      {(clinic.name || "TP").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-slate-900 leading-tight">
                          {clinic.name || "Avcı Klinik"}
                        </h4>
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-1.5 py-0.2 text-[9px] font-semibold text-emerald-700 border border-emerald-200/60">
                          Doğrulandı
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Ağız ve Diş Sağlığı Merkezi
                      </p>
                    </div>
                  </div>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[10px] font-semibold text-white shadow-xs hover:bg-emerald-700 transition"
                  >
                    <MessageCircle className="size-3" />
                    <span>WhatsApp</span>
                  </a>
                </div>

                {/* 2. Hero Patient Card (Birebir patient-presentation Hero'su) */}
                <div className="px-5">
                  <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                        <Sparkles className="size-3 text-slate-800" />
                        Kişiye Özel Tedavi Planı
                      </span>
                    </div>

                    <div>
                      <h2 className="text-xl text-slate-900 font-extrabold tracking-tight">
                        Sayın {patientDisplayName}
                      </h2>
                      <p className="mt-0.5 text-xs text-slate-600 leading-relaxed font-normal">
                        Kliniğimiz tarafından sizin için hazırlanan interaktif tedavi planı, diş haritası ve seans detayları.
                      </p>
                    </div>

                    {/* 4 Ana Metrik Grid (Birebir Hasta Sunumu) */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                      <div className="rounded-xl bg-slate-50/80 p-2.5 border border-slate-100">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                          Tedavi Süreci
                        </span>
                        <p className="mt-0.5 text-xs font-bold text-slate-900">
                          {safeVisits.length} Seans
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50/80 p-2.5 border border-slate-100">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                          İşlem Adedi
                        </span>
                        <p className="mt-0.5 text-xs font-bold text-slate-900">
                          {items.length} Kalem Prosedür
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50/80 p-2.5 border border-slate-100">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                          Sorumlu Hekim
                        </span>
                        <p className="mt-0.5 text-xs font-bold text-slate-900 truncate">
                          {clinic.doctorName || "Dr. Selin Yılmaz"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-900 text-white p-2.5 shadow-xs">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                          Toplam Tutar
                        </span>
                        <p className="mt-0.5 text-xs font-extrabold text-white">
                          {currSymbol} {subtotal.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. 3D Simülasyon & Aşamalar Kartı */}
                <div className="px-5">
                  <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 text-white shadow-md space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-blue-400 text-xs font-bold">
                        <Sparkles className="size-3.5" />
                        <span>3D Simülasyon Aşamaları</span>
                      </div>
                      <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[9px] font-bold text-blue-300 border border-blue-400/30">
                        Aktif
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-1 text-[11px]">
                      {safeVisits.map((v, idx) => (
                        <div
                          key={v.id || idx}
                          className="flex items-center justify-between rounded-lg bg-white/10 px-2.5 py-1.5 border border-white/10"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`size-1.5 rounded-full ${
                                idx === 0 ? "bg-blue-400" : "bg-emerald-400"
                              }`}
                            />
                            <span className="font-medium text-slate-200">
                              {v.title}
                            </span>
                          </div>
                          <span className="text-[9px] text-slate-400 font-mono">
                            {idx + 1}. Aşama
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 4. Diş Haritası (Odontogram) Tedavi Edilen Dişler */}
                {allTreatedTeeth.length > 0 && (
                  <div className="px-5">
                    <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                        <span>Tedavi Planlanan Dişler</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {allTreatedTeeth.length} Diş
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {allTreatedTeeth.map((t) => (
                          <span
                            key={t}
                            className="rounded-lg bg-blue-50 px-2 py-0.5 text-[10px] font-mono font-bold text-blue-800 border border-blue-200/70"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. Seans Seans Tedavi ve Fiyat Listesi */}
                <div className="px-5 space-y-3">
                  <div className="text-xs font-bold text-slate-900">
                    Seans Takvimi ve Uygulanacak İşlemler
                  </div>

                  {safeVisits.map((v, vIdx) => {
                    // Filter items for this visit or show items in first visit
                    const visitItems =
                      items.filter((it) => it.visitId === v.id).length > 0
                        ? items.filter((it) => it.visitId === v.id)
                        : vIdx === 0
                        ? items
                        : [];

                    return (
                      <div
                        key={v.id || vIdx}
                        className="rounded-2xl border border-slate-200/90 bg-white p-3.5 space-y-2"
                      >
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                          <Calendar className="size-3.5 text-slate-500" />
                          <span className="text-xs font-bold text-slate-800">
                            {v.title}
                          </span>
                        </div>

                        {v.healingNote && (
                          <div className="rounded-lg bg-amber-50 px-2.5 py-1 text-[10px] font-medium text-amber-800 border border-amber-200/60">
                            ⏱ {v.healingNote}
                          </div>
                        )}

                        <div className="space-y-1.5">
                          {visitItems.map((it, itIdx) => (
                            <div
                              key={it.id || itIdx}
                              className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 text-xs flex items-center justify-between"
                            >
                              <div className="min-w-0 pr-2">
                                <div className="font-semibold text-slate-800 truncate">
                                  {it.treatmentName}
                                </div>
                                {it.teeth && it.teeth.length > 0 && (
                                  <div className="text-[10px] text-slate-500 font-mono">
                                    Diş: {it.teeth.join(", ")}
                                  </div>
                                )}
                              </div>
                              <span className="font-bold text-slate-900 shrink-0">
                                {it.unitPrice
                                  ? `${currSymbol} ${((it.unitPrice || 0) * (it.quantity || 1)).toLocaleString()}`
                                  : "Dahil"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 6. Finansal Bütçe Özeti */}
                <div className="px-5">
                  <div className="rounded-2xl bg-slate-900 text-white p-4 space-y-2 shadow-xs">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400">
                      Bütçe &amp; Fiyat Özeti
                    </span>
                    <div className="flex items-baseline justify-between pt-1 border-t border-slate-800">
                      <span className="text-xs text-slate-300">Toplam Tedavi Tutarı:</span>
                      <span className="text-base font-black text-white">
                        {currSymbol} {subtotal.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Cerrahi, anestezi, malzeme ve garantili implant protezleri fiyata dahildir.
                    </p>
                  </div>
                </div>

                {/* 7. Hekim Bilgileri & WhatsApp İletişim */}
                <div className="px-5 space-y-2.5">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold">Sorumlu Hekim</div>
                      <div className="font-bold text-slate-900">
                        {clinic.doctorName || "Dr. Selin Yılmaz"}
                      </div>
                      <div className="text-[10px] text-slate-500">{clinic.name}</div>
                    </div>
                    <Stethoscope className="size-6 text-slate-400" />
                  </div>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition"
                  >
                    <MessageCircle className="size-4" />
                    <span>WhatsApp ile Kliniğe Danış</span>
                  </a>

                  <a
                    href={`tel:${clinic.phone || ""}`}
                    className="w-full rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <Phone className="size-3.5 text-slate-500" />
                    <span>Kliniği Ara ({clinic.phone || "+90 212 555 0100"})</span>
                  </a>
                </div>
              </div>
            ) : effectivePlanId ? (
              /* ============================================================== */
              /* 2. SEÇENEK: OLUŞTURULAN GERÇEK KURUMSAL TEKLİF PDF'İ           */
              /* ============================================================== */
              <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden relative no-scrollbar">
                {/* Floating Top Mini Toolbar */}
                <div className="z-30 flex items-center justify-between bg-slate-950/90 backdrop-blur-md px-4 py-2 border-b border-white/10 text-white shrink-0">
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <FileText className="size-3.5 text-cyan-400" />
                    <span className="truncate max-w-[130px]">Kurumsal Teklif PDF&apos;i</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      disabled={isGeneratingPdf}
                      onClick={handleRegeneratePdf}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-white/10 hover:bg-white/20 px-2 py-1 text-[10px] font-semibold text-white transition active:scale-95 disabled:opacity-50"
                      title="PDF'i Yeniden Derle"
                    >
                      <RefreshCw
                        className={`size-3 ${isGeneratingPdf ? "animate-spin text-cyan-400" : ""}`}
                      />
                      <span>Yenile</span>
                    </button>
                    <button
                      type="button"
                      disabled={isGeneratingPdf}
                      onClick={handleDownloadPdf}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 px-2.5 py-1 text-[10px] font-bold text-white transition active:scale-95 shadow-xs disabled:opacity-50"
                      title="Yeni Sekmede Aç / İndir"
                    >
                      <ExternalLink className="size-3" />
                      <span>Tam Ekran</span>
                    </button>
                  </div>
                </div>

                {/* Real Generated PDF Embed (Scrollbar clipped via overflow-hidden) */}
                <div className="flex-1 w-full h-full relative bg-slate-950 overflow-hidden">
                  <iframe
                    key={pdfKey}
                    src={`/api/plans/${effectivePlanId}/pdf?v=${pdfKey}#toolbar=0&navpanes=0&view=FitH`}
                    className="h-full border-0 no-scrollbar"
                    style={{
                      width: "calc(100% + 24px)",
                      height: "100%",
                    }}
                    title="Oluşturulan Kurumsal PDF"
                  />
                </div>
              </div>
            ) : (
              /* ============================================================== */
              /* 2B. YEDEK SEÇENEK: PLAN HENÜZ OLUŞTURULMADI                    */
              /* ============================================================== */
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-slate-900 no-scrollbar">
                <div className="size-14 rounded-2xl bg-white/10 flex items-center justify-center mb-3 text-cyan-400">
                  <FileText className="size-7" />
                </div>
                <h4 className="text-sm font-bold text-slate-100">Kurumsal PDF Önizlemesi</h4>
                <p className="text-xs text-slate-400 mt-1.5 max-w-[220px] leading-relaxed">
                  Gerçek teklif PDF&apos;ini görüntülemek için lütfen bir tedavi planı açınız veya kaydediniz.
                </p>
              </div>
            )}

            {/* Bottom Home Indicator */}
            <div
              className={`py-2 flex justify-center pointer-events-none transition-colors ${
                previewMode === "pdf" ? "bg-slate-950" : "bg-white"
              }`}
            >
              <div
                className={`w-28 h-1 rounded-full ${
                  previewMode === "pdf" ? "bg-slate-700" : "bg-slate-300"
                }`}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Sağ Kolon: Dokümanlar ve Sunum Dağıtım Merkezi */}
      <div className="lg:col-span-7 2xl:col-span-7 space-y-5">
        {/* Başlık Alanı */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Plan Sunumu &amp; Dokümanlar
              </h3>
              {isLocked ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                  <CheckCircle2 className="size-3 text-emerald-600" />
                  Paylaşıma Hazır
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                  <Clock className="size-3 text-amber-600" />
                  Taslak Aşaması (Kilit Bekliyor)
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-slate-500 font-medium">
              {patientDisplayName} {planTitle ? `• ${planTitle}` : ""}
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
            {errorMsg}
          </div>
        )}

        {pdfSuccessMsg && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-600" />
            <span>{pdfSuccessMsg}</span>
          </div>
        )}

        {!isLocked ? (
          /* ============================================================== */
          /* İLK ÖNCE: TASLAĞI KİLİTLE VE SUNUMLARI OLUŞTUR BÖLÜMÜ          */
          /* ============================================================== */
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-5 animate-in fade-in duration-200">
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-xs">
                <FileCheck2 className="size-6 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900">
                  Taslağı Kilitle ve Sunumları Oluştur
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Tedavi planınızı onaylayarak resmi teklif aşamasına geçirin. Onaylama sonrasında hastaya özel kurumsal PDF teklif belgesi ve 3D interaktif web sunumu otomatik olarak derlenip kullanıma hazır hale gelecektir.
                </p>
              </div>
            </div>

            {/* Bilgi Maddeleri */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 space-y-2.5 text-xs text-slate-700">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                <span>Resmi kurumsal teklif PDF dosyası ve fiyat dökümü derlenir.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                <span>3D tedavi simülasyonu ve mobil uyumlu hasta sunum bağlantısı aktifleşir.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                <span>WhatsApp, SMS ve QR kod hasta paylaşım kanalları açılır.</span>
              </div>
            </div>

            {/* Bilgi / Kilit Uyarısı */}
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200/80 bg-amber-50/80 p-3 text-xs text-amber-900 leading-relaxed">
              <AlertCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Bilgi:</strong> Hastaya sunulacak teklifin tutarlılığı ve resmiyeti için, onay sonrasında tedavi kalemleri düzenlemeye kapatılır.
              </span>
            </div>

            {/* Buton */}
            <button
              type="button"
              disabled={isLocking}
              onClick={() => setShowConfirmLock(true)}
              className="w-full flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold py-3.5 px-4 text-xs shadow-xs transition active:scale-98 disabled:opacity-50"
            >
              <FileCheck2 className="size-4 text-emerald-400" />
              <span>Taslağı Kilitle ve Sunumları Oluştur</span>
            </button>
          </div>
        ) : (
          /* ============================================================== */
          /* ONAYLAYINCA GELEN KISIM: SUNUMLAR & DOKÜMANLAR                 */
          /* ============================================================== */
          <>
            {/* 1. Kurumsal Teklif PDF'i Kartı */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3.5 transition hover:border-slate-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-xs">
                <FileText className="size-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Kurumsal Teklif PDF&apos;i</h4>
                <p className="text-xs text-slate-500">
                  Resmi tedavi planı, seans takvimi ve fiyat dökümü
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {effectivePlanId && (
                <button
                  type="button"
                  disabled={isGeneratingPdf}
                  onClick={handleRegeneratePdf}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition active:scale-95 disabled:opacity-50"
                  title="PDF'i Yeniden Oluştur"
                >
                  <RefreshCw
                    className={`size-3.5 ${isGeneratingPdf ? "animate-spin text-blue-600" : ""}`}
                  />
                  <span>Yenile</span>
                </button>
              )}

              <button
                type="button"
                disabled={isGeneratingPdf}
                onClick={handleDownloadPdf}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition active:scale-95 disabled:opacity-50"
              >
                {isGeneratingPdf ? (
                  <Loader2 className="size-3.5 animate-spin text-cyan-400" />
                ) : (
                  <Download className="size-3.5" />
                )}
                <span>{isGeneratingPdf ? "Hazırlanıyor..." : "PDF İndir"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. İnteraktif Web Sunumu Kartı */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-xs">
                <Globe className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">İnteraktif Web Sunumu</h4>
                  <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                    Şifresiz Doğrudan Erişim
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Hastaya özel 3D tedavi simülasyonu ve mobil deneyim
                </p>
              </div>
            </div>
          </div>

          {loadingLinks ? (
            <div className="flex items-center justify-center py-6 text-slate-400">
              <Loader2 className="size-5 animate-spin text-cyan-600" />
              <span className="ml-2 text-xs font-medium">Bağlantılar yükleniyor...</span>
            </div>
          ) : activeLink || !effectivePlanId ? (
            <div className="space-y-3.5 pt-1">
              {/* URL Girişi ve Paylaş Butonu */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-mono text-slate-700 select-all focus:outline-hidden"
                />

                {/* Paylaş Butonu (Popup Açar) */}
                <button
                  type="button"
                  onClick={() => setShowShareModal(true)}
                  className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 hover:text-slate-900 transition active:scale-95 shrink-0"
                  title="Sunumu Paylaş"
                >
                  <Share2 className="size-3.5 text-slate-500" />
                  <span>Paylaş</span>
                </button>
              </div>

              {/* Hasta Etkileşim & Takip Şeridi */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/70 p-2.5 px-3.5">
                <div className="flex flex-wrap items-center gap-2">
                  {totalViews > 0 ? (
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-200/80 bg-cyan-50/80 px-2.5 py-1 text-[11px] font-bold text-cyan-800">
                      <span className="relative flex size-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                        <span className="relative inline-flex size-2 rounded-full bg-cyan-500" />
                      </span>
                      <span>{totalViews} Görüntülenme</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-500">
                      <span className="size-1.5 rounded-full bg-slate-300" />
                      <span>Henüz açılmadı</span>
                    </span>
                  )}

                  {formattedLastViewed && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600">
                      <Clock className="size-3 text-slate-400" />
                      <span>Son: {formattedLastViewed}</span>
                    </span>
                  )}

                  {analytics?.accepted_signature && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
                      <CheckCircle2 className="size-3 text-emerald-600" />
                      <span>İmza: {analytics.accepted_signature}</span>
                    </span>
                  )}
                </div>

                {activeLink && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => setShowRevokeConfirm(true)}
                    title="Paylaşım linkini sil"
                    className="flex size-7 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition active:scale-95 shadow-2xs disabled:opacity-50"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-xs text-slate-500">
                Hastanın görüntüleyebileceği aktif bir web bağlantısı bulunmuyor.
              </span>
              <button
                type="button"
                disabled={isPending}
                onClick={handleCreateLink}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition active:scale-95 disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Oluşturuluyor...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="size-3.5 text-cyan-400" />
                    <span>Sunum Linki Oluştur</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* 3. Klinik & Sunum Bilgileri Özeti */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-3 text-xs">
          <div className="font-bold text-slate-800">Klinik &amp; Karşılama Bilgileri</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-600">
            <div>
              <span className="block font-medium text-slate-400 text-[10px]">Sorumlu Hekim</span>
              <span className="font-bold text-slate-900">{clinic.doctorName || "Dr. Selin Yılmaz"}</span>
            </div>
            <div>
              <span className="block font-medium text-slate-400 text-[10px]">Klinik Adı</span>
              <span className="font-bold text-slate-900">{clinic.name || "Avcı Klinik"}</span>
            </div>
            <div>
              <span className="block font-medium text-slate-400 text-[10px]">İletişim Tel</span>
              <span className="font-bold text-slate-900">{clinic.phone || "+90 212 555 0100"}</span>
            </div>
            <div>
              <span className="block font-medium text-slate-400 text-[10px]">Toplam Bütçe</span>
              <span className="font-bold text-slate-900">
                {currSymbol} {subtotal.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </>
    )}
  </div>

  {/* Taslağı Kilitleme ve Sunumları Oluşturma Onay Modalı */}
  {showConfirmLock && (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-md transition-all duration-300"
      onClick={() => setShowConfirmLock(false)}
    >
      <div
        className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-900 text-white ring-8 ring-slate-100 mb-4">
          <FileCheck2 className="size-5" />
        </div>

        <h3 className="text-base font-bold text-slate-900">
          Tedavi Planını Onaylamak İstiyor musunuz?
        </h3>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
          Bu işlem planı taslak aşamasından çıkarıp resmi teklif haline getirir:
        </p>

        <div className="mt-3.5 space-y-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-xs text-slate-700">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600 mt-0.5" />
            <span>Hastaya özel <strong>interaktif web sunumu</strong> ve <strong>kurumsal PDF teklif belgesi</strong> derlenir.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600 mt-0.5" />
            <span>WhatsApp, SMS ve QR kod ile hasta paylaşımı aktifleşir.</span>
          </div>
        </div>

        <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200/80 bg-amber-50/80 p-2.5 text-[11px] text-amber-900 leading-relaxed">
          <AlertCircle className="size-4 shrink-0 text-amber-600 mt-0.5" />
          <span>
            <strong>Bilgi:</strong> Onay sonrasında tedavi kalemleri ve seanslar düzenlemeye kapatılır.
          </span>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2.5">
          <button
            type="button"
            disabled={isLocking}
            onClick={() => setShowConfirmLock(false)}
            className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
          >
            Vazgeç
          </button>
          <button
            type="button"
            disabled={isLocking}
            onClick={handleLockAndGenerate}
            className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 disabled:opacity-50 transition active:scale-98"
          >
            {isLocking ? (
              <>
                <Loader2 className="size-3.5 animate-spin text-cyan-400" />
                <span>Hazırlanıyor...</span>
              </>
            ) : (
              <>
                <FileCheck2 className="size-3.5 text-emerald-400" />
                <span>Onayla ve Sunumları Oluştur</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )}

      {/* Silme Onay Uyarısı Modalı */}
      {showRevokeConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs"
          onClick={() => setShowRevokeConfirm(false)}
        >
          <div
            className="w-full max-w-xs rounded-2xl border border-slate-100 bg-white p-5 shadow-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-8 ring-rose-50/50">
              <Trash2 className="size-5" />
            </div>
            <h4 className="mt-3.5 text-sm font-bold text-slate-900">Emin misiniz?</h4>
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
              Bu paylaşım linki iptal edildiğinde hasta artık bu bağlantıyla sunuma erişemeyecektir.
            </p>
            <div className="mt-5 flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowRevokeConfirm(false)}
                className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Vazgeç
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  setShowRevokeConfirm(false);
                  if (activeLink) {
                    handleRevoke(activeLink.id);
                  }
                }}
                className="w-full inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-rose-600 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition disabled:opacity-50"
              >
                {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                <span>Evet, Sil</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sunumu Paylaş Popup Modal */}
      {showShareModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setShowShareModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-white p-5 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Başlığı */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-xs">
                  <Share2 className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Sunumu Paylaş</h3>
                  <p className="text-xs text-slate-500">
                    Hastaya özel interaktif 3D tedavi sunumu bağlantısı
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* 1. Link ve Kopyala Kısmı */}
            <div className="space-y-2 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Sunum Bağlantısı
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Şifresiz Doğrudan Erişim
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-slate-700 select-all focus:outline-hidden shadow-2xs"
                />

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex-1 sm:flex-none inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 hover:text-slate-900 transition active:scale-95"
                    title="Linki kopyala"
                  >
                    {isCopied ? (
                      <>
                        <Check className="size-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Kopyalandı</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5 text-slate-500" />
                        <span>Kopyala</span>
                      </>
                    )}
                  </button>

                  <a
                    href={shareUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 hover:text-slate-900 transition active:scale-95"
                    title="Yeni sekmede aç"
                  >
                    <ExternalLink className="size-3.5 text-slate-500" />
                    <span>Önizle</span>
                  </a>
                </div>
              </div>
            </div>

            {/* 2. Paylaşım Seçenekleri (WhatsApp, Instagram, QR Kod) */}
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Paylaşım Kanalları
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* WhatsApp */}
                <button
                  type="button"
                  onClick={() => {
                    window.open(whatsappUrl, "_blank");
                  }}
                  className="group flex flex-col items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 hover:border-emerald-300 p-4 transition cursor-pointer text-center shadow-2xs"
                >
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-2xs group-hover:scale-105 transition-transform">
                    <WhatsAppIcon className="size-6" />
                  </div>
                  <div className="mt-2.5 font-bold text-xs text-slate-900">WhatsApp</div>
                </button>

                {/* Instagram */}
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard?.writeText(shareUrl);
                      setShareToast("Link kopyalandı! Instagram açılıyor...");
                      setTimeout(() => setShareToast(null), 3000);
                    } catch (err) {}
                    window.open("https://www.instagram.com/direct/inbox/", "_blank");
                  }}
                  className="group flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 hover:border-rose-300 p-4 transition cursor-pointer text-center shadow-2xs"
                >
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white shadow-2xs group-hover:scale-105 transition-transform">
                    <InstagramIcon className="size-6" />
                  </div>
                  <div className="mt-2.5 font-bold text-xs text-slate-900">Instagram</div>
                </button>

                {/* QR Kod */}
                <button
                  type="button"
                  onClick={() => setShowQrInline((prev) => !prev)}
                  className={`group flex flex-col items-center justify-center rounded-2xl border p-4 transition cursor-pointer text-center shadow-2xs ${
                    showQrInline
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 text-slate-900"
                  }`}
                >
                  <div
                    className={`flex size-11 items-center justify-center rounded-2xl shadow-2xs group-hover:scale-105 transition-transform ${
                      showQrInline ? "bg-white text-slate-900" : "bg-slate-800 text-white"
                    }`}
                  >
                    <QrCode className="size-6" />
                  </div>
                  <div className={`mt-2.5 font-bold text-xs ${showQrInline ? "text-white" : "text-slate-900"}`}>
                    QR Kod
                  </div>
                </button>
              </div>

              {/* QR Kod Görüntüleme Alanı */}
              {showQrInline && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-center space-y-2 animate-in fade-in zoom-in-95 duration-150">
                  <div className="mx-auto size-44 bg-white rounded-2xl flex items-center justify-center border border-slate-200 p-3 shadow-xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                        shareUrl
                      )}`}
                      alt="Hasta QR Kodu"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Hasta telefon kamerasını QR koda doğrultarak sunumu şifresiz ve doğrudan açabilir.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Paylaşım Toast Bildirimi */}
      {shareToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-slate-900 text-white px-4 py-3 text-xs font-bold shadow-2xl animate-in slide-in-from-bottom duration-200">
          <Check className="size-4 text-emerald-400" />
          <span>{shareToast}</span>
        </div>
      )}
    </div>
  );
}
