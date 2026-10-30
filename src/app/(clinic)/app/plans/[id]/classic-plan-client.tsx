"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState, useTransition } from "react";
import {
  AlertCircle,
  ArrowLeft,
  BadgePercent,
  CalendarPlus,
  CheckCircle2,
  Clock,
  Download,
  FileCheck2,
  FileText,
  Lock,
  Phone,
  Plus,
  Receipt,
  Save,
  Share2,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import type { Diagnosis, PriceList, Treatment } from "@/modules/catalog/domain/catalog";
import type { ClinicSettings } from "@/modules/clinic/domain/clinic";
import type { Patient, Plan } from "@/modules/plan/domain/plan";
import { formatMoney, money, type Currency } from "@/shared/money";
import { PriceInput } from "@/ui/price-input";
import { TreatmentCombobox } from "@/ui/treatment-combobox";
import { generatePdfAction, readyPlanAction, savePlanDetailsAction } from "../actions";
import { PlanShareModal } from "../plan-share-modal";

interface Props {
  workspaceId: string;
  initialPlan: Plan;
  patients: Patient[];
  diagnosesCatalog: Diagnosis[];
  treatmentsCatalog: Treatment[];
  priceLists: PriceList[];
  clinicSettings: ClinicSettings;
}

const QUICK_TEETH = {
  upper: ["18", "17", "16", "15", "14", "13", "12", "11", "21", "22", "23", "24", "25", "26", "27", "28"],
  lower: ["48", "47", "46", "45", "44", "43", "42", "41", "31", "32", "33", "34", "35", "36", "37", "38"],
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0];
  const last = parts[parts.length - 1];
  if (!first) return "H";
  if (parts.length === 1 || !last) return first.slice(0, 2).toUpperCase();
  return (first.charAt(0) + last.charAt(0)).toUpperCase();
}

type VisitSnapshot = {
  title: string;
  phase_label: string;
  healing_note: string;
};

type ItemSnapshot = {
  treatment_id?: string;
  tooth_number?: string;
  description?: string;
  quantity: number | string;
  unit_price: number;
  is_package: boolean;
  visit_id?: string;
};

type DiscountSnapshot = {
  label: string;
  amount: number;
};

function createPlanSnapshot(
  t: string,
  loc: string,
  curr: string,
  diags: string[],
  vsts: VisitSnapshot[],
  its: ItemSnapshot[],
  dscs: DiscountSnapshot[]
) {
  return JSON.stringify({
    title: t.trim(),
    locale: loc,
    currency: curr,
    diagnoses: [...diags].sort(),
    visits: vsts.map((v) => ({
      title: v.title.trim(),
      phase_label: v.phase_label.trim(),
      healing_note: v.healing_note.trim(),
    })),
    items: its.map((it) => ({
      treatment_id: it.treatment_id,
      tooth_number: (it.tooth_number || "").trim(),
      description: (it.description || "").trim(),
      quantity: Number(it.quantity) || 1,
      unit_price: Number(it.unit_price) || 0,
      is_package: Boolean(it.is_package),
      visit_id: it.visit_id,
    })),
    discounts: dscs.map((d) => ({
      label: d.label.trim(),
      amount: Number(d.amount) || 0,
    })),
  });
}

export function ClassicPlanClient({
  workspaceId,
  initialPlan,
  treatmentsCatalog,
  priceLists,
  clinicSettings,
}: Props) {
  const router = useRouter();
  const [plan, setPlan] = useState<Plan>(initialPlan);
  const isLocked = Boolean(plan.status && plan.status.toLowerCase() !== "draft");

  // Plan presentation & header states
  const [title, setTitle] = useState(plan.title || "Tedavi Planı");
  const palette = plan.palette || clinicSettings?.palette || "navy";
  const [locale] = useState<"tr" | "en">(
    plan.locale || clinicSettings?.locale || "tr"
  );
  const [currency, setCurrency] = useState<Currency>(
    plan.currency || clinicSettings?.currency || "TRY"
  );
  const [diagnoses] = useState<string[]>(plan.diagnoses ?? []);

  // Visits state
  const [visits, setVisits] = useState(
    (plan.visits && plan.visits.length > 0
      ? plan.visits
      : [
          { id: "v-temp-1", orderNum: 1, title: "1. Seans: Muayene & Hazırlık", phaseLabel: "1. Aşama", healingNote: "", chartTeeth: [] as string[] },
          { id: "v-temp-2", orderNum: 2, title: "2. Seans: Tedavi & Simantasyon", phaseLabel: "2. Aşama", healingNote: "", chartTeeth: [] as string[] },
        ]
    ).map((v, i) => ({
      id: v.id ? String(v.id) : `v-temp-${i + 1}`,
      order_num: v.orderNum || i + 1,
      title: v.title || `${i + 1}. Seans`,
      phase_label: v.phaseLabel || "",
      healing_note: v.healingNote || "",
      chart_teeth: v.chartTeeth || [],
    }))
  );


  // Items state
  const [items, setItems] = useState(
    (plan.items ?? []).map((it, i) => ({
      id: it.id ? String(it.id) : undefined,
      visit_id: it.visitId ? String(it.visitId) : visits[0]?.id,
      treatment_id: it.treatmentId ? String(it.treatmentId) : undefined,
      treatment_name: it.treatmentName || "",
      animation_code: it.animationCode || "",
      tooth_number: it.toothNumber || "",
      teeth:
        it.teeth && it.teeth.length > 0
          ? it.teeth
          : (it.toothNumber || "")
              .split(/[,;\s]+/)
              .map((s) => s.trim())
              .filter((s) => s.length > 0 && /^\d+$/.test(s)),
      description: it.description || "",
      quantity: it.quantity || 1,
      unit_price: it.unitPrice || 0, // minor units (kuruş)
      is_package: Boolean(it.isPackage),
      order_num: it.orderNum || i + 1,
    }))
  );

  // Discounts state
  const [discounts, setDiscounts] = useState(
    (plan.discounts ?? []).map((d, i) => ({
      id: d.id ? String(d.id) : undefined,
      label: d.label || "İndirim",
      amount: d.amount || 0, // minor units (kuruş)
      order_num: d.orderNum || i + 1,
    }))
  );

  // Active tooth picking modal or inline selector state
  const [activeItemToothIndex, setActiveItemToothIndex] = useState<number | null>(null);

  // FDI Diş seti açıkken dışarıya tıklandığında otomatik kapatma
  useEffect(() => {
    if (activeItemToothIndex === null) return;

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      if (
        target.closest("[data-tooth-picker]") ||
        target.closest("[data-tooth-input]")
      ) {
        return;
      }

      setActiveItemToothIndex(null);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveItemToothIndex(null);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeItemToothIndex]);

  const [isPending, startTransition] = useTransition();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "ok" | "err" } | null>(null);
  const [showConfirmReady, setShowConfirmReady] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Price map from default price list
  const defaultList = priceLists.find((pl) => pl.isDefault) || priceLists[0];
  const priceMap = useMemo(() => {
    const map = new Map<string, number>();
    if (defaultList?.items) {
      for (const pi of defaultList.items) {
        map.set(String(pi.treatmentId), pi.amount);
      }
    }
    return map;
  }, [defaultList]);

  // Dirty state tracking
  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    createPlanSnapshot(title, locale, currency, diagnoses, visits, items, discounts)
  );

  const isDirty = useMemo(() => {
    return (
      createPlanSnapshot(title, locale, currency, diagnoses, visits, items, discounts) !==
      savedSnapshot
    );
  }, [title, locale, currency, diagnoses, visits, items, discounts, savedSnapshot]);

  // Live calculated totals for interactive display
  const liveSubtotal = useMemo(() => {
    return items.reduce((acc, it) => {
      if (it.is_package) return acc;
      return acc + (Number(it.quantity) || 1) * (Number(it.unit_price) || 0);
    }, 0);
  }, [items]);

  const liveDiscount = useMemo(() => {
    return discounts.reduce((acc, d) => acc + (Number(d.amount) || 0), 0);
  }, [discounts]);

  const liveGrandTotal = Math.max(0, liveSubtotal - liveDiscount);

  // Visit helpers
  const handleAddVisit = () => {
    if (isLocked) return;
    const nextNum = visits.length + 1;
    const newV = {
      id: `v-temp-${Date.now()}`,
      order_num: nextNum,
      title: `${nextNum}. Seans: Kontrol & İşlem`,
      phase_label: `${nextNum}. Aşama`,
      healing_note: "",
      chart_teeth: [],
    };
    setVisits([...visits, newV]);
  };

  const handleUpdateVisitField = (
    vId: string,
    field: "title" | "phase_label" | "healing_note",
    value: string
  ) => {
    if (isLocked) return;
    setVisits(visits.map((v) => (v.id === vId ? { ...v, [field]: value } : v)));
  };

  const handleRemoveVisit = (vId: string) => {
    if (isLocked || visits.length <= 1) return;
    setVisits(visits.filter((v) => v.id !== vId));
    // Re-assign items of deleted visit to first visit
    const remainingFirstId = visits.find((v) => v.id !== vId)?.id;
    setItems(items.map((it) => (it.visit_id === vId ? { ...it, visit_id: remainingFirstId } : it)));
  };

  // Item helpers
  const handleAddItem = (visitId: string) => {
    if (isLocked) return;
    const firstTr = treatmentsCatalog[0];
    const defaultAmount = firstTr ? priceMap.get(String(firstTr.id)) ?? 0 : 0;

    const newItem = {
      id: undefined,
      visit_id: visitId,
      treatment_id: firstTr ? String(firstTr.id) : undefined,
      treatment_name: firstTr ? firstTr.name : "Yeni Tedavi",
      animation_code: "",
      tooth_number: "",
      teeth: [] as string[],
      description: "",
      quantity: 1,
      unit_price: defaultAmount,
      is_package: false,
      order_num: items.length + 1,
    };
    setItems([...items, newItem]);
  };

  const handleTreatmentChange = (itemIndex: number, treatId: string) => {
    if (isLocked) return;
    const tr = treatmentsCatalog.find((t) => String(t.id) === treatId);
    if (!tr) return;
    const catalogAmount = priceMap.get(treatId) ?? 0;

    setItems((prev) =>
      prev.map((it, idx) =>
        idx === itemIndex
          ? {
              ...it,
              treatment_id: treatId,
              treatment_name: tr.name,
              unit_price: catalogAmount,
              is_package: false,
            }
          : it
      )
    );
  };

  const handleItemFieldChange = (
    itemIndex: number,
    field: "tooth_number" | "quantity" | "unit_price" | "is_package" | "description",
    value: unknown
  ) => {
    if (isLocked) return;
    setItems((prev) =>
      prev.map((it, idx) => {
        if (idx !== itemIndex) return it;
        return { ...it, [field]: value };
      })
    );
  };

  const handleToothNumberChange = (itemIndex: number, rawValue: string) => {
    if (isLocked) return;
    const parsedTeeth = rawValue
      .split(/[,;\s]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && /^\d+$/.test(s));

    setItems((prev) =>
      prev.map((it, idx) => {
        if (idx !== itemIndex) return it;
        return {
          ...it,
          tooth_number: rawValue,
          teeth: parsedTeeth,
          quantity: parsedTeeth.length > 0 ? parsedTeeth.length : it.quantity || 1,
        };
      })
    );
  };

  const handleToggleToothForItem = (itemIndex: number, tooth: string) => {
    if (isLocked) return;
    setItems((prev) =>
      prev.map((it, idx) => {
        if (idx !== itemIndex) return it;
        const currentTeeth = it.teeth || [];
        const nextTeeth = currentTeeth.includes(tooth)
          ? currentTeeth.filter((t) => t !== tooth)
          : [...currentTeeth, tooth];
        return {
          ...it,
          teeth: nextTeeth,
          tooth_number: nextTeeth.join(", "),
          quantity: nextTeeth.length > 0 ? nextTeeth.length : 1,
        };
      })
    );
  };

  const handleRemoveItem = (itemIndex: number) => {
    if (isLocked) return;
    setItems(items.filter((_, idx) => idx !== itemIndex));
  };

  // Discount helpers
  const handleAddDiscount = () => {
    if (isLocked) return;
    setDiscounts([
      ...discounts,
      {
        id: undefined,
        label: "Nakit İndirimi",
        amount: 20000,
        order_num: discounts.length + 1,
      },
    ]);
  };

  const handleRemoveDiscount = (idx: number) => {
    if (isLocked) return;
    setDiscounts(discounts.filter((_, i) => i !== idx));
  };

  // Save Draft (Sends to server, server calculates and returns authoritative totals)
  const handleSaveDraft = () => {
    if (isLocked || !isDirty) return;
    setMessage(null);

    startTransition(async () => {
      const res = await savePlanDetailsAction(String(plan.id), {
        workspaceId,
        title: title.trim(),
        palette,
        locale,
        currency,
        diagnoses,
        visits: visits.map((v, i) => ({
          id: v.id?.startsWith("v-temp-") ? undefined : v.id,
          order_num: i + 1,
          title: v.title,
          phase_label: v.phase_label,
          healing_note: v.healing_note,
          chart_teeth: v.chart_teeth,
        })),
        items: items.map((it, i) => ({
          id: it.id,
          visit_id: it.visit_id?.startsWith("v-temp-") ? undefined : it.visit_id,
          treatment_id: it.treatment_id,
          treatment_name: it.treatment_name,
          animation_code: it.animation_code,
          tooth_number: it.tooth_number || undefined,
          teeth: it.teeth,
          description: it.description,
          quantity: Number(it.quantity) || 1,
          unit_price: Number(it.unit_price) || 0,
          is_package: Boolean(it.is_package),
          order_num: i + 1,
        })),
        discounts: discounts.map((d, i) => ({
          id: d.id,
          label: d.label,
          amount: Number(d.amount) || 0,
          order_num: i + 1,
        })),
      });

      if (!res.success || !res.data) {
        setMessage({ text: res.error || "Plan kaydedilemedi", type: "err" });
        return;
      }

      setPlan(res.data);
      if (res.data.currency) {
        setCurrency(res.data.currency);
      }
      setSavedSnapshot(
        createPlanSnapshot(
          res.data.title || title,
          res.data.locale || locale,
          res.data.currency || currency,
          res.data.diagnoses ?? diagnoses,
          visits,
          items,
          discounts
        )
      );
      setMessage({
        text: "Plan başarıyla kaydedildi.",
        type: "ok",
      });
    });
  };

  // Lock and ready
  const handleLockReady = () => {
    setMessage(null);
    setShowConfirmReady(false);

    startTransition(async () => {
      // First save current inputs if plan is still in draft
      if (!isLocked) {
        await savePlanDetailsAction(String(plan.id), {
          workspaceId,
          title: title.trim(),
          palette,
          locale,
          currency,
          diagnoses,
          visits: visits.map((v, i) => ({
            id: v.id?.startsWith("v-temp-") ? undefined : v.id,
            order_num: i + 1,
            title: v.title,
            phase_label: v.phase_label,
            healing_note: v.healing_note,
            chart_teeth: v.chart_teeth,
          })),
          items: items.map((it, i) => ({
            id: it.id,
            visit_id: it.visit_id?.startsWith("v-temp-") ? undefined : it.visit_id,
            treatment_id: it.treatment_id,
            treatment_name: it.treatment_name,
            animation_code: it.animation_code,
            tooth_number: it.tooth_number || undefined,
            teeth: it.teeth,
            description: it.description,
            quantity: Number(it.quantity) || 1,
            unit_price: Number(it.unit_price) || 0,
            is_package: Boolean(it.is_package),
            order_num: i + 1,
          })),
          discounts: discounts.map((d, i) => ({
            id: d.id,
            label: d.label,
            amount: Number(d.amount) || 0,
            order_num: i + 1,
          })),
        });
      }

      // Now set ready
      const res = await readyPlanAction(String(plan.id), workspaceId);
      if (!res.success || !res.data) {
        setMessage({ text: res.error || "Plan onaylanamadı", type: "err" });
        return;
      }

      // Trigger background PDF generation
      generatePdfAction(String(plan.id)).catch(() => {});

      setPlan(res.data);
      if (res.data.currency) {
        setCurrency(res.data.currency);
      }
      router.refresh();
      setMessage({
        text: "Tedavi planı başarıyla onaylandı. Kurumsal PDF ve dijital hasta sunumu hazır.",
        type: "ok",
      });
    });
  };

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      window.open(`/api/plans/${plan.id}/pdf`, "_blank");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const patientName = plan.patient?.name || "Kayıtlı Hasta";

  return (
    <div className="mx-auto max-w-7xl space-y-5 pb-12">
      {/* 1. Üst Başlık & Hasta / Plan Kartı */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Sol: Geri Dön & Hasta Bilgisi */}
          <div className="flex items-center gap-3.5">
            <Link
              href="/app/plans"
              className="flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900"
              title="Tedavi Planlarına Dön"
            >
              <ArrowLeft className="size-4" />
            </Link>

            <div className="hidden h-8 w-px bg-slate-200 sm:block" />

            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white shadow-2xs">
                {getInitials(patientName)}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Hasta Profili
                </span>
                <h1 className="text-sm font-bold text-slate-900 leading-tight">
                  {patientName}
                </h1>
                {plan.patient?.contact && (
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <Phone className="size-3 text-slate-400" />
                    <span>{plan.patient.contact}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Orta: Plan Başlığı Girişi */}
          <div className="w-full lg:max-w-sm xl:max-w-md">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Plan Başlığı
            </label>
            <input
              type="text"
              disabled={isLocked}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: İmplant & Kuron Tedavisi"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 hover:bg-white focus:bg-white focus:border-slate-900 focus:outline-hidden transition shadow-2xs disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>

          {/* Sağ: İstatistik & Durum Rozeti */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/70 px-3 py-2 text-xs font-semibold text-slate-600">
              <span>{visits.length} Seans</span>
              <span className="text-slate-300">•</span>
              <span>{items.length} Kalem</span>
            </div>

            {isLocked ? (
              <span
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold shadow-2xs ${
                  plan.status?.toLowerCase() === "accepted"
                    ? "border-emerald-300 bg-emerald-100/80 text-emerald-900"
                    : plan.status?.toLowerCase() === "viewed"
                    ? "border-cyan-200 bg-cyan-50 text-cyan-800"
                    : plan.status?.toLowerCase() === "sent"
                    ? "border-blue-200 bg-blue-50 text-blue-800"
                    : "border-emerald-200 bg-emerald-50 text-emerald-800"
                }`}
              >
                <CheckCircle2 className="size-4 text-emerald-600" />
                <span>
                  {plan.status?.toLowerCase() === "accepted"
                    ? "Hasta Onayladı"
                    : plan.status?.toLowerCase() === "viewed"
                    ? "Hasta İnceledi"
                    : plan.status?.toLowerCase() === "sent"
                    ? "Hastaya Gönderildi"
                    : "Onaylandı (Hazır)"}
                </span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs font-semibold text-amber-800 shadow-2xs">
                <Clock className="size-4 text-amber-600" />
                <span>Taslak Modu</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mesaj Bildirimi */}
      {message && (
        <div
          className={`flex items-center justify-between rounded-2xl border p-3.5 text-xs font-medium shadow-2xs ${
            message.type === "ok"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-rose-200 bg-rose-50 text-rose-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "ok" ? (
              <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
            ) : (
              <X className="size-4 shrink-0 text-rose-600" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="text-slate-400 hover:text-slate-700"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}



      {/* 4. Ana Bölüm: Seanslar & Tedaviler VS Hesap Özeti (Sidebar) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Sol 8 Kolon: Seanslar & İndirimler */}
        <div className="space-y-5 lg:col-span-8">
          {visits.map((visit) => {
            const visitItems = items.filter((it) => it.visit_id === visit.id);
            const visitSubtotal = visitItems.reduce((acc, it) => {
              if (it.is_package) return acc;
              return acc + (Number(it.quantity) || 1) * (Number(it.unit_price) || 0);
            }, 0);

            return (
              <div
                key={visit.id}
                className="rounded-2xl border border-slate-200/80 bg-white shadow-xs"
              >
                {/* Seans Başlığı & Kompakt Kontroller */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-t-2xl border-b border-slate-100 bg-slate-50/50 px-4 py-3 sm:px-5">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white shadow-2xs">
                      {visit.order_num}
                    </span>
                    <input
                      type="text"
                      disabled={isLocked}
                      value={visit.title}
                      onChange={(e) =>
                        handleUpdateVisitField(visit.id, "title", e.target.value)
                      }
                      placeholder="Seans Başlığı..."
                      className="rounded-lg border border-transparent bg-transparent px-2 py-0.5 text-sm font-bold text-slate-900 transition hover:bg-white hover:border-slate-200 focus:bg-white focus:border-slate-300 focus:outline-hidden disabled:opacity-90"
                    />
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 font-medium">
                        Ara Toplam:{" "}
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {formatMoney(money(visitSubtotal, currency))}
                      </span>
                    </div>

                    {!isLocked && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleAddItem(visit.id)}
                          className="inline-flex cursor-pointer items-center gap-1 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-slate-800"
                        >
                          <Plus className="size-3.5" />
                          <span>Tedavi Ekle</span>
                        </button>

                        {visits.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveVisit(visit.id)}
                            className="cursor-pointer rounded-xl border border-slate-200 bg-white p-1.5 text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                            title="Seansı Sil"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Tedavi Kalemleri Listesi */}
                <div>
                  {visitItems.length === 0 ? (
                    <div className="py-7 text-center text-xs text-slate-400">
                      Bu seansa henüz tedavi kalemi eklenmedi. &ldquo;+ Tedavi Ekle&rdquo; butonuna tıklayın.
                    </div>
                  ) : (
                    <div>
                      {/* Sütun Başlıkları */}
                      <div className="hidden grid-cols-12 gap-3 border-b border-slate-100 bg-slate-50/30 px-5 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:grid">
                        <div className="col-span-4">İşlem / Tedavi</div>
                        <div className="col-span-2 text-center">Diş (FDI)</div>
                        <div className="col-span-1 text-center">Adet</div>
                        <div className="col-span-2 text-right">Birim Fiyat</div>
                        <div className="col-span-2 text-right">Tutar</div>
                        <div className="col-span-1"></div>
                      </div>

                      {/* Kalem Satırları */}
                      <div className="divide-y divide-slate-100">
                        {visitItems.map((item) => {
                          const originalIndex = items.findIndex((it) => it === item);
                          const lineTotalMinor =
                            (Number(item.quantity) || 1) * (Number(item.unit_price) || 0);

                          return (
                            <div
                              key={originalIndex}
                              className="p-3 sm:px-5 sm:py-3 transition hover:bg-slate-50/50"
                            >
                              {/* Ana Satır: Tedavi, Diş, Adet, Fiyat, Toplam */}
                              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-12 sm:items-center sm:gap-3">
                                {/* Tedavi Seçimi */}
                                <div className="sm:col-span-4">
                                  <label className="block text-[10px] font-bold text-slate-400 sm:hidden mb-1">
                                    Tedavi
                                  </label>
                                  <TreatmentCombobox
                                    disabled={isLocked}
                                    value={item.treatment_id}
                                    treatmentName={item.treatment_name}
                                    treatments={treatmentsCatalog}
                                    priceMap={priceMap}
                                    currency={currency}
                                    onChange={(selectedId) =>
                                      handleTreatmentChange(originalIndex, selectedId)
                                    }
                                  />
                                </div>

                                {/* Diş No (FDI) */}
                                <div className="sm:col-span-2">
                                  <label className="block text-[10px] font-bold text-slate-400 sm:hidden mb-1">
                                    Diş No (FDI)
                                  </label>
                                  <input
                                    data-tooth-input
                                    type="text"
                                    disabled={isLocked}
                                    placeholder="16, 21..."
                                    value={item.tooth_number}
                                    onFocus={() => {
                                      if (!isLocked && activeItemToothIndex !== originalIndex) {
                                        setActiveItemToothIndex(originalIndex);
                                      }
                                    }}
                                    onClick={() => {
                                      if (!isLocked && activeItemToothIndex !== originalIndex) {
                                        setActiveItemToothIndex(originalIndex);
                                      }
                                    }}
                                    onChange={(e) =>
                                      handleToothNumberChange(
                                        originalIndex,
                                        e.target.value
                                      )
                                    }
                                    className={`w-full cursor-pointer rounded-xl border bg-slate-50/50 hover:bg-white focus:bg-white px-2.5 py-1.5 text-center text-xs font-semibold text-slate-900 shadow-2xs focus:border-slate-900 focus:outline-hidden transition disabled:cursor-not-allowed disabled:bg-slate-100 ${
                                      activeItemToothIndex === originalIndex
                                        ? "border-slate-900 bg-white ring-2 ring-slate-900/10"
                                        : "border-slate-200"
                                    }`}
                                    title="Diş setini açmak için tıklayın"
                                  />
                                </div>

                                {/* Adet */}
                                <div className="sm:col-span-1">
                                  <label className="block text-[10px] font-bold text-slate-400 sm:hidden mb-1">
                                    Adet
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    disabled={isLocked}
                                    value={item.quantity}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      handleItemFieldChange(
                                        originalIndex,
                                        "quantity",
                                        val === "" ? "" : Math.max(1, parseInt(val, 10) || 1)
                                      );
                                    }}
                                    onBlur={() => {
                                      if (!item.quantity || Number(item.quantity) < 1) {
                                        handleItemFieldChange(originalIndex, "quantity", 1);
                                      }
                                    }}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white px-1.5 py-1.5 text-center text-xs font-semibold text-slate-900 shadow-2xs focus:border-slate-900 focus:outline-hidden transition disabled:bg-slate-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  />
                                </div>

                                {/* Birim Fiyat */}
                                <div className="sm:col-span-2">
                                  <label className="block text-[10px] font-bold text-slate-400 sm:hidden mb-1">
                                    Birim Fiyat
                                  </label>
                                  <PriceInput
                                    disabled={isLocked}
                                    value={item.unit_price}
                                    onChange={(val) =>
                                      handleItemFieldChange(originalIndex, "unit_price", val)
                                    }
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white px-2.5 py-1.5 text-right text-xs font-semibold text-slate-900 shadow-2xs focus:border-slate-900 focus:outline-hidden transition disabled:bg-slate-100"
                                  />
                                </div>

                                {/* Satır Toplamı (Tutar) */}
                                <div className="sm:col-span-2 text-right">
                                  <label className="block text-[10px] font-bold text-slate-400 sm:hidden mb-1">
                                    Tutar
                                  </label>
                                  <div className="text-xs font-bold text-slate-900 truncate">
                                    {formatMoney(money(lineTotalMinor, currency))}
                                  </div>
                                </div>

                                {/* Sil Butonu */}
                                <div className="flex sm:col-span-1 items-center justify-end sm:justify-center">
                                  {!isLocked && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveItem(originalIndex)}
                                      className="cursor-pointer rounded-lg p-1 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                                      title="Satırı Sil"
                                    >
                                      <Trash2 className="size-4" />
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Açılır FDI Diş Şeması Seçicisi */}
                              {activeItemToothIndex === originalIndex && !isLocked && (
                                <div
                                  data-tooth-picker
                                  className="mt-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 shadow-xs"
                                >
                                  <div className="flex items-center justify-between mb-2.5">
                                    <div className="text-xs font-bold text-slate-800">
                                      FDI Diş Numaralandırma Şeması
                                      <span className="ml-2 font-normal text-slate-500 text-[11px]">
                                        (Tıklayarak diş ekleyin veya çıkarın)
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setActiveItemToothIndex(null)}
                                      className="cursor-pointer rounded-lg bg-white border border-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition shadow-2xs"
                                    >
                                      Kapat
                                    </button>
                                  </div>

                                  <div className="space-y-2">
                                    {/* Üst Çene */}
                                    <div className="rounded-xl border border-slate-200/80 bg-white p-2">
                                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                        Üst Çene (Maksilla)
                                      </div>
                                      <div className="flex flex-wrap items-center gap-1">
                                        {/* Sağ Çeyrek (18-11) */}
                                        <div className="flex items-center gap-1">
                                          {QUICK_TEETH.upper.slice(0, 8).map((tooth) => {
                                            const isPicked = (item.teeth || []).includes(tooth);
                                            return (
                                              <button
                                                key={tooth}
                                                type="button"
                                                onClick={() =>
                                                  handleToggleToothForItem(originalIndex, tooth)
                                                }
                                                className={`size-7 rounded-lg text-[11px] font-bold transition shadow-2xs cursor-pointer ${
                                                  isPicked
                                                    ? "bg-slate-900 text-white"
                                                    : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
                                                }`}
                                              >
                                                {tooth}
                                              </button>
                                            );
                                          })}
                                        </div>
                                        <div className="h-6 w-px bg-slate-300 mx-1 hidden sm:block" />
                                        {/* Sol Çeyrek (21-28) */}
                                        <div className="flex items-center gap-1">
                                          {QUICK_TEETH.upper.slice(8).map((tooth) => {
                                            const isPicked = (item.teeth || []).includes(tooth);
                                            return (
                                              <button
                                                key={tooth}
                                                type="button"
                                                onClick={() =>
                                                  handleToggleToothForItem(originalIndex, tooth)
                                                }
                                                className={`size-7 rounded-lg text-[11px] font-bold transition shadow-2xs cursor-pointer ${
                                                  isPicked
                                                    ? "bg-slate-900 text-white"
                                                    : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
                                                }`}
                                              >
                                                {tooth}
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Alt Çene */}
                                    <div className="rounded-xl border border-slate-200/80 bg-white p-2">
                                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                        Alt Çene (Mandibula)
                                      </div>
                                      <div className="flex flex-wrap items-center gap-1">
                                        {/* Sağ Çeyrek (48-41) */}
                                        <div className="flex items-center gap-1">
                                          {QUICK_TEETH.lower.slice(0, 8).map((tooth) => {
                                            const isPicked = (item.teeth || []).includes(tooth);
                                            return (
                                              <button
                                                key={tooth}
                                                type="button"
                                                onClick={() =>
                                                  handleToggleToothForItem(originalIndex, tooth)
                                                }
                                                className={`size-7 rounded-lg text-[11px] font-bold transition shadow-2xs cursor-pointer ${
                                                  isPicked
                                                    ? "bg-slate-900 text-white"
                                                    : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
                                                }`}
                                              >
                                                {tooth}
                                              </button>
                                            );
                                          })}
                                        </div>
                                        <div className="h-6 w-px bg-slate-300 mx-1 hidden sm:block" />
                                        {/* Sol Çeyrek (31-38) */}
                                        <div className="flex items-center gap-1">
                                          {QUICK_TEETH.lower.slice(8).map((tooth) => {
                                            const isPicked = (item.teeth || []).includes(tooth);
                                            return (
                                              <button
                                                key={tooth}
                                                type="button"
                                                onClick={() =>
                                                  handleToggleToothForItem(originalIndex, tooth)
                                                }
                                                className={`size-7 rounded-lg text-[11px] font-bold transition shadow-2xs cursor-pointer ${
                                                  isPicked
                                                    ? "bg-slate-900 text-white"
                                                    : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
                                                }`}
                                              >
                                                {tooth}
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Seans Notu (Her Seans Kartının Altında Tek Not Alanı) */}
                <div className="flex items-center gap-2.5 border-t border-slate-100 bg-slate-50/50 px-4 py-2.5 sm:px-5 rounded-b-2xl">
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200/80 text-slate-500 shadow-2xs">
                    <FileText className="size-3.5" />
                  </div>
                  <input
                    type="text"
                    disabled={isLocked}
                    value={visit.healing_note}
                    onChange={(e) =>
                      handleUpdateVisitField(visit.id, "healing_note", e.target.value)
                    }
                    placeholder="Seans notu / hekim açıklaması ekleyin (opsiyonel)..."
                    className="w-full rounded-xl border border-transparent bg-transparent px-2.5 py-1 text-xs text-slate-800 placeholder:text-slate-400 transition hover:border-slate-200 hover:bg-white focus:border-slate-900 focus:bg-white focus:outline-hidden disabled:bg-transparent"
                  />
                </div>
              </div>
            );
          })}

          {/* Yeni Seans Ekle Butonu */}
          {!isLocked && (
            <button
              type="button"
              onClick={handleAddVisit}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-white py-4 text-xs font-bold text-slate-600 shadow-2xs transition hover:border-slate-900 hover:bg-slate-50 hover:text-slate-900"
            >
              <CalendarPlus className="size-4" />
              <span>+ Yeni Tedavi Seansı Ekle</span>
            </button>
          )}

          {/* İndirimler & İskontolar Kartı */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BadgePercent className="size-4 text-slate-700" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  İndirimler & İskontolar
                </h3>
                {discounts.length > 0 && (
                  <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                    - {formatMoney(money(liveDiscount, currency))}
                  </span>
                )}
              </div>
              {!isLocked && (
                <button
                  type="button"
                  onClick={handleAddDiscount}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs transition"
                >
                  <Plus className="size-3.5" />
                  <span>İndirim Ekle</span>
                </button>
              )}
            </div>

            <div className="mt-3 space-y-2">
              {discounts.length === 0 ? (
                <p className="py-2 text-center text-xs text-slate-400">
                  Bu plana henüz özel indirim uygulanmadı.
                </p>
              ) : (
                discounts.map((d, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/50 p-2 text-xs"
                  >
                    <input
                      type="text"
                      disabled={isLocked}
                      placeholder="İndirim Etiketi (Örn: Nakit İndirimi)"
                      value={d.label}
                      onChange={(e) =>
                        setDiscounts(
                          discounts.map((item, i) =>
                            i === idx ? { ...item, label: e.target.value } : item
                          )
                        )
                      }
                      className="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-hidden"
                    />
                    <div className="w-32">
                      <PriceInput
                        disabled={isLocked}
                        placeholder="Tutar"
                        value={d.amount}
                        onChange={(val) =>
                          setDiscounts(
                            discounts.map((item, i) =>
                              i === idx ? { ...item, amount: val } : item
                            )
                          )
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-right text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-hidden"
                      />
                    </div>
                    {!isLocked && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDiscount(idx)}
                        className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                        title="İndirimi Kaldır"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sağ 4 Kolon: Fiyatlandırma & Hesap Özeti (Sticky Sidebar) */}
        <div className="space-y-5 lg:col-span-4">
          <div className="sticky top-6 space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-slate-100 text-slate-800">
                    <Receipt className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      Fatura & Hesap Özeti
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Resmi kuruş hassasiyetli tutarlar
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                  {items.length} Kalem
                </span>
              </div>
            </div>

            {/* Fatura / Masraf Dökümü (Kasa Fişi & Fatura Formatı) */}
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5 space-y-3">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-dashed border-slate-200 pb-2">
                <span>Hizmet / İşlem</span>
                <span>Tutar</span>
              </div>

              {items.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-400">
                  Henüz tedavi kalemi eklenmedi.
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-3 pr-1 text-xs">
                  {visits.map((visit) => {
                    const visitItems = items.filter((it) => it.visit_id === visit.id);
                    if (visitItems.length === 0) return null;

                    return (
                      <div key={visit.id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                          <span className="truncate">{visit.title}</span>
                        </div>

                        <div className="space-y-1.5 pl-2 border-l-2 border-slate-200">
                          {visitItems.map((item, idx) => {
                            const itemTotal = item.is_package
                              ? 0
                              : (Number(item.quantity) || 1) * (Number(item.unit_price) || 0);

                            return (
                              <div
                                key={idx}
                                className="flex items-start justify-between gap-2 text-xs"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="truncate font-semibold text-slate-800">
                                    {item.treatment_name || "Tedavi"}
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                    {item.tooth_number && (
                                      <span className="rounded bg-slate-200/80 px-1 font-semibold text-slate-700">
                                        Diş: {item.tooth_number}
                                      </span>
                                    )}
                                    <span>
                                      {item.quantity} Adet ×{" "}
                                      {formatMoney(money(item.unit_price, currency))}
                                    </span>
                                  </div>
                                </div>

                                <div className="text-right shrink-0">
                                  {item.is_package ? (
                                    <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                                      Paket İçi
                                    </span>
                                  ) : (
                                    <span className="font-bold text-slate-900">
                                      {formatMoney(money(itemTotal, currency))}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {/* Varsa seansı olmayan kalemler */}
                  {items.filter((it) => !visits.some((v) => v.id === it.visit_id)).length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[11px] font-bold text-slate-700">Diğer İşlemler</div>
                      <div className="space-y-1.5 pl-2 border-l-2 border-slate-200">
                        {items
                          .filter((it) => !visits.some((v) => v.id === it.visit_id))
                          .map((item, idx) => {
                            const itemTotal = item.is_package
                              ? 0
                              : (Number(item.quantity) || 1) * (Number(item.unit_price) || 0);

                            return (
                              <div
                                key={idx}
                                className="flex items-start justify-between gap-2 text-xs"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="truncate font-semibold text-slate-800">
                                    {item.treatment_name || "Tedavi"}
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                    {item.tooth_number && (
                                      <span className="rounded bg-slate-200/80 px-1 font-semibold text-slate-700">
                                        Diş: {item.tooth_number}
                                      </span>
                                    )}
                                    <span>
                                      {item.quantity} Adet ×{" "}
                                      {formatMoney(money(item.unit_price, currency))}
                                    </span>
                                  </div>
                                </div>

                                <div className="text-right shrink-0">
                                  {item.is_package ? (
                                    <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                                      Paket İçi
                                    </span>
                                  ) : (
                                    <span className="font-bold text-slate-900">
                                      {formatMoney(money(itemTotal, currency))}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {/* Uygulanan İndirimler */}
                  {discounts.length > 0 && (
                    <div className="pt-2 border-t border-dashed border-slate-200 space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                        Uygulanan İndirimler
                      </div>
                      {discounts.map((d, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs text-rose-600"
                        >
                          <span className="truncate">{d.label || "İndirim"}</span>
                          <span className="font-bold shrink-0">
                            - {formatMoney(money(d.amount, currency))}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tutar Dökümü */}
            <div className="space-y-2 border-y border-slate-100 py-3 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Ara Toplam:</span>
                <span className="font-bold text-slate-900 text-sm">
                  {formatMoney(money(liveSubtotal, currency))}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Toplam İndirim:</span>
                <span className="font-bold text-rose-600 text-sm">
                  - {formatMoney(money(liveDiscount, currency))}
                </span>
              </div>
            </div>

            {/* Genel Toplam Vurgulu Kartı */}
            <div className="rounded-xl bg-slate-900 p-4 text-white shadow-xs">
              <div className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
                Genel Toplam (KDV Dahil)
              </div>
              <div className="mt-1 text-2xl font-black tracking-tight">
                {formatMoney(money(liveGrandTotal, currency))}
              </div>
            </div>

            {/* Eylem Butonları */}
            <div className="space-y-2 pt-1">
              {!isLocked ? (
                <>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => setShowConfirmReady(true)}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800 disabled:opacity-50"
                  >
                    <FileCheck2 className="size-3.5 text-emerald-400" />
                    <span>Planı Onayla & Hazırla</span>
                  </button>

                  <button
                    type="button"
                    disabled={isPending || !isDirty}
                    onClick={handleSaveDraft}
                    className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold shadow-2xs transition ${
                      isDirty
                        ? "border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                        : "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed opacity-60"
                    }`}
                  >
                    <Save className="size-3.5" />
                    <span>
                      {isPending
                        ? "Kaydediliyor..."
                        : isDirty
                        ? "Taslağı Kaydet"
                        : "Tüm Değişiklikler Kaydedildi"}
                    </span>
                    {isDirty && (
                      <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
                    )}
                  </button>
                </>
              ) : (
                <div className="space-y-2.5">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-800">
                      <CheckCircle2 className="size-4 text-emerald-600" />
                      <span>
                        {plan.status?.toLowerCase() === "accepted"
                          ? "Hasta Onayladı"
                          : plan.status?.toLowerCase() === "viewed"
                          ? "Hasta Sunumu İnceledi"
                          : plan.status?.toLowerCase() === "sent"
                          ? "Hastaya Gönderildi"
                          : "Plan Onaylandı & Paylaşıma Hazır"}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-emerald-700">
                      {plan.status?.toLowerCase() === "accepted"
                        ? "Hasta bu tedavi planını dijital olarak onaylamıştır."
                        : plan.status?.toLowerCase() === "viewed"
                        ? "Hasta dijital web sunumunu incelemiştir."
                        : "Tedavi ve fiyat bilgileri resmi teklif olarak sabitlenmiştir."}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowShareModal(true)}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 py-2.5 text-xs font-bold text-white shadow-md shadow-cyan-500/20 hover:opacity-95 transition active:scale-98"
                  >
                    <FileText className="size-4" />
                    <span>Sunumlar</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Plan Onaylama ve Kesinleştirme Onay Modalı */}
      {showConfirmReady && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-md transition-all duration-300">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-8 ring-blue-50/50 mb-4">
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
                <span>Hastaya özel <strong>interaktif web sunumu</strong> ve <strong>kurumsal PDF teklif dosyası</strong> hazırlanır.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>WhatsApp, SMS ve QR kod ile hasta paylaşımı aktif hale gelir.</span>
              </div>
            </div>

            <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200/80 bg-amber-50/80 p-2.5 text-[11px] text-amber-900 leading-relaxed">
              <AlertCircle className="size-4 shrink-0 text-amber-600 mt-0.5" />
              <span>
                <strong>Bilgi:</strong> Hastaya sunulan teklifin tutarlılığı ve resmiyeti için, onay sonrasında seanslar ve tedavi satırları <strong>düzenlemeye kapatılır</strong>.
              </span>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowConfirmReady(false)}
                className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
              >
                Vazgeç
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleLockReady}
                className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 disabled:opacity-50 transition active:scale-98"
              >
                {isPending ? (
                  <>
                    <span className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Hazırlanıyor...</span>
                  </>
                ) : (
                  <>
                    <FileCheck2 className="size-3.5" />
                    <span>Evet, Onayla & Hazırla</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ultimate Web Sunumu & Paylaşım Modalı */}
      <PlanShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        planId={String(plan.id)}
        planTitle={title}
        patientName={patientName}
        patientContact={plan.patient?.contact}
        clinicName={clinicSettings?.name}
        isReady={isLocked}
      />
    </div>
  );
}
