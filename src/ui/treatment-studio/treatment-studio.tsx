"use client";

import React, { useState } from "react";
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
  Lock,
  Menu,
  Minus,
  Plus,
  Receipt,
  Redo2,
  Save,
  Share2,
  Sparkles,
  Stethoscope,
  Undo2,
  User,
  X,
} from "lucide-react";

import type {
  AnimationTimelineStage,
  ClinicBrandInfo,
  PatientInfo,
  SavedDraftTemplate,
  StudioPlanItem,
  StudioVisit,
  ToothCondition,
} from "./types";
import { DiagnosisModule } from "./diagnosis-module";
import { TreatmentsModule } from "./treatments-module";
import { SimulationModule, DEFAULT_ANIMATION_STAGES } from "./simulation-module";
import { OverviewModule } from "./overview-module";
import { DraftsModal, DEFAULT_TEMPLATES } from "./drafts-modal";

export type StudioTab = "diagnosis" | "treatments" | "animation" | "ai_summary" | "overview";

export interface TreatmentStudioProps {
  initialPatient?: PatientInfo;
  initialClinic?: ClinicBrandInfo;
  initialConditions?: Record<string, ToothCondition>;
  initialItems?: StudioPlanItem[];
  initialVisits?: StudioVisit[];
  initialCurrency?: "EUR" | "USD" | "TRY";
  initialLocale?: "en" | "tr";
  onSave?: (data: {
    conditions: Record<string, ToothCondition>;
    items: StudioPlanItem[];
    visits: StudioVisit[];
  }) => Promise<void> | void;
  isSaving?: boolean;
  backHref?: string;
  embedded?: boolean;
  viewMode?: "studio" | "table";
  onViewModeChange?: (mode: "studio" | "table") => void;
}

export function TreatmentStudio({
  initialPatient,
  initialClinic,
  initialConditions,
  initialItems,
  initialVisits,
  initialCurrency = "EUR",
  initialLocale = "tr",
  onSave,
  isSaving = false,
  backHref = "/app/plans",
  embedded = false,
  viewMode = "studio",
  onViewModeChange,
}: TreatmentStudioProps) {
  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<StudioTab>("diagnosis");

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
    initialConditions || {
      "16": "filled",
      "14": "caries",
      "24": "caries",
      "26": "missing",
      "36": "missing",
      "46": "root_canal",
    }
  );

  // Visits & Plan Items (Module 2)
  const [visits, setVisits] = useState<StudioVisit[]>(
    initialVisits || [
      {
        id: "v-1",
        orderNum: 1,
        title: "1. Seans: Cerrahi, İmplantasyon ve Hibrit Protez",
        phaseLabel: "1. Cerrahi Aşama",
        chartTeeth: ["12", "14", "22", "24", "32", "34", "42", "44"],
      },
      {
        id: "v-2",
        orderNum: 2,
        title: "2. Seans: Kalıcı Zirkonyum Köprü Simantasyonu",
        phaseLabel: "2. Protetik Tamamlama",
        healingNote: "6 Ay İyileşme Süresi",
        healingMonths: 6,
        chartTeeth: ["16", "26", "36", "46"],
      },
    ]
  );

  const [items, setItems] = useState<StudioPlanItem[]>(
    initialItems && initialItems.length > 0
      ? initialItems
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
          {
            id: "it-imp-up",
            treatmentType: "implant",
            treatmentName: "Nobel Titanyum İmplant",
            teeth: ["12", "14", "22", "24"],
            quantity: 4,
            unitPrice: 0,
            visitId: "v-1",
          },
          {
            id: "it-imp-low",
            treatmentType: "implant",
            treatmentName: "Nobel Titanyum İmplant",
            teeth: ["32", "34", "42", "44"],
            quantity: 4,
            unitPrice: 0,
            visitId: "v-1",
          },
        ]
  );

  // Modals & Panels
  const [isDraftsModalOpen, setIsDraftsModalOpen] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // Apply draft template
  const handleApplyTemplate = (tpl: SavedDraftTemplate) => {
    const newItems: StudioPlanItem[] = [];
    if (tpl.packageUpperPrice) {
      newItems.push({
        id: `tpl-up-${Date.now()}`,
        treatmentType: "implant",
        treatmentName: `${tpl.title} — Üst Paket`,
        teeth: ["12", "14", "22", "24"],
        quantity: 1,
        unitPrice: tpl.packageUpperPrice,
        isPackage: true,
        visitId: visits[0]?.id || "v-1",
      });
    }
    if (tpl.packageLowerPrice) {
      newItems.push({
        id: `tpl-low-${Date.now()}`,
        treatmentType: "implant",
        treatmentName: `${tpl.title} — Alt Paket`,
        teeth: ["32", "34", "42", "44"],
        quantity: 1,
        unitPrice: tpl.packageLowerPrice,
        isPackage: true,
        visitId: visits[0]?.id || "v-1",
      });
    }
    tpl.items
      .filter((it) => it.type !== "package")
      .forEach((it, idx) => {
        newItems.push({
          id: `tpl-it-${idx}-${Date.now()}`,
          treatmentType: it.type === "implant" ? "implant" : "dentures",
          treatmentName: it.label,
          teeth: it.teeth,
          quantity: it.teeth.length || 1,
          unitPrice: 0,
          visitId: visits[0]?.id || "v-1",
        });
      });

    setItems(newItems);
  };

  const handleSave = async () => {
    if (onSave) {
      await onSave({ conditions, items, visits });
      setSaveSuccessMsg(true);
      setTimeout(() => setSaveSuccessMsg(false), 3000);
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

            {/* View Mode Switcher (Studio vs Klasik Tablo) */}
            {onViewModeChange && (
              <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/80 shadow-2xs">
                <button
                  type="button"
                  onClick={() => onViewModeChange("studio")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                    viewMode === "studio"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Sparkles className="size-3 text-blue-400" />
                  <span>3D Treatment Studio</span>
                </button>
                <button
                  type="button"
                  onClick={() => onViewModeChange("table")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                    viewMode === "table"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>📑 Klasik Tablo</span>
                </button>
              </div>
            )}

            {/* Patient & Plan Info Chip (Tek Kutu, Renksiz/Nötr) */}
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-xs text-slate-700 shadow-2xs">
              <User className="size-3.5 text-slate-400" />
              <span className="font-semibold text-slate-900">{patient.name}</span>
              <span className="h-3.5 w-px bg-slate-200" />
              <span className="text-slate-500">Tedavi Planı</span>
            </div>
          </div>

          {/* Right: ONLY Şablonlar (Drafts) & Kaydet */}
          <div className="flex items-center gap-2">
            {/* Şablonlar (Saved Drafts) */}
            <button
              type="button"
              onClick={() => setIsDraftsModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold px-3.5 py-2 text-xs shadow-2xs transition cursor-pointer active:scale-95"
            >
              <Sparkles className="size-3.5 text-blue-600" />
              <span>Şablonlar (Drafts)</span>
            </button>

            {/* Kaydet */}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 text-xs shadow-xs transition cursor-pointer disabled:opacity-50 active:scale-95"
            >
              <Save className="size-3.5" />
              <span>{isSaving ? "Kaydediliyor..." : "Kaydet"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Save Success Alert Banner */}
      {saveSuccessMsg && (
        <div className="rounded-xl bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 shadow-xs transition flex items-center justify-center gap-2">
          <CheckCircle2 className="size-4" />
          <span>Tedavi planı ve tüm modüller başarıyla kaydedildi ve senkronize edildi.</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. CHEVRON WIZARD STEP NAVIGATION BAR */}
      {/* ============================================================== */}
      <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
        <div className="flex items-stretch overflow-x-auto scrollbar-none divide-x divide-slate-100">
          {[
            { id: "diagnosis" as const, label: "Diagnosis (Teşhis)" },
            { id: "treatments" as const, label: "Treatments (Tedavi Planlama)" },
            { id: "animation" as const, label: "Animation (3D Simülasyon)" },
            { id: "ai_summary" as const, label: "AI summary (Akıllı Özet)" },
            { id: "overview" as const, label: "Overview (Hasta Sunumu)" },
          ].map((tab, idx) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`group relative flex-1 min-w-[170px] py-3.5 px-5 text-xs font-bold transition flex items-center justify-center gap-2.5 cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-950 hover:bg-slate-50"
                }`}
              >
                <span
                  className={`size-5 rounded-full flex items-center justify-center text-[10px] font-mono border font-black ${
                    isActive
                      ? "bg-white text-slate-950 border-white"
                      : "bg-slate-100 text-slate-500 border-slate-200"
                  }`}
                >
                  {idx + 1}
                </span>
                <span>{tab.label}</span>

                {/* Right Arrow Chevron indicator */}
                <span
                  className={`hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 size-0 border-y-[18px] border-y-transparent border-l-[11px] transition ${
                    isActive ? "border-l-slate-900" : "border-l-transparent"
                  }`}
                />
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
            onConditionsChange={setConditions}
            patientName={patient.name}
          />
        )}

        {/* Module 2: Tedavi Planlama (Treatments) */}
        {activeTab === "treatments" && (
          <TreatmentsModule
            conditions={conditions}
            items={items}
            visits={visits}
            currency={currency}
            onItemsChange={setItems}
            onVisitsChange={setVisits}
          />
        )}

        {/* Module 3: 3D Animasyon (Simulation) */}
        {activeTab === "animation" && (
          <SimulationModule
            stages={DEFAULT_ANIMATION_STAGES}
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
            onPatientDobChange={(dob) => setPatient({ ...patient, dob })}
          />
        )}
      </div>

      {/* Global Saved Drafts Modal */}
      <DraftsModal
        isOpen={isDraftsModalOpen}
        onClose={() => setIsDraftsModalOpen(false)}
        onApplyTemplate={handleApplyTemplate}
      />
    </div>
  );
}
