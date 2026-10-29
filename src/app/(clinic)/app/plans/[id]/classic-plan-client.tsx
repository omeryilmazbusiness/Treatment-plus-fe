"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useMemo, useState, useTransition } from "react";
import {
  ArrowLeft,
  Building2,
  CalendarPlus,
  CheckCircle2,
  Clock,
  Download,
  Info,
  Lock,
  Phone,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";

import type { Diagnosis, PriceList, Treatment } from "@/modules/catalog/domain/catalog";
import type { ClinicSettings } from "@/modules/clinic/domain/clinic";
import type { Patient, Plan } from "@/modules/plan/domain/plan";
import { formatMoney, money, type Currency } from "@/shared/money";
import { PriceInput } from "@/ui/price-input";
import { generatePdfAction, readyPlanAction, savePlanDetailsAction } from "../actions";

interface Props {
  workspaceId: string;
  initialPlan: Plan;
  patients: Patient[];
  diagnosesCatalog: Diagnosis[];
  treatmentsCatalog: Treatment[];
  priceLists: PriceList[];
  clinicSettings: ClinicSettings;
}

const PALETTE_OPTIONS: { id: "navy" | "forest" | "rose" | "slate"; label: string; color: string }[] = [
  { id: "navy", label: "Gece Mavisi (Klasik)", color: "bg-slate-900" },
  { id: "forest", label: "Zümrüt Yeşili", color: "bg-emerald-800" },
  { id: "rose", label: "Gül Kurusu", color: "bg-rose-900" },
  { id: "slate", label: "Antrasit Gri", color: "bg-slate-700" },
];

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

export function ClassicPlanClient({
  workspaceId,
  initialPlan,
  diagnosesCatalog,
  treatmentsCatalog,
  priceLists,
  clinicSettings,
}: Props) {
  const router = useRouter();
  const [plan, setPlan] = useState<Plan>(initialPlan);
  const isLocked = plan.status === "ready";

  // Plan presentation & header states
  const [title, setTitle] = useState(plan.title || "Tedavi Planı");
  const [palette, setPalette] = useState<"navy" | "forest" | "rose" | "slate">(
    plan.palette || "navy"
  );
  const [locale, setLocale] = useState<"tr" | "en">(plan.locale || "tr");
  const [currency, setCurrency] = useState<Currency>(plan.currency || "TRY");
  const [diagnoses, setDiagnoses] = useState<string[]>(plan.diagnoses ?? []);

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
      teeth: it.teeth || (it.toothNumber ? [it.toothNumber] : []),
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

  const [isPending, startTransition] = useTransition();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "ok" | "err" } | null>(null);
  const [showConfirmReady, setShowConfirmReady] = useState(false);
  const [customDiagInput, setCustomDiagInput] = useState("");

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
              is_package: tr.name.toLowerCase().includes("paket"),
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

  // Diagnoses toggle
  const toggleDiagnosis = (diagName: string) => {
    if (isLocked) return;
    if (diagnoses.includes(diagName)) {
      setDiagnoses(diagnoses.filter((d) => d !== diagName));
    } else {
      setDiagnoses([...diagnoses, diagName]);
    }
  };

  const addCustomDiagnosis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDiagInput.trim() || isLocked) return;
    if (!diagnoses.includes(customDiagInput.trim())) {
      setDiagnoses([...diagnoses, customDiagInput.trim()]);
    }
    setCustomDiagInput("");
  };

  // Save Draft (Sends to server, server calculates and returns authoritative totals)
  const handleSaveDraft = () => {
    if (isLocked) return;
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
      setMessage({
        text: "Plan başarıyla kaydedildi. Genel toplam ve seanslar güncellendi.",
        type: "ok",
      });
    });
  };

  // Lock and ready
  const handleLockReady = () => {
    setMessage(null);
    setShowConfirmReady(false);

    startTransition(async () => {
      // First save current inputs
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

      // Now set ready
      const res = await readyPlanAction(String(plan.id), workspaceId);
      if (!res.success || !res.data) {
        setMessage({ text: res.error || "Plan kilitlenemedi", type: "err" });
        return;
      }

      // Trigger background PDF generation
      await generatePdfAction(String(plan.id));

      setPlan(res.data);
      if (res.data.currency) {
        setCurrency(res.data.currency);
      }
      router.refresh();
      setMessage({
        text: "Plan başarıyla kilitlendi (READY). 24 sayfalık kurumsal PDF ve sunum hazır.",
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
    <div className="mx-auto max-w-7xl space-y-6">
      {/* 1. Üst Başlık & Durum Çubuğu */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <Link
            href="/app/plans"
            className="flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">
                Tedavi Planları /
              </span>
              <span className="text-xs font-semibold text-slate-700">
                {title || "Plan Düzenle"}
              </span>
            </div>
            <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900">
              {title}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Durum Rozeti */}
          {isLocked ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-2xs">
              <CheckCircle2 className="size-4 text-emerald-600" />
              <span>Hazır & Kilitli (Snapshot Aktif)</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 shadow-2xs">
              <Clock className="size-4 text-amber-600" />
              <span>Taslak Düzenleme Modu</span>
            </span>
          )}

          {/* Aksiyon Butonları */}
          {!isLocked ? (
            <>
              <button
                type="button"
                disabled={isPending}
                onClick={handleSaveDraft}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
              >
                <Save className="size-3.5" />
                <span>{isPending ? "Kaydediliyor..." : "Taslağı Kaydet"}</span>
              </button>

              <button
                type="button"
                disabled={isPending}
                onClick={() => setShowConfirmReady(true)}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800 disabled:opacity-50"
              >
                <Lock className="size-3.5" />
                <span>Planı Onayla & Kilitle</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800 disabled:opacity-50"
              >
                <Download className="size-3.5" />
                <span>PDF Görüntüle / İndir</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mesaj Bildirimi */}
      {message && (
        <div
          className={`flex items-center justify-between rounded-2xl border p-4 text-xs font-medium ${
            message.type === "ok"
              ? "border-emerald-200 bg-emerald-50/80 text-emerald-900"
              : "border-rose-200 bg-rose-50/80 text-rose-900"
          }`}
        >
          <div className="flex items-center gap-2.5">
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

      {/* 2. Hasta & Plan Yapılandırma Kartı */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Hasta Profili */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3.5">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-sm font-bold text-slate-800">
                {getInitials(patientName)}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Hasta Profili
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {patientName}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Phone className="size-3 text-slate-400" />
                  <span>{plan.patient?.contact || "İletişim bilgisi girilmedi"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Plan Başlığı & Sunum Ayarları */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7">
            {/* Başlık */}
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Plan Başlığı
              </label>
              <input
                type="text"
                disabled={isLocked}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: İmplant & Zirkonyum Tedavi Planı"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-hidden disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            {/* Sunum Paleti & Dili */}
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                PDF & Sunum Teması
              </label>
              <div className="mt-1.5 flex items-center gap-2">
                {PALETTE_OPTIONS.map((pal) => (
                  <button
                    key={pal.id}
                    type="button"
                    disabled={isLocked}
                    onClick={() => setPalette(pal.id)}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                      palette === pal.id
                        ? "border-slate-900 bg-slate-900 text-white shadow-2xs"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    } disabled:cursor-not-allowed`}
                    title={pal.label}
                  >
                    <span className={`size-2 rounded-full ${pal.color} ring-1 ring-white/50`} />
                    <span className="capitalize">{pal.id}</span>
                  </button>
                ))}

                {/* Dil */}
                <div className="ml-auto flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs">
                  <button
                    type="button"
                    disabled={isLocked}
                    onClick={() => setLocale("tr")}
                    className={`cursor-pointer rounded-md px-2 py-1 font-semibold ${
                      locale === "tr"
                        ? "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    TR
                  </button>
                  <button
                    type="button"
                    disabled={isLocked}
                    onClick={() => setLocale("en")}
                    className={`cursor-pointer rounded-md px-2 py-1 font-semibold ${
                      locale === "en"
                        ? "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    EN
                  </button>
                </div>

                {/* Para Birimi */}
                <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs">
                  {(["TRY", "EUR", "USD"] as Currency[]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      disabled={isLocked}
                      onClick={() => setCurrency(c)}
                      className={`cursor-pointer rounded-md px-2 py-1 font-semibold ${
                        currency === c
                          ? "bg-white text-slate-900 shadow-2xs"
                          : "text-slate-500 hover:text-slate-900"
                      } disabled:cursor-not-allowed`}
                    >
                      {c === "TRY" ? "₺ TRY" : c === "EUR" ? "€ EUR" : "$ USD"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Teşhisler & Hızlı Odontogram Paneli */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col justify-between gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Teşhis(ler) & Klinik Bulgular
            </h3>
            <p className="text-xs text-slate-500">
              Katalogdan seçim yapın veya hastaya özel klinik teşhis ekleyin.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {diagnoses.length} Teşhis Seçildi
          </span>
        </div>

        {/* Teşhis Hapları */}
        <div className="mt-4 flex flex-wrap gap-2">
          {diagnosesCatalog.map((d) => {
            const isSelected = diagnoses.includes(d.name);
            return (
              <button
                key={d.id}
                type="button"
                disabled={isLocked}
                onClick={() => toggleDiagnosis(d.name)}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                  isSelected
                    ? "border-slate-900 bg-slate-900 text-white shadow-2xs"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100"
                } disabled:cursor-not-allowed`}
              >
                <span>{isSelected ? "✓" : "+"}</span>
                <span>{d.name}</span>
                {d.code && (
                  <span
                    className={`text-[10px] ${
                      isSelected ? "text-slate-300" : "text-slate-400"
                    }`}
                  >
                    ({d.code})
                  </span>
                )}
              </button>
            );
          })}

          {/* Özel Eklenen Teşhisler */}
          {diagnoses
            .filter((d) => !diagnosesCatalog.some((c) => c.name === d))
            .map((customD, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-900 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs"
              >
                <span>✓</span>
                <span>{customD}</span>
                {!isLocked && (
                  <button
                    type="button"
                    onClick={() => toggleDiagnosis(customD)}
                    className="ml-1 text-slate-300 hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </span>
            ))}
        </div>

        {/* Özel Teşhis Ekleme Formu */}
        {!isLocked && (
          <form onSubmit={addCustomDiagnosis} className="mt-4 flex max-w-md items-center gap-2">
            <input
              type="text"
              placeholder="Özel teşhis girin (Örn: Diş Sıkma / Bruksizm)..."
              value={customDiagInput}
              onChange={(e) => setCustomDiagInput(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-hidden"
            />
            <button
              type="submit"
              className="cursor-pointer rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800"
            >
              + Teşhis Ekle
            </button>
          </form>
        )}
      </div>

      {/* 4. Ana Bölüm: Seanslar & Tedavi Kalemleri VS Hesap Özeti (Sidebar) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Sol 8 Kolon: Seanslar, Tedaviler ve İndirimler */}
        <div className="space-y-6 lg:col-span-8">
          {visits.map((visit) => {
            const visitItems = items.filter((it) => it.visit_id === visit.id);
            const visitSubtotal = visitItems.reduce((acc, it) => {
              if (it.is_package) return acc;
              return acc + (Number(it.quantity) || 1) * (Number(it.unit_price) || 0);
            }, 0);

            return (
              <div
                key={visit.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs"
              >
                {/* Seans Başlığı & Aşama Ayarları */}
                <div className="border-b border-slate-100 bg-slate-50/70 p-5">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                      <span className="flex size-8 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white shadow-2xs">
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
                        className="rounded-lg border-0 bg-transparent text-base font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-900 disabled:opacity-90"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      {!isLocked && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleAddItem(visit.id)}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-slate-800"
                          >
                            <Plus className="size-3.5" />
                            <span>Tedavi Ekle</span>
                          </button>

                          {visits.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveVisit(visit.id)}
                              className="cursor-pointer rounded-xl border border-slate-200 bg-white p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                              title="Seansı Sil"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Seans Faz & İyileşme Notu (Wise PDF Altyapısı) */}
                  <div className="mt-3.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500">
                        Aşama / Faz Etiketi (Örn: Cerrahi Aşama)
                      </label>
                      <input
                        type="text"
                        disabled={isLocked}
                        value={visit.phase_label}
                        onChange={(e) =>
                          handleUpdateVisitField(visit.id, "phase_label", e.target.value)
                        }
                        placeholder="Örn: 1. Aşama - Cerrahi"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-slate-900 focus:outline-hidden disabled:bg-slate-50"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500">
                        İyileşme / Bekleme Notu
                      </label>
                      <input
                        type="text"
                        disabled={isLocked}
                        value={visit.healing_note}
                        onChange={(e) =>
                          handleUpdateVisitField(visit.id, "healing_note", e.target.value)
                        }
                        placeholder="Örn: 8-12 hafta kemik entegrasyonu bekleme süresi"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-slate-900 focus:outline-hidden disabled:bg-slate-50"
                      />
                    </div>
                  </div>
                </div>

                {/* Bu Seanstaki Tedavi Kalemleri */}
                <div className="p-5">
                  {visitItems.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      Bu seansa henüz tedavi kalemi eklenmedi. &ldquo;+ Tedavi Ekle&rdquo; butonuna tıklayın.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {visitItems.map((item) => {
                        const originalIndex = items.findIndex((it) => it === item);
                        const lineTotalMinor = item.is_package
                          ? 0
                          : (Number(item.quantity) || 1) * (Number(item.unit_price) || 0);

                        return (
                          <div
                            key={originalIndex}
                            className={`rounded-2xl border p-4 transition ${
                              item.is_package
                                ? "border-amber-200 bg-amber-50/30"
                                : "border-slate-200 bg-slate-50/30"
                            }`}
                          >
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 sm:items-center">
                              {/* Tedavi Seçimi */}
                              <div className="sm:col-span-5">
                                <label className="block text-[11px] font-semibold text-slate-500">
                                  Tedavi
                                </label>
                                <select
                                  disabled={isLocked}
                                  value={item.treatment_id ?? ""}
                                  onChange={(e) =>
                                    handleTreatmentChange(originalIndex, e.target.value)
                                  }
                                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-hidden disabled:bg-slate-100"
                                >
                                  {treatmentsCatalog.map((t) => (
                                    <option key={t.id} value={t.id}>
                                      {t.name}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Diş No (FDI) & Diş Seçici */}
                              <div className="sm:col-span-2">
                                <label className="block text-[11px] font-semibold text-slate-500">
                                  Diş No (FDI)
                                </label>
                                <div className="relative mt-1">
                                  <input
                                    type="text"
                                    disabled={isLocked}
                                    placeholder="16, 21..."
                                    value={item.tooth_number}
                                    onChange={(e) =>
                                      handleItemFieldChange(
                                        originalIndex,
                                        "tooth_number",
                                        e.target.value
                                      )
                                    }
                                    className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-hidden disabled:bg-slate-100"
                                  />
                                </div>
                              </div>

                              {/* Adet */}
                              <div className="sm:col-span-1">
                                <label className="block text-[11px] font-semibold text-slate-500">
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
                                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-2 py-2 text-center text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-hidden disabled:bg-slate-100"
                                />
                              </div>

                              {/* Birim Fiyat */}
                              <div className="sm:col-span-2">
                                <label className="block text-[11px] font-semibold text-slate-500">
                                  Birim Fiyat
                                </label>
                                <PriceInput
                                  disabled={isLocked}
                                  value={item.unit_price}
                                  onChange={(val) =>
                                    handleItemFieldChange(originalIndex, "unit_price", val)
                                  }
                                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-hidden disabled:bg-slate-100"
                                />
                              </div>

                              {/* Satır Toplamı & Sil */}
                              <div className="flex items-center justify-between sm:col-span-2 sm:justify-end sm:gap-3">
                                <div className="text-right">
                                  <div className="text-xs font-bold text-slate-900">
                                    {formatMoney(money(lineTotalMinor, currency))}
                                  </div>
                                  {item.is_package && (
                                    <span className="text-[10px] font-semibold text-amber-700">
                                      Paket İçi (0 {currency === "TRY" ? "TL" : currency})
                                    </span>
                                  )}
                                </div>

                                {!isLocked && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveItem(originalIndex)}
                                    className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                                    title="Satırı Sil"
                                  >
                                    <Trash2 className="size-4" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Alt Detay: Hekim Açıklaması & Hızlı Diş Seçici & Paket Toggle */}
                            <div className="mt-3 flex flex-col justify-between gap-3 border-t border-slate-200/60 pt-2.5 sm:flex-row sm:items-center">
                              {/* Hekim Notu */}
                              <div className="flex-1">
                                <input
                                  type="text"
                                  disabled={isLocked}
                                  placeholder="Hekim Notu / İmplant markası / Ek detay..."
                                  value={item.description}
                                  onChange={(e) =>
                                    handleItemFieldChange(
                                      originalIndex,
                                      "description",
                                      e.target.value
                                    )
                                  }
                                  className="w-full rounded-lg border border-slate-200/70 bg-white px-2.5 py-1 text-[11px] text-slate-700 placeholder:text-slate-400 focus:border-slate-900 focus:outline-hidden disabled:bg-slate-50"
                                />
                              </div>

                              <div className="flex items-center gap-3">
                                {/* Hızlı Diş Seçici Toggle */}
                                {!isLocked && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setActiveItemToothIndex(
                                        activeItemToothIndex === originalIndex ? null : originalIndex
                                      )
                                    }
                                    className="cursor-pointer text-[11px] font-semibold text-slate-600 hover:text-slate-900 underline"
                                  >
                                    {activeItemToothIndex === originalIndex
                                      ? "Diş Şemasını Kapat"
                                      : "Diş Şemasından Seç"}
                                  </button>
                                )}

                                {/* Paket İçi Checkbox */}
                                <label className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-slate-600">
                                  <input
                                    type="checkbox"
                                    disabled={isLocked}
                                    checked={item.is_package}
                                    onChange={(e) =>
                                      handleItemFieldChange(
                                        originalIndex,
                                        "is_package",
                                        e.target.checked
                                      )
                                    }
                                    className="size-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                                  />
                                  <span>Paket İçi (Fiyat Dahil)</span>
                                </label>
                              </div>
                            </div>

                            {/* Açılır FDI Diş Şeması Seçicisi */}
                            {activeItemToothIndex === originalIndex && !isLocked && (
                              <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
                                <div className="text-[11px] font-bold text-slate-700 mb-2">
                                  FDI Numaralandırma Şeması (Seçilenler otomatik eklenir):
                                </div>
                                <div className="space-y-2">
                                  <div className="flex flex-wrap items-center gap-1">
                                    <span className="text-[10px] font-bold text-slate-400 w-16">
                                      Üst Çene:
                                    </span>
                                    {QUICK_TEETH.upper.map((tooth) => {
                                      const isPicked = (item.teeth || []).includes(tooth);
                                      return (
                                        <button
                                          key={tooth}
                                          type="button"
                                          onClick={() =>
                                            handleToggleToothForItem(originalIndex, tooth)
                                          }
                                          className={`size-6 rounded-md text-[10px] font-bold transition ${
                                            isPicked
                                              ? "bg-slate-900 text-white"
                                              : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-200"
                                          }`}
                                        >
                                          {tooth}
                                        </button>
                                      );
                                    })}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-1">
                                    <span className="text-[10px] font-bold text-slate-400 w-16">
                                      Alt Çene:
                                    </span>
                                    {QUICK_TEETH.lower.map((tooth) => {
                                      const isPicked = (item.teeth || []).includes(tooth);
                                      return (
                                        <button
                                          key={tooth}
                                          type="button"
                                          onClick={() =>
                                            handleToggleToothForItem(originalIndex, tooth)
                                          }
                                          className={`size-6 rounded-md text-[10px] font-bold transition ${
                                            isPicked
                                              ? "bg-slate-900 text-white"
                                              : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-200"
                                          }`}
                                        >
                                          {tooth}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Seans Alt Toplamı */}
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                    <span className="font-semibold text-slate-500">
                      {visit.title} Ara Toplamı:
                    </span>
                    <span className="font-bold text-slate-900">
                      {formatMoney(money(visitSubtotal, currency))}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Yeni Seans Ekle Butonu */}
          {!isLocked && (
            <button
              type="button"
              onClick={handleAddVisit}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-white py-5 text-xs font-bold text-slate-600 shadow-2xs transition hover:border-slate-900 hover:bg-slate-50 hover:text-slate-900"
            >
              <CalendarPlus className="size-4" />
              <span>+ Yeni Tedavi Seansı Ekle</span>
            </button>
          )}

          {/* İndirimler & Kampanyalar Kartı */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  İndirimler & İskontolar
                </h3>
                <p className="text-xs text-slate-500">
                  Plan geneline uygulanacak özel indirimler (Örn: Peşin ödeme indirimi).
                </p>
              </div>
              {!isLocked && (
                <button
                  type="button"
                  onClick={handleAddDiscount}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
                >
                  <Plus className="size-3.5" />
                  <span>İndirim Ekle</span>
                </button>
              )}
            </div>

            <div className="mt-4 space-y-3">
              {discounts.length === 0 ? (
                <p className="py-2 text-xs text-slate-400">
                  Henüz indirim tanımlanmadı.
                </p>
              ) : (
                discounts.map((d, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3"
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
                      className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-hidden disabled:bg-slate-100"
                    />
                    <div className="w-36">
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
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-hidden disabled:bg-slate-100"
                      />
                    </div>
                    {!isLocked && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDiscount(idx)}
                        className="cursor-pointer rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sağ 4 Kolon: Fiyatlandırma & Hesap Özeti (Sticky Sidebar) */}
        <div className="space-y-6 lg:col-span-4">
          <div className="sticky top-6 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Fiyatlandırma & Hesap Özeti
              </h3>
              <p className="text-xs text-slate-500">
                Kuruş hassasiyetli sunucu hesaplamalı resmi tutarlar.
              </p>
            </div>

            {/* Tutar Dökümü */}
            <div className="space-y-3.5 border-y border-slate-100 py-4.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Ara Toplam:</span>
                <span className="font-bold text-slate-900 text-sm">
                  {formatMoney(money(plan.totalsSubtotal, currency))}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Toplam İndirim:</span>
                <span className="font-bold text-rose-600 text-sm">
                  - {formatMoney(money(plan.totalsDiscount, currency))}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-sm font-bold text-slate-900">
                <span>Genel Toplam:</span>
                <span className="text-lg text-slate-900">
                  {formatMoney(money(plan.totalsGrand, currency))}
                </span>
              </div>
            </div>

            {/* Bilgilendirme Notu */}
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-xs text-slate-600 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <Info className="size-3.5 text-slate-500" />
                <span>Hesaplama Prensipleri:</span>
              </div>
              <p className="text-[11px] text-slate-500">
                • Paket içi işlemler genel toplamı şişirmez, PDF belgesinde &ldquo;Paket İçi&rdquo; olarak sunulur.
              </p>
              <p className="text-[11px] text-slate-500">
                • Kilitlendiğinde mevcut veriler dondurulur ve 24 sayfalık kurumsal PDF çıktısı oluşturulur.
              </p>
            </div>

            {/* Eylem Butonları */}
            <div className="space-y-2.5 pt-1">
              {!isLocked ? (
                <>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={handleSaveDraft}
                    className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-800 shadow-2xs transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    {isPending ? "Kaydediliyor..." : "Taslağı Kaydet"}
                  </button>

                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => setShowConfirmReady(true)}
                    className="w-full cursor-pointer rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800 disabled:opacity-50"
                  >
                    Planı Onayla & Kilitle (Ready)
                  </button>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-800">
                      <CheckCircle2 className="size-4 text-emerald-600" />
                      <span>Plan Onaylandı & Kilitlendi</span>
                    </div>
                    <p className="mt-1 text-[11px] text-emerald-700">
                      Bu planın verileri dondurulmuştur. Değişiklik yapılamaz.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={isGeneratingPdf}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-xs font-bold text-white shadow-xs hover:bg-slate-800"
                  >
                    <Download className="size-4" />
                    <span>24 Sayfalık PDF İndir</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Klinik Antet Kartı */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs text-xs text-slate-500">
            <div className="flex items-center gap-2 font-bold text-slate-900 mb-2">
              <Building2 className="size-4 text-slate-400" />
              <span>Klinik Antet Bilgisi</span>
            </div>
            <div className="space-y-1">
              <div>Klinik: <strong className="text-slate-800">{clinicSettings.name || "Klinik"}</strong></div>
              <div>Hekim: <strong className="text-slate-800">{clinicSettings.doctor?.name || "Yetkili Hekim"}</strong></div>
              <div>Telefon: <span className="text-slate-800">{clinicSettings.phone || "—"}</span></div>
              <div>Şablon Paleti: <span className="font-semibold capitalize text-slate-800">{palette}</span></div>
              <div>Para Birimi: <strong className="text-slate-800">{currency}</strong></div>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Kilitleme Onay Modalı */}
      {showConfirmReady && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-md transition-all duration-300">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-2xl">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-900 mb-4">
              <Lock className="size-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              Planı Kilitlemek İstiyor musunuz?
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Bu işlem planı <strong>READY (Kilitli)</strong> durumuna geçirir. Mevcut klinik profili, hasta bilgileri, seanslar ve fiyatlar <strong>değiştirilemez bir snapshot</strong> olarak dondurulur ve 24 sayfalık kurumsal PDF çıktısı üretilir.
            </p>
            <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-[11px] font-semibold text-amber-800">
              ⚠️ Kilitlendikten sonra seans ve tedavi satırları düzenlenemez.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmReady(false)}
                className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Vazgeç
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleLockReady}
                className="cursor-pointer rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 disabled:opacity-50"
              >
                {isPending ? "Kilitleniyor..." : "Evet, Kilitle & Hazırla"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
