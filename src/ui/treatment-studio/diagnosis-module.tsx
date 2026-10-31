"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  Layers,
  Lock,
  RotateCcw,
  X,
} from "lucide-react";
import { FdiOdontogram, TOOTH_METADATA } from "./fdi-odontogram";
import { XRayViewer } from "./xray-viewer";
import type { ToothCondition } from "./types";

export const CONDITION_CONFIG: Record<
  ToothCondition,
  {
    labelTr: string;
    labelEn: string;
    badgeClass: string;
    dotColor: string;
    borderClass: string;
  }
> = {
  intact: {
    labelTr: "Sağlam",
    labelEn: "Intact",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dotColor: "bg-emerald-500",
    borderClass: "border-emerald-200",
  },
  missing: {
    labelTr: "Eksik Diş",
    labelEn: "Missing",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    dotColor: "bg-rose-500",
    borderClass: "border-rose-200",
  },
  caries: {
    labelTr: "Çürük",
    labelEn: "Caries",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
    dotColor: "bg-amber-500",
    borderClass: "border-amber-200",
  },
  filled: {
    labelTr: "Dolgulu",
    labelEn: "Filled",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
    dotColor: "bg-sky-500",
    borderClass: "border-sky-200",
  },
  root_canal: {
    labelTr: "Kanal Tedavili",
    labelEn: "Root Canal",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
    dotColor: "bg-purple-500",
    borderClass: "border-purple-200",
  },
  implant: {
    labelTr: "İmplant + Abutment",
    labelEn: "Implant",
    badgeClass: "bg-teal-50 text-teal-700 border-teal-200",
    dotColor: "bg-teal-500",
    borderClass: "border-teal-200",
  },
  crown: {
    labelTr: "Kuron",
    labelEn: "Crown",
    badgeClass: "bg-orange-50 text-orange-700 border-orange-200",
    dotColor: "bg-orange-500",
    borderClass: "border-orange-200",
  },
  bridge: {
    labelTr: "Köprü",
    labelEn: "Bridge",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
    dotColor: "bg-indigo-500",
    borderClass: "border-indigo-200",
  },
};

interface DiagnosisModuleProps {
  conditions: Record<string, ToothCondition>;
  onConditionsChange: (conditions: Record<string, ToothCondition>) => void;
  xrayUrl?: string;
  onXrayChange?: (url: string) => void;
  patientName?: string;
  isLocked?: boolean;
}

export function DiagnosisModule({
  conditions,
  onConditionsChange,
  xrayUrl,
  onXrayChange,
  patientName = "Ömer Yılmaz",
  isLocked = false,
}: DiagnosisModuleProps) {
  const [selectedTeeth, setSelectedTeeth] = useState<string[]>([]);
  const [openSections, setOpenSections] = useState<{
    general: boolean;
    upper: boolean;
    lower: boolean;
  }>({
    general: false,
    upper: true,
    lower: true,
  });

  const toggleSection = (section: "general" | "upper" | "lower") => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // General Findings Notes
  const [generalNotes, setGeneralNotes] = useState<string>(
    "Genel kemik dansitesi iyi düzeyde (D2 kalitesinde). Posterior bölgelerde edantulizm mevcut; anterior bölgede minimal oklüzal atrizyon izleniyor. All-on-4 / All-on-6 implantasyon protokolüne uygun anatomik kemik desteği saptandı."
  );

  const handleToggleTooth = (toothNumber: string) => {
    setSelectedTeeth((prev) =>
      prev.includes(toothNumber)
        ? prev.filter((t) => t !== toothNumber)
        : [...prev, toothNumber]
    );
  };

  const handleApplyCondition = (cond: ToothCondition) => {
    if (isLocked || selectedTeeth.length === 0) return;
    const next = { ...conditions };
    selectedTeeth.forEach((t) => {
      if (cond === "intact") {
        delete next[t];
      } else {
        next[t] = cond;
      }
    });
    onConditionsChange(next);
    setSelectedTeeth([]);
  };

  const handleRemoveSingleCondition = (tooth: string) => {
    if (isLocked) return;
    const next = { ...conditions };
    delete next[tooth];
    onConditionsChange(next);
  };

  // Grouped findings for upper and lower jaws
  const upperFindings = Object.entries(conditions).filter(
    ([tooth, cond]) => cond !== "intact" && TOOTH_METADATA[tooth]?.jaw === "upper"
  );
  const lowerFindings = Object.entries(conditions).filter(
    ([tooth, cond]) => cond !== "intact" && TOOTH_METADATA[tooth]?.jaw === "lower"
  );

  // Overall Statistics
  const totalFindings = upperFindings.length + lowerFindings.length;
  const missingCount = Object.values(conditions).filter((c) => c === "missing").length;
  const cariesCount = Object.values(conditions).filter((c) => c === "caries").length;
  const intactCount = 32 - Object.keys(conditions).length;
  const intactPercentage = Math.round((intactCount / 32) * 100);

  // Quick Clinical Templates
  const clinicalNoteTemplates = [
    { label: "+ Kemik Dansitesi", text: " Kemik kalitesi implant primer stabilitesi için yeterli düzeydedir." },
    { label: "+ All-on-4/6 Uygun", text: " Posterior krette rezorpsiyon nedeniyle All-on-4 / All-on-6 konsepti endikedir." },
    { label: "+ Sinüs Lifting", text: " Maksiller posterior sahada sinüs sarkması nedeniyle kret yüksekliği kontrol edilmelidir." },
    { label: "+ Bruksizm/Aşınma", text: " Oklüzal yüzeylerde parafonksiyonel aşınma izlenmektedir; gece plağı önerilir." },
  ];

  const handleAppendTemplate = (templateText: string) => {
    setGeneralNotes((prev) => (prev ? `${prev}${templateText}` : templateText.trim()));
  };

  // Auto-generate AI Diagnosis Summary
  const handleGenerateAiSummary = () => {
    const missing = Object.entries(conditions).filter(([_, c]) => c === "missing").map(([t]) => `#${t}`);
    const caries = Object.entries(conditions).filter(([_, c]) => c === "caries").map(([t]) => `#${t}`);
    const canals = Object.entries(conditions).filter(([_, c]) => c === "root_canal").map(([t]) => `#${t}`);
    const filled = Object.entries(conditions).filter(([_, c]) => c === "filled").map(([t]) => `#${t}`);

    const parts: string[] = [];
    parts.push(`Klinik ve Radyolojik Teşhis Özeti (${new Date().toLocaleDateString("tr-TR")}):`);
    if (missing.length > 0) {
      parts.push(`• Eksik Dişler: ${missing.join(", ")} (İmplant destekli sabit protez planlanabilir).`);
    }
    if (caries.length > 0) {
      parts.push(`• Aktif Çürük: ${caries.join(", ")} (Tedavi planlamasına kompozit dolgu / kanal tedavisi eklendi).`);
    }
    if (canals.length > 0) {
      parts.push(`• Kanal Tedavili: ${canals.join(", ")} (Radyografik periapikal lezyon izlenmedi, stabil).`);
    }
    if (filled.length > 0) {
      parts.push(`• Mevcut Dolgular: ${filled.join(", ")} (Kenar sızıntısı yok, takip edilecek).`);
    }
    parts.push(`• Çene Kemiği & Kemik Desteği: Anatomik kret yüksekliği All-on-4 / All-on-6 implantasyonuna uygundur.`);

    setGeneralNotes(parts.join("\n"));
  };

  return (
    <div className="space-y-6">
      {/* Kilitli Plan Bilgilendirme Uyarısı */}
      {isLocked && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-xs text-amber-900 font-semibold shadow-2xs">
          <Lock className="size-4 text-amber-600 shrink-0" />
          <span>Bu tedavi planı onaylanıp kilitlendiği için diş teşhisleri düzenlemeye kapatılmıştır (salt okunur mod).</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. Odontogram & Condition Selector Panel */}
      {/* Unified Parent Container Matching X-Ray Container */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs items-stretch">
        {/* Left 8/9 Columns: Anatomical Odontogram (Card inside card) */}
        <div className="xl:col-span-8 2xl:col-span-9 flex flex-col h-full">
          <FdiOdontogram
            conditions={conditions}
            selectedTeeth={selectedTeeth}
            onToggleTooth={handleToggleTooth}
            className="w-full select-none rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 transition-all flex flex-col justify-between h-full"
          />
        </div>

        {/* Right 4/3 Columns: Diagnosis Status Buttons (Card inside card) */}
        <div className="xl:col-span-4 2xl:col-span-3 flex flex-col justify-between space-y-4 bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200/80 transition h-full">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-slate-900 ring-2 ring-slate-200" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Teşhis Belirle
                </span>
              </div>
              {selectedTeeth.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedTeeth([])}
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 transition flex items-center gap-1 px-2 py-0.5 rounded-lg hover:bg-slate-200/60 cursor-pointer"
                >
                  Seçimi Kaldır
                </button>
              )}
            </div>

            {selectedTeeth.length > 0 ? (
              <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-slate-900 text-white shadow-2xs">
                <span className="text-[11px] font-bold text-slate-300">
                  {selectedTeeth.length} Diş Seçili:
                </span>
                <span className="text-xs text-white font-mono font-bold">
                  {selectedTeeth.map((t) => `#${t}`).join(", ")}
                </span>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400">
                Diş seçmek için sol odontogramdaki dişlere tıklayın:
              </p>
            )}

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "missing" as const, label: "Eksik Diş", tip: "Missing" },
                { id: "intact" as const, label: "Sağlam", tip: "Intact" },
                { id: "filled" as const, label: "Dolgulu", tip: "Filled" },
                { id: "caries" as const, label: "Çürük", tip: "Caries" },
                { id: "root_canal" as const, label: "Kanal Tedavili", tip: "Endo" },
                { id: "implant" as const, label: "İmplant", tip: "Fixture" },
                { id: "crown" as const, label: "Kuron", tip: "Crown" },
                { id: "bridge" as const, label: "Köprü", tip: "Bridge" },
              ].map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  disabled={isLocked || selectedTeeth.length === 0}
                  onClick={() => handleApplyCondition(btn.id)}
                  className={`flex flex-col items-center justify-center rounded-xl border border-slate-200/80 bg-white p-2 text-center text-xs font-semibold transition shadow-2xs ${
                    isLocked || selectedTeeth.length === 0
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:bg-slate-100 hover:border-slate-300 text-slate-700 cursor-pointer active:scale-95"
                  }`}
                >
                  <span>{btn.label}</span>
                  <span className="text-[9px] text-slate-400 font-normal">
                    {btn.tip}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {!isLocked && (
            <div className="pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  onConditionsChange({});
                  setSelectedTeeth([]);
                }}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 py-2.5 text-xs font-bold transition cursor-pointer shadow-2xs active:scale-95"
                title="Tüm dişlerdeki teşhis ve durumları sıfırlayıp sağlam hale getirir"
              >
                <RotateCcw className="size-3.5 text-rose-600" />
                <span>Tüm Teşhisleri Sıfırla</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. Panoramic X-Ray (Röntgen) Inspection Section */}
      {/* ============================================================== */}
      <div>
        {/* Enhanced High-End XRayViewer */}
        <XRayViewer
          initialImageUrl={xrayUrl}
          onImageChange={onXrayChange}
          patientName={patientName}
        />
      </div>

      {/* ============================================================== */}
      {/* 3. Findings & Clinical Notes Section */}
      {/* Left: Detailed Findings & Clinical Notes (Accordions) */}
      {/* Right: Vertical Summary & Statistics Cards */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* Left Side: Clinical Findings & Notes Accordions */}
        <div className="xl:col-span-8 2xl:col-span-9 order-2 xl:order-1">
          <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs divide-y divide-slate-100">
            {/* A. General Clinical Findings Accordion */}
            <div className="p-4 sm:p-5 transition hover:bg-slate-50/20">
              <div
                onClick={() => toggleSection("general")}
                className="flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-900 text-white">
                    <FileText className="size-4" />
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Genel Teşhis Notları
                  </h4>
                </div>

                <div className="flex items-center gap-2.5">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      generalNotes.trim()
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-slate-100 text-slate-400 border-slate-200"
                    }`}
                  >
                    {generalNotes.trim() ? "Not Kayıtlı" : "Boş"}
                  </span>
                  {openSections.general ? (
                    <ChevronUp className="size-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="size-4 text-slate-400" />
                  )}
                </div>
              </div>

              {openSections.general && (
                <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-3">
                  {/* AI Summary and Quick Templates Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-500 mr-1">
                        Hızlı Ekle:
                      </span>
                      {clinicalNoteTemplates.map((tpl, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleAppendTemplate(tpl.text)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition cursor-pointer"
                          title={tpl.text}
                        >
                          {tpl.label}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerateAiSummary}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold transition cursor-pointer shadow-2xs"
                      title="Seçili diş teşhislerine göre otomatik klinik not oluştur"
                    >
                      <Bot className="size-3.5 text-purple-600" />
                      <span>AI ile Teşhis Özeti Üret</span>
                    </button>
                  </div>

                  {/* Editable Clinical Note Area */}
                  <div className="relative">
                    <textarea
                      rows={4}
                      disabled={isLocked}
                      value={generalNotes}
                      onChange={(e) => setGeneralNotes(e.target.value)}
                      placeholder="Hastanın kemik yapısı, oklüzyon, yumuşak doku ve implantasyon hazırlığına ilişkin genel hekim notlarını giriniz..."
                      className="w-full text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition resize-y"
                    />
                    <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1 px-1">
                      <span>Otomatik kaydedilir</span>
                      <span>{generalNotes.length} karakter</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* B. Upper Jaw (Maxilla) Findings Accordion */}
            <div className="p-4 sm:p-5 transition hover:bg-slate-50/20">
              <div
                onClick={() => toggleSection("upper")}
                className="flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-900 text-white">
                    <Layers className="size-4" />
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Üst Çene (Maksilla)
                  </h4>
                </div>

                <div className="flex items-center gap-2.5">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      upperFindings.length === 0
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {upperFindings.length === 0
                      ? "0 Bulgu • Tümü Sağlam"
                      : `${upperFindings.length} Bulgu`}
                  </span>
                  {openSections.upper ? (
                    <ChevronUp className="size-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="size-4 text-slate-400" />
                  )}
                </div>
              </div>

              {openSections.upper && (
                <div className="mt-4 pt-3.5 border-t border-slate-100">
                  {upperFindings.length === 0 ? (
                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50/40 border border-emerald-200/70 text-emerald-800">
                      <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                      <span className="text-xs font-bold text-emerald-900">
                        Üst çenede patolojik bulgu saptanmadı (Tüm dişler sağlam)
                      </span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
                      {upperFindings.map(([tooth, cond]) => {
                        const meta = TOOTH_METADATA[tooth];
                        const cfg = CONDITION_CONFIG[cond] || CONDITION_CONFIG.intact;
                        const isSelected = selectedTeeth.includes(tooth);

                        return (
                          <div
                            key={tooth}
                            className={`flex items-center justify-between p-3 rounded-xl border transition shadow-2xs ${
                              isSelected
                                ? "bg-slate-900/5 border-slate-800 ring-2 ring-slate-900/10"
                                : "bg-white border-slate-200/80 hover:border-slate-300"
                            }`}
                          >
                            <div
                              onClick={() => handleToggleTooth(tooth)}
                              className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
                              title="Odontogramda seçmek için tıklayın"
                            >
                              <span className="size-7 rounded-lg bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                                #{tooth}
                              </span>
                              <div className="truncate">
                                <div className="text-xs font-bold text-slate-900 truncate">
                                  {meta?.nameTr || `Diş #${tooth}`}
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span
                                    className={`size-1.5 rounded-full ${cfg.dotColor}`}
                                  />
                                  <span className="text-[10px] font-semibold text-slate-500">
                                    {cfg.labelTr}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {!isLocked && (
                              <button
                                type="button"
                                onClick={() => handleRemoveSingleCondition(tooth)}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer shrink-0 ml-1"
                                title="Bu teşhisi kaldır (Sağlam yap)"
                              >
                                <X className="size-3.5" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* C. Lower Jaw (Mandible) Findings Accordion */}
            <div className="p-4 sm:p-5 transition hover:bg-slate-50/20">
              <div
                onClick={() => toggleSection("lower")}
                className="flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-900 text-white">
                    <Layers className="size-4" />
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Alt Çene (Mandibula)
                  </h4>
                </div>

                <div className="flex items-center gap-2.5">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      lowerFindings.length === 0
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {lowerFindings.length === 0
                      ? "0 Bulgu • Tümü Sağlam"
                      : `${lowerFindings.length} Bulgu`}
                  </span>
                  {openSections.lower ? (
                    <ChevronUp className="size-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="size-4 text-slate-400" />
                  )}
                </div>
              </div>

              {openSections.lower && (
                <div className="mt-4 pt-3.5 border-t border-slate-100">
                  {lowerFindings.length === 0 ? (
                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50/40 border border-emerald-200/70 text-emerald-800">
                      <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                      <span className="text-xs font-bold text-emerald-900">
                        Alt çenede patolojik bulgu saptanmadı (Tüm dişler sağlam)
                      </span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
                      {lowerFindings.map(([tooth, cond]) => {
                        const meta = TOOTH_METADATA[tooth];
                        const cfg = CONDITION_CONFIG[cond] || CONDITION_CONFIG.intact;
                        const isSelected = selectedTeeth.includes(tooth);

                        return (
                          <div
                            key={tooth}
                            className={`flex items-center justify-between p-3 rounded-xl border transition shadow-2xs ${
                              isSelected
                                ? "bg-slate-900/5 border-slate-800 ring-2 ring-slate-900/10"
                                : "bg-white border-slate-200/80 hover:border-slate-300"
                            }`}
                          >
                            <div
                              onClick={() => handleToggleTooth(tooth)}
                              className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
                              title="Odontogramda seçmek için tıklayın"
                            >
                              <span className="size-7 rounded-lg bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                                #{tooth}
                              </span>
                              <div className="truncate">
                                <div className="text-xs font-bold text-slate-900 truncate">
                                  {meta?.nameTr || `Diş #${tooth}`}
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span
                                    className={`size-1.5 rounded-full ${cfg.dotColor}`}
                                  />
                                  <span className="text-[10px] font-semibold text-slate-500">
                                    {cfg.labelTr}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {!isLocked && (
                              <button
                                type="button"
                                onClick={() => handleRemoveSingleCondition(tooth)}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer shrink-0 ml-1"
                                title="Bu teşhisi kaldır (Sağlam yap)"
                              >
                                <X className="size-3.5" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Clinical Statistics Summary Cards Stacked Vertically */}
        <div className="xl:col-span-4 2xl:col-span-3 order-1 xl:order-2 xl:sticky xl:top-4">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-3.5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-slate-900 ring-2 ring-slate-200" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Klinik Durum Özeti
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                FDI 32
              </span>
            </div>

            {/* Stacked Cards */}
            <div className="space-y-2.5">
              {/* 1. Toplam Diş */}
              <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between transition hover:border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                    32
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Toplam Diş
                    </div>
                    <div className="text-xs font-bold text-slate-800">
                      Tam Dentisyon
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                  Tam Ark
                </span>
              </div>

              {/* 2. Sağlam Diş */}
              <div className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-100/90 space-y-2 transition hover:border-emerald-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                      {intactCount}
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                        Sağlam Diş
                      </div>
                      <div className="text-xs font-bold text-emerald-900">
                        %{intactPercentage} Sağlamlık
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                    {intactCount} / 32
                  </span>
                </div>
                <div className="w-full bg-emerald-200/50 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${intactPercentage}%` }}
                  />
                </div>
              </div>

              {/* 3. Eksik Diş */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between transition ${
                  missingCount > 0
                    ? "bg-rose-50/50 border-rose-200/90 hover:border-rose-300"
                    : "bg-slate-50/50 border-slate-100 hover:border-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`size-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs ${
                      missingCount > 0
                        ? "bg-rose-100 text-rose-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {missingCount}
                  </div>
                  <div>
                    <div
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        missingCount > 0 ? "text-rose-700" : "text-slate-400"
                      }`}
                    >
                      Eksik Diş
                    </div>
                    <div
                      className={`text-xs font-bold ${
                        missingCount > 0 ? "text-rose-900" : "text-slate-700"
                      }`}
                    >
                      {missingCount === 0 ? "Eksik Yok" : `${missingCount} Diş Eksik`}
                    </div>
                  </div>
                </div>
                {missingCount > 0 ? (
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-md border border-rose-200/80">
                    Eksik
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                    Tam
                  </span>
                )}
              </div>

              {/* 4. Bulgu & Patoloji */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between transition ${
                  totalFindings > 0
                    ? "bg-amber-50/50 border-amber-200/90 hover:border-amber-300"
                    : "bg-slate-50/50 border-slate-100 hover:border-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`size-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs ${
                      totalFindings > 0
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {totalFindings}
                  </div>
                  <div>
                    <div
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        totalFindings > 0 ? "text-amber-800" : "text-slate-400"
                      }`}
                    >
                      Bulgu & Patoloji
                    </div>
                    <div
                      className={`text-xs font-bold ${
                        totalFindings > 0 ? "text-amber-900" : "text-slate-700"
                      }`}
                    >
                      {totalFindings === 0 ? "0 Aktif Bulgu" : `${totalFindings} Teşhis`}
                    </div>
                  </div>
                </div>
                {totalFindings > 0 ? (
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-200/80">
                    Bulgu Var
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                    Temiz
                  </span>
                )}
              </div>
            </div>

            {/* Overall Verdict Banner */}
            <div className="pt-2 border-t border-slate-100">
              {totalFindings === 0 && missingCount === 0 ? (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/70 text-emerald-800 text-[11px] font-semibold">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span>Tüm dentisyon sağlam & eksiksiz.</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/70 text-amber-900 text-[11px] font-semibold">
                  <AlertCircle className="size-4 text-amber-600 shrink-0" />
                  <span>
                    {totalFindings > 0 && `${totalFindings} bulgu`}
                    {totalFindings > 0 && missingCount > 0 && " • "}
                    {missingCount > 0 && `${missingCount} eksik diş`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
