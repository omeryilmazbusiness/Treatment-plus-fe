"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Bot,
  CalendarPlus,
  Check,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileCheck2,
  FileDown,
  Layers,
  Loader2,
  Unlock,
  Menu,
  Minus,
  Plus,
  Receipt,
  Redo2,
  Save,
  Share2,
  Sparkles,
  Stethoscope,
  Table,
  Undo2,
  User,
  X,
} from "lucide-react";

import type {
  AnimationTimelineStage,
  ClinicBrandInfo,
  PatientInfo,
  PlanDiscount,
  StudioPlanItem,
  StudioVisit,
  ToothCondition,
} from "./types";
import type { Treatment } from "@/modules/catalog/domain/catalog";
import { DiagnosisModule } from "./diagnosis-module";
import { TreatmentsModule } from "./treatments-module";
import { SimulationModule, DEFAULT_ANIMATION_STAGES } from "./simulation-module";
import { OverviewModule } from "./overview-module";

export type StudioTab = "diagnosis" | "treatments" | "animation" | "ai_summary" | "overview";
const VALID_TABS: StudioTab[] = ["diagnosis", "treatments", "animation", "ai_summary", "overview"];

export interface TreatmentStudioProps {
  initialPatient?: PatientInfo;
  initialClinic?: ClinicBrandInfo;
  initialConditions?: Record<string, ToothCondition>;
  initialItems?: StudioPlanItem[];
  initialVisits?: StudioVisit[];
  initialCurrency?: "EUR" | "USD" | "TRY";
  initialLocale?: "en" | "tr";
  planId?: string;
  planTitle?: string;
  onPlanTitleChange?: (title: string) => void;
  planStatus?: string;
  isLocked?: boolean;
  onUnlockPlan?: () => Promise<boolean> | boolean;
  onLockReady?: () => Promise<void> | void;
  onSave?: (data: {
    conditions: Record<string, ToothCondition>;
    items: StudioPlanItem[];
    visits: StudioVisit[];
    discounts?: PlanDiscount[];
  }) => Promise<void> | void;
  isSaving?: boolean;
  onItemsChange?: (items: StudioPlanItem[]) => void;
  onVisitsChange?: (visits: StudioVisit[]) => void;
  onConditionsChange?: (conditions: Record<string, ToothCondition>) => void;
  initialDiscounts?: PlanDiscount[];
  onDiscountsChange?: (discounts: PlanDiscount[]) => void;
  initialTab?: StudioTab;
  backHref?: string;
  embedded?: boolean;
  viewMode?: "studio" | "table";
  onViewModeChange?: (mode: "studio" | "table") => void;
  treatmentsCatalog?: Treatment[];
  priceMap?: Map<string, number>;
}

export function TreatmentStudio({
  initialPatient,
  initialClinic,
  initialConditions,
  initialItems,
  initialVisits,
  initialDiscounts,
  onDiscountsChange: onDiscountsChangeProp,
  initialCurrency = "EUR",
  initialLocale = "tr",
  planId,
  planTitle,
  onPlanTitleChange,
  planStatus,
  isLocked: isLockedProp,
  onUnlockPlan,
  onLockReady,
  onSave,
  onItemsChange: onItemsChangeProp,
  onVisitsChange: onVisitsChangeProp,
  onConditionsChange: onConditionsChangeProp,
  isSaving = false,
  backHref = "/app/plans",
  embedded = false,
  viewMode = "studio",
  onViewModeChange,
  treatmentsCatalog,
  priceMap,
  initialTab,
}: TreatmentStudioProps) {
  // Navigation & Tabs with URL and Storage Persistence
  const [activeTab, setActiveTabState] = useState<StudioTab>(initialTab || "diagnosis");

  const setActiveTab = React.useCallback(
    (tab: StudioTab) => {
      setActiveTabState(tab);
      if (typeof window !== "undefined") {
        try {
          if (planId) {
            localStorage.setItem(`tp_plan_${planId}_tab`, tab);
          } else {
            sessionStorage.setItem("tp_studio_active_tab", tab);
          }
          const url = new URL(window.location.href);
          url.searchParams.set("tab", tab);
          window.history.replaceState(window.history.state, "", url.toString());
        } catch (e) {
          // ignore storage error
        }
      }
    },
    [planId]
  );

  // Restore activeTab on mount / page refresh
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const urlTab = new URLSearchParams(window.location.search).get("tab") as StudioTab;
      if (urlTab && VALID_TABS.includes(urlTab)) {
        setActiveTabState(urlTab);
        return;
      }
      const storageKey = planId ? `tp_plan_${planId}_tab` : "tp_studio_active_tab";
      const storedTab = (
        planId ? localStorage.getItem(storageKey) : sessionStorage.getItem(storageKey)
      ) as StudioTab;
      if (storedTab && VALID_TABS.includes(storedTab)) {
        setActiveTabState(storedTab);
        const url = new URL(window.location.href);
        url.searchParams.set("tab", storedTab);
        window.history.replaceState(window.history.state, "", url.toString());
      }
    } catch (e) {
      // ignore
    }
  }, [planId]);

  // Support browser back/forward buttons
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handlePopState = () => {
      const urlTab = new URLSearchParams(window.location.search).get("tab") as StudioTab;
      if (urlTab && VALID_TABS.includes(urlTab)) {
        setActiveTabState(urlTab);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Plan Title state
  const [currentTitle, setCurrentTitle] = useState(planTitle || "Tedavi Planı");
  useEffect(() => {
    if (planTitle !== undefined) {
      setCurrentTitle(planTitle);
    }
  }, [planTitle]);

  // Plan lock & status state
  const [localStatus, setLocalStatus] = useState<string | undefined>(planStatus);
  useEffect(() => {
    if (planStatus !== undefined) setLocalStatus(planStatus);
  }, [planStatus, isLockedProp]);

  const isPlanLocked = Boolean(
    isLockedProp ??
    ((localStatus || planStatus) && (localStatus || planStatus)?.toLowerCase() !== "draft")
  );

  // Locale & Currency
  const [locale, setLocale] = useState<"en" | "tr">(initialLocale);
  const [currency, setCurrency] = useState<"EUR" | "USD" | "TRY">(initialCurrency);

  // Patient Info
  const [patient, setPatient] = useState<PatientInfo>(
    initialPatient || {
      id: "patient-101",
      name: "Ömer Yılmaz",
      dob: "1988-06-15",
      phone: "+90 (532) 123 4567",
      email: "omer@example.com",
    }
  );

  // Clinic Brand Info
  const [clinic] = useState<ClinicBrandInfo>(
    initialClinic || {
      name: "Treatment+ Dental Clinic",
      doctorName: "Dr. Selin Yılmaz",
      phone: "+90 (212) 555 0199",
      whatsapp: "+90 532 555 0199",
      address: "Levent, İstanbul",
      stats: {
        satisfactionRate: "99.4%",
        yearsExperience: "15+ Yıl",
        happySmiles: "12,000+",
      },
    }
  );

  // Conditions (Module 1)
  const [conditions, setConditions] = useState<Record<string, ToothCondition>>(
    initialConditions || (embedded ? {} : {
      "16": "filled",
      "14": "caries",
      "24": "caries",
      "26": "missing",
      "36": "missing",
      "46": "root_canal",
    })
  );

  // Visits & Plan Items (Module 2)
  const [visits, setVisits] = useState<StudioVisit[]>(
    initialVisits && initialVisits.length > 0
      ? initialVisits
      : [
          {
            id: "v-1",
            orderNum: 1,
            title: "1. Seans: Muayene & Tedavi",
            phaseLabel: "1. Aşama",
            chartTeeth: [],
          },
        ]
  );

  const [items, setItems] = useState<StudioPlanItem[]>(
    initialItems !== undefined
      ? initialItems
      : embedded
      ? []
      : [
          {
            id: "it-allon4-up",
            treatmentType: "implant",
            treatmentName: "All-on-4 (Nobel Biocare) Üst Çene Paketi",
            teeth: ["12", "14", "22", "24"],
            quantity: 1,
            unitPrice: 5999,
            isPackage: true,
            visitId: "v-1",
          },
          {
            id: "it-allon4-low",
            treatmentType: "implant",
            treatmentName: "All-on-4 (Nobel Biocare) Alt Çene Paketi",
            teeth: ["32", "34", "42", "44"],
            quantity: 1,
            unitPrice: 5999,
            isPackage: true,
            visitId: "v-1",
          },
        ]
  );

  // Synchronize internal state when props update
  useEffect(() => {
    if (initialConditions !== undefined) {
      setConditions(initialConditions);
    }
  }, [initialConditions]);

  useEffect(() => {
    if (initialVisits !== undefined && initialVisits.length > 0) {
      setVisits(initialVisits);
    }
  }, [initialVisits]);

  useEffect(() => {
    if (initialItems !== undefined) {
      setItems(initialItems);
    }
  }, [initialItems]);

  // Discounts state
  const [discounts, setDiscounts] = useState<PlanDiscount[]>(
    initialDiscounts && initialDiscounts.length > 0 ? initialDiscounts : []
  );

  useEffect(() => {
    if (initialDiscounts !== undefined) {
      setDiscounts(initialDiscounts);
    }
  }, [initialDiscounts]);

  const handleDiscountsChange = (newDiscounts: PlanDiscount[]) => {
    setDiscounts(newDiscounts);
    onDiscountsChangeProp?.(newDiscounts);
  };

  // Modals & Panels
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // Serializer for detecting unsaved changes
  const serializeState = (
    c: Record<string, ToothCondition>,
    it: StudioPlanItem[],
    v: StudioVisit[],
    t?: string,
    d?: PlanDiscount[]
  ) =>
    JSON.stringify({
      t: t ?? currentTitle,
      c,
      it: it.map((x) => ({
        name: x.treatmentName,
        teeth: [...(x.teeth || [])].sort(),
        qty: x.quantity || 1,
        price: x.unitPrice || 0,
        vId: x.visitId,
        pkg: Boolean(x.isPackage),
      })),
      v: v.map((x) => ({
        id: x.id,
        title: x.title,
        teeth: [...(x.chartTeeth || [])].sort(),
        hNote: x.healingNote || "",
      })),
      d: (d || discounts || []).map((x) => ({
        l: x.label,
        a: x.amount,
      })),
    });

  // Baseline snapshot of saved state
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState<string>(() =>
    serializeState(conditions, items, visits, currentTitle, discounts)
  );

  // Synchronize baseline snapshot if initial props change externally
  useEffect(() => {
    if (initialConditions || initialItems || initialVisits || planTitle || initialDiscounts) {
      const snap = serializeState(
        initialConditions || conditions,
        initialItems && initialItems.length > 0 ? initialItems : items,
        initialVisits || visits,
        planTitle || currentTitle,
        initialDiscounts || discounts
      );
      setLastSavedSnapshot(snap);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialConditions, initialItems, initialVisits, planTitle, initialDiscounts]);

  // Current state snapshot
  const currentSnapshot = useMemo(
    () => serializeState(conditions, items, visits, currentTitle, discounts),
    [conditions, items, visits, currentTitle, discounts]
  );

  // Dirty check: Are there any unsaved modifications?
  const hasUnsavedChanges = currentSnapshot !== lastSavedSnapshot;

  const [isLocalSaving, setIsLocalSaving] = useState(false);
  const isSavingActive = isSaving || isLocalSaving;

  const handleSave = React.useCallback(async () => {
    if (isPlanLocked || !onSave) return;
    setIsLocalSaving(true);
    try {
      const snap = currentSnapshot;
      await onSave({ conditions, items, visits, discounts });
      setLastSavedSnapshot(snap);
      setSaveSuccessMsg(true);
      setTimeout(() => setSaveSuccessMsg(false), 2000);
    } catch (e) {
      console.error("Studio save error:", e);
    } finally {
      setIsLocalSaving(false);
    }
  }, [isPlanLocked, onSave, currentSnapshot, conditions, items, visits, discounts]);

  // Debounced Auto-save (1200ms)
  useEffect(() => {
    if (isPlanLocked || !hasUnsavedChanges || isSavingActive) return;

    const timer = setTimeout(() => {
      handleSave();
    }, 1200);

    return () => clearTimeout(timer);
  }, [hasUnsavedChanges, isPlanLocked, isSavingActive, handleSave]);

  const handleStudioLockAndReady = async () => {
    if (onSave) {
      await onSave({ conditions, items, visits, discounts });
      setLastSavedSnapshot(currentSnapshot);
    }
    if (onLockReady) {
      await onLockReady();
    }
    setLocalStatus("ready");
  };

  const handleItemsChange = (newItems: StudioPlanItem[]) => {
    setItems(newItems);
    onItemsChangeProp?.(newItems);
  };
  const handleVisitsChange = (newVisits: StudioVisit[]) => {
    setVisits(newVisits);
    onVisitsChangeProp?.(newVisits);
  };
  const handleConditionsChange = (newConditions: Record<string, ToothCondition>) => {
    setConditions(newConditions);
    onConditionsChangeProp?.(newConditions);
  };

  const handleSwitchToTable = async () => {
    // 1. Immediately push all current studio state to parent callbacks
    onItemsChangeProp?.(items);
    onVisitsChangeProp?.(visits);
    onConditionsChangeProp?.(conditions);
    onDiscountsChangeProp?.(discounts);
    if (onPlanTitleChange) onPlanTitleChange(currentTitle);

    // 2. If there are unsaved modifications, save immediately
    if (hasUnsavedChanges && !isPlanLocked && onSave) {
      setIsLocalSaving(true);
      try {
        await onSave({ conditions, items, visits, discounts });
        setLastSavedSnapshot(currentSnapshot);
      } catch (err) {
        console.error("Error auto-saving before switching to table:", err);
      } finally {
        setIsLocalSaving(false);
      }
    }

    // 3. Switch view mode to table
    if (onViewModeChange) {
      onViewModeChange("table");
    }
  };

  const currSymbol = currency === "EUR" ? "€" : currency === "USD" ? "$" : "₺";

  return (
    <div className="w-full font-sans text-slate-900 flex flex-col space-y-4">
      {/* ============================================================== */}
      {/* 1. UNIFIED STUDIO TOOLBAR (Treatment+ Design Language) */}
      {/* ============================================================== */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Back button + View Mode Switcher + Patient & Plan Badge */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {backHref && (
              <Link
                href={backHref}
                className="flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:border-slate-300 transition shadow-2xs mr-0.5"
                title="Planlara Dön"
              >
                <ArrowLeft className="size-4" />
              </Link>
            )}

            {/* Klasik Tablo Yapısına Geç Butonu (Sekme Rengiyle Birebir: bg-slate-900) */}
            {onViewModeChange && (
              <button
                type="button"
                onClick={handleSwitchToTable}
                className="group flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold px-3.5 py-2 text-xs border border-slate-800 shadow-xs hover:shadow-md transition-all duration-150 cursor-pointer active:scale-95"
                title="Klasik Tablo Yapısına Geç"
              >
                <Table className="size-3.5 text-blue-400" />
                <span>Klasik Tablo Yapısına Geç</span>
                <ArrowRight className="size-3.5 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}

            {/* Patient & Plan Info Chip (Hasta Adı + Plan Başlığı) */}
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-xs text-slate-700 shadow-2xs">
              <User className="size-3.5 text-slate-400" />
              <span className="font-semibold text-slate-900">{patient.name}</span>
              <span className="h-3.5 w-px bg-slate-200" />
              {onPlanTitleChange && !isPlanLocked ? (
                <input
                  type="text"
                  disabled={isPlanLocked}
                  value={currentTitle}
                  onChange={(e) => {
                    setCurrentTitle(e.target.value);
                    onPlanTitleChange(e.target.value);
                  }}
                  placeholder="Plan Başlığı"
                  className="bg-transparent font-medium text-slate-700 hover:text-slate-900 focus:text-slate-900 focus:outline-none w-32 sm:w-44 transition placeholder:text-slate-400 disabled:opacity-80"
                  title="Plan Başlığı"
                />
              ) : (
                <span className="font-medium text-slate-700">{currentTitle || "Tedavi Planı"}</span>
              )}
            </div>


          </div>

          {/* Right: Şablonlar & Otomatik Kayıt Durumu */}
          <div className="flex items-center gap-2">
            {/* Şablonlar (Saved Drafts) - Yalnızca Taslak Aşamasında Aktif */}

            {/* Otomatik Kayıt Durum Rozeti / Kilidi Aç Butonu */}
            {isPlanLocked ? (
              onUnlockPlan && (
                <button
                  type="button"
                  onClick={async () => {
                    const ok = await onUnlockPlan();
                    if (ok) setLocalStatus("draft");
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-white hover:bg-amber-50 active:bg-amber-100 px-3.5 py-2 text-xs font-bold text-amber-900 shadow-xs transition cursor-pointer"
                  title="Plan kilidini aç ve düzenle"
                >
                  <Unlock className="size-3.5 text-amber-600" />
                  <span>Kilidi Aç & Düzenle</span>
                </button>
              )
            ) : (
              <div
                className="flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 select-none shadow-2xs"
                title={
                  isSavingActive
                    ? "Değişiklikler sunucuya kaydediliyor..."
                    : hasUnsavedChanges
                    ? "Değişiklikler algılandı, otomatik kaydediliyor..."
                    : "Tüm değişiklikler otomatik olarak kaydedildi"
                }
              >
                {isSavingActive ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin text-cyan-600" />
                    <span>Kaydediliyor...</span>
                  </>
                ) : hasUnsavedChanges ? (
                  <>
                    <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
                    <span>Kaydediliyor...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-3.5 text-emerald-500" />
                    <span>Otomatik Kaydedildi</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>


      {/* ============================================================== */}
      {/* 2. SADE VE ESTETİK STÜDYO SEKME ÇUBUĞU */}
      {/* ============================================================== */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {[
            {
              id: "diagnosis" as const,
              title: "Teşhis",
              icon: Stethoscope,
            },
            {
              id: "treatments" as const,
              title: "Tedavi Planı",
              icon: Layers,
            },
            {
              id: "animation" as const,
              title: "3D Simülasyon",
              icon: Sparkles,
            },
            {
              id: "ai_summary" as const,
              title: "Akıllı Özet",
              icon: Bot,
            },
            {
              id: "overview" as const,
              title: "Hasta Sunumu",
              icon: Eye,
            },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`group flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer select-none flex-1 min-w-[130px] sm:min-w-0 ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-950 hover:bg-slate-100/70"
                }`}
              >
                <Icon
                  className={`size-4 shrink-0 transition-colors ${
                    isActive ? "text-blue-400" : "text-slate-400 group-hover:text-slate-700"
                  }`}
                />
                <span className="truncate">{tab.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. MAIN WORKSPACE CONTENT CONTAINER */}
      {/* ============================================================== */}
      <div className="w-full">
        {/* Module 1: Teşhis (Diagnosis) */}
        {activeTab === "diagnosis" && (
          <DiagnosisModule
            conditions={conditions}
            onConditionsChange={handleConditionsChange}
            patientName={patient.name}
            isLocked={isPlanLocked}
          />
        )}

        {/* Module 2: Tedavi Planlama (Treatments) */}
        {activeTab === "treatments" && (
          <TreatmentsModule
            conditions={conditions}
            items={items}
            visits={visits}
            currency={currency}
            onItemsChange={handleItemsChange}
            onVisitsChange={handleVisitsChange}
            isLocked={isPlanLocked}
            onUnlockPlan={async () => {
              if (onUnlockPlan) {
                const ok = await onUnlockPlan();
                if (ok) setLocalStatus("draft");
                return ok;
              }
              return false;
            }}
            treatmentsCatalog={treatmentsCatalog}
            priceMap={priceMap}
            discounts={discounts}
            onDiscountsChange={handleDiscountsChange}
            onLockReady={handleStudioLockAndReady}
          />
        )}

        {/* Module 3: 3D Animasyon (Simulation) */}
        {activeTab === "animation" && (
          <SimulationModule
            planItems={items}
            visits={visits}
          />
        )}

        {/* AI Summary Tab */}
        {activeTab === "ai_summary" && (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="size-12 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white flex items-center justify-center shadow-xs">
                <Bot className="size-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  AI Tedavi ve Prognoz Analizi
                </h3>
                <p className="text-xs text-slate-500">
                  Yapay zeka destekli klinik vaka raporu ve hasta bilgilendirme dokümanı
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-1">
                  Klinik Durum Değerlendirmesi:
                </h4>
                <p>
                  Hastanın alt ve üst posterior bölgelerindeki edantulizm, çiğneme fonksiyonunda %65 kayba neden olmaktadır. Planlanan <strong>All-on-4 titanyum implant protokolü</strong>, kemik greftleme ihtiyacını minimize ederek aynı gün sabit geçici diş teslimine (Immediate Loading) olanak sağlamaktadır.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="font-bold text-slate-800">Cerrahi Başarı Beklentisi</div>
                  <div className="text-2xl font-black text-emerald-600">%98.7</div>
                  <p className="text-slate-500 text-[11px]">
                    Nobel Biocare kemik seviyesi titanyum fikstürlerin 5 yıllık klinik takip başarısı.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="font-bold text-slate-800">Tahmini İyileşme Periyodu</div>
                  <div className="text-2xl font-black text-slate-900">6 Ay</div>
                  <p className="text-slate-500 text-[11px]">
                    Daimi monolitik zirkonyum köprüler öncesi osteointegrasyon süresi.
                  </p>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className="flex items-center gap-2 rounded-xl bg-slate-900 text-white px-5 py-2.5 text-xs font-bold hover:bg-slate-800 transition shadow-sm cursor-pointer"
                >
                  <span>Hasta Sunumuna Geç (Overview)</span>
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Module 4: Hasta Sunumu (Overview / Patient Microsite) */}
        {activeTab === "overview" && (
          <OverviewModule
            patient={patient}
            clinic={clinic}
            items={items}
            visits={visits}
            currency={currency}
            planId={planId}
            planTitle={currentTitle}
            planStatus={localStatus || planStatus}
            isLocked={isPlanLocked}
            onLockReady={handleStudioLockAndReady}
            onPatientDobChange={(dob) => setPatient({ ...patient, dob })}
          />
        )}
      </div>
    </div>
  );
}
