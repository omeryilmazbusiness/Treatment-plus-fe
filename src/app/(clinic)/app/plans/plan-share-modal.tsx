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
  RefreshCw,
  Share2,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

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
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setShowRevokeConfirm(false);
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

  const handleCopy = () => {
    if (!currentUrl) return;
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
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
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-6 text-slate-400">
                <Loader2 className="size-5 animate-spin text-cyan-600" />
                <span className="ml-2 text-xs font-medium">Yükleniyor...</span>
              </div>
            ) : activeLink ? (
              <div className="space-y-3 pt-1">
                {/* 2 Temiz Buton: Önizle & Linki Kopyala */}
                <div className="grid grid-cols-2 gap-2.5">
                  <a
                    href={currentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 hover:text-slate-900 transition active:scale-95"
                  >
                    <ExternalLink className="size-3.5 text-slate-500" />
                    <span>Önizle</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 hover:text-slate-900 transition active:scale-95"
                  >
                    {copied ? (
                      <>
                        <Check className="size-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Kopyalandı</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5 text-slate-500" />
                        <span>Linki Kopyala</span>
                      </>
                    )}
                  </button>
                </div>

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

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}

