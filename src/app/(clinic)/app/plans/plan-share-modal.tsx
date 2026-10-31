"use client";

import React, { useEffect, useState, useTransition } from "react";
import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Globe,
  Loader2,
  QrCode,
  RefreshCw,
  Share2,
  ShieldCheck,
  Sparkles,
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

import type { PlanAnalytics, ShareLink } from "@/modules/share/domain/share";
import {
  createShareLinkAction,
  getPlanAnalyticsAction,
  listShareLinksAction,
  revokeShareLinkAction,
} from "./actions";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  planTitle: string;
  patientName: string;
  patientContact?: string;
  clinicName?: string;
  isReady: boolean;
}

export function PlanShareModal({
  isOpen,
  onClose,
  planId,
  planTitle,
  patientName,
  patientContact,
  clinicName,
  isReady,
}: Props) {
  const [links, setLinks] = useState<ShareLink[]>([]);
  const [activeToken, setActiveToken] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<PlanAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [showQrInline, setShowQrInline] = useState(false);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setShowRevokeConfirm(false);
      setShowSharePopup(false);
      setShowQrInline(false);
      return;
    }

    let mounted = true;
    setLoading(true);
    setErrorMsg(null);

    // Try loading saved token for this plan
    const savedToken =
      typeof window !== "undefined"
        ? localStorage.getItem(`tp_share_token_${planId}`)
        : null;
    if (savedToken) {
      setActiveToken(savedToken);
    }

    Promise.all([
      listShareLinksAction(planId),
      getPlanAnalyticsAction(planId),
    ])
      .then(([linksRes, analyticsRes]) => {
        if (!mounted) return;
        if (linksRes.success && linksRes.data) {
          const linksList = Array.isArray(linksRes.data)
            ? linksRes.data
            : (linksRes.data as any)?.links || [];
          setLinks(linksList);

          const valid = linksList.find(
            (l: any) => !l.revoked_at && new Date(l.expires_at) > new Date()
          );
          if (valid) {
            if (!savedToken && valid.token_prefix) {
              setActiveToken(valid.token_prefix);
            }
          } else if (isReady) {
            // Automatically generate share link if presentation is ready
            createShareLinkAction(planId, 720).then((sRes) => {
              if (sRes.success && sRes.data && mounted) {
                setLinks([sRes.data.link]);
                setActiveToken(sRes.data.token);
                if (typeof window !== "undefined") {
                  localStorage.setItem(`tp_share_token_${planId}`, sRes.data.token);
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
        if (mounted) setErrorMsg("Paylaşım bilgileri yüklenemedi.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isOpen, planId]);

  if (!isOpen) return null;

  const safeLinks = Array.isArray(links) ? links : [];
  const activeLink = safeLinks.find(
    (l) => !l.revoked_at && new Date(l.expires_at) > new Date()
  );
  const appBase = typeof window !== "undefined" ? window.location.origin : "";

  // If saved token matches the prefix of active link, use it
  const currentToken =
    activeToken && activeLink && activeToken.startsWith(activeLink.token_prefix || "")
      ? activeToken
      : activeToken || activeLink?.token_prefix || "";

  const currentUrl = currentToken ? `${appBase}/p/${currentToken}` : "";

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

  const handleCreateLink = () => {
    startTransition(async () => {
      setErrorMsg(null);
      const res = await createShareLinkAction(planId, 720); // 30 days
      if (res.success && res.data) {
        setLinks((prev) => [
          res.data!.link,
          ...prev.filter((l) => l.id !== res.data!.link.id),
        ]);
        setActiveToken(res.data.token);
        if (typeof window !== "undefined") {
          localStorage.setItem(`tp_share_token_${planId}`, res.data.token);
        }
        // Refetch analytics
        const aRes = await getPlanAnalyticsAction(planId);
        if (aRes.success && aRes.data) setAnalytics(aRes.data);
      } else {
        setErrorMsg(res.error || "Paylaşım linki oluşturulamadı");
      }
    });
  };

  const handleRevoke = (linkId: string) => {
    startTransition(async () => {
      setErrorMsg(null);
      const res = await revokeShareLinkAction(planId, linkId);
      if (res.success) {
        setLinks((prev) =>
          prev.map((l) =>
            l.id === linkId
              ? { ...l, revoked_at: new Date().toISOString() }
              : l
          )
        );
        setActiveToken(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem(`tp_share_token_${planId}`);
        }
      } else {
        setErrorMsg(res.error || "İptal edilemedi");
      }
    });
  };

  const handleCopyLink = () => {
    if (!currentUrl) return;
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareMessage = `Sayın ${patientName || "Hastamız"}, kliniğimiz tarafından hazırlanan size özel interaktif 3D tedavi planınızı aşağıdaki bağlantıdan inceleyebilirsiniz:\n\n${currentUrl}`;
  const whatsappUrl = `https://wa.me/${(patientContact || "").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(shareMessage)}`;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm transition-all duration-300">
        <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Silme Onay Uyarısı */}
        {showRevokeConfirm && (
          <div
            className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-xs animate-in fade-in duration-150"
            onClick={() => setShowRevokeConfirm(false)}
          >
            <div
              className="w-full max-w-xs rounded-2xl border border-slate-100 bg-white p-5 shadow-2xl text-center animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-8 ring-rose-50/50">
                <Trash2 className="size-5" />
              </div>
              <h4 className="mt-3.5 text-sm font-bold text-slate-900">
                Emin misiniz?
              </h4>
              <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                Bu paylaşım linkini silmek istediğinize emin misiniz? Hasta artık bu bağlantıyla sunuma erişemeyecektir.
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
                  {isPending ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="size-3.5" />
                  )}
                  <span>Evet, Sil</span>
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Plan Sunumu & Dokümanlar
              </h3>
              {activeLink && (
                analytics?.accepted ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                    <CheckCircle2 className="size-3 text-emerald-600" />
                    Onaylandı
                  </span>
                ) : (analytics?.total_views ?? activeLink.views_count) > 0 ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-0.5 text-[11px] font-bold text-cyan-700">
                    <Eye className="size-3 text-cyan-600" />
                    İncelendi
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
                    <Clock className="size-3 text-amber-600" />
                    Onay Bekliyor
                  </span>
                )
              )}
            </div>
            <p className="mt-0.5 text-xs text-slate-500 font-medium">
              {patientName} {planTitle ? `• ${planTitle}` : ""}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex size-8 cursor-pointer items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X className="size-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
            {errorMsg}
          </div>
        )}

        {/* Content */}
        <div className="py-5 space-y-4">
          {/* 1. Kurumsal PDF Kartı */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 transition hover:bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
                <FileText className="size-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Kurumsal Teklif PDF&apos;i</h4>
                <p className="text-[11px] text-slate-500">Resmi tedavi planı, seanslar ve fiyat dökümü</p>
              </div>
            </div>
            <a
              href={`/api/plans/${planId}/pdf`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition active:scale-95"
            >
              <Download className="size-3.5" />
              <span>İndir</span>
            </a>
          </div>

          {/* 2. İnteraktif Web Sunumu Kartı */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-xs">
                  <Globe className="size-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">İnteraktif Web Sunumu</h4>
                  <p className="text-[11px] text-slate-500">Hastaya özel 3D tedavi simülasyonu ve detaylar</p>
                </div>
              </div>

              {activeLink && (
                <button
                  type="button"
                  onClick={() => setShowSharePopup(true)}
                  title="Sunumu Paylaş"
                  className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-2xs hover:bg-slate-100 hover:text-slate-900 transition active:scale-95"
                >
                  <Share2 className="size-4 text-slate-600" />
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-6 text-slate-400">
                <Loader2 className="size-5 animate-spin text-cyan-600" />
                <span className="ml-2 text-xs font-medium">Yükleniyor...</span>
              </div>
            ) : activeLink ? (
              <div className="space-y-3 pt-1">
                {/* Hasta Etkileşim & Takip Şeridi */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-slate-200/80 bg-white p-2.5 px-3.5 shadow-2xs">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Görüntülenme Rozeti */}
                    {totalViews > 0 ? (
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-200/80 bg-cyan-50/80 px-2.5 py-1 text-[11px] font-bold text-cyan-800">
                        <span className="relative flex size-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                          <span className="relative inline-flex size-2 rounded-full bg-cyan-500" />
                        </span>
                        <span>{totalViews} Görüntülenme</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                        <span className="size-1.5 rounded-full bg-slate-300" />
                        <span>Henüz açılmadı</span>
                      </span>
                    )}

                    {/* Son İnceleme Tarihi */}
                    {formattedLastViewed && (
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50/80 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                        <Clock className="size-3 text-slate-400" />
                        <span>Son: {formattedLastViewed}</span>
                      </span>
                    )}

                    {/* Dijital İmza Varsa */}
                    {analytics?.accepted_signature && (
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
                        <CheckCircle2 className="size-3 text-emerald-600" />
                        <span>İmza: {analytics.accepted_signature}</span>
                      </span>
                    )}
                  </div>

                  {/* Link İptali Butonu (Sadece Logo) */}
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => setShowRevokeConfirm(true)}
                    title="Paylaşım linkini sil"
                    aria-label="Paylaşım linkini sil"
                    className="flex size-7 cursor-pointer items-center justify-center rounded-lg border border-slate-200/80 bg-white text-slate-400 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition active:scale-95 shadow-2xs disabled:opacity-50"
                  >
                    {isPending ? (
                      <Loader2 className="size-3.5 animate-spin text-rose-500" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-500">Henüz aktif bir sunum bağlantısı yok.</span>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleCreateLink}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:opacity-95 transition disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Hazırlanıyor...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-3.5" />
                      <span>Sunum Linki Oluştur</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Sunumu Paylaş Popup (3D Treatment ile aynı) */}
    {showSharePopup && (
      <div
        className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150"
        onClick={() => setShowSharePopup(false)}
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
              onClick={() => setShowSharePopup(false)}
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
                value={currentUrl}
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
                  {copied ? (
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
                  href={currentUrl}
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
                <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-2xs group-hover:scale-105 transition-transform">
                  <WhatsAppIcon className="size-6" />
                </div>
                <div className="mt-2.5 font-bold text-xs text-slate-900">WhatsApp</div>
              </button>

              {/* Instagram */}
              <button
                type="button"
                onClick={() => {
                  handleCopyLink();
                  window.open("https://instagram.com", "_blank");
                }}
                className="group flex flex-col items-center justify-center rounded-2xl border border-pink-200 bg-pink-50/50 hover:bg-pink-50 hover:border-pink-300 p-4 transition cursor-pointer text-center shadow-2xs"
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
                      currentUrl
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
  </>
  );
}

