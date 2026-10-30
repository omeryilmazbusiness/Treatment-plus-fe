"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Check,
  Layers,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import type { SavedDraftTemplate } from "./types";

export const DEFAULT_TEMPLATES: SavedDraftTemplate[] = [
  {
    id: "all-on-4-full",
    title: "All-on-4 (Upper + Lower - Nobel Biocare)",
    tag: "full",
    category: "full_mouth",
    isStarred: true,
    packageUpperPrice: 5999,
    packageLowerPrice: 5999,
    notice: "Nobel Biocare titanyum armatürler ve aynı gün sabit geçici hibrit protez dahildir.",
    items: [
      { type: "package", label: "All-on-4 Üst Çene Paketi", teeth: ["12", "14", "22", "24"], price: 5999 },
      { type: "package", label: "All-on-4 Alt Çene Paketi", teeth: ["32", "34", "42", "44"], price: 5999 },
      { type: "implant", label: "Nobel Biocare Titanyum İmplant (Üst)", teeth: ["12", "14", "22", "24"] },
      { type: "implant", label: "Nobel Biocare Titanyum İmplant (Alt)", teeth: ["32", "34", "42", "44"] },
      { type: "abutment", label: "Multi-Unit Açılı Dayanak Seti (Üst)", teeth: ["12", "14", "22", "24"] },
      { type: "abutment", label: "Multi-Unit Açılı Dayanak Seti (Alt)", teeth: ["32", "34", "42", "44"] },
      { type: "denture", label: "Uzun Süreli Sabit Geçici Hibrit Protez (Üst)", teeth: ["16", "15", "14", "13", "12", "11", "21", "22", "23", "24", "25", "26"] },
      { type: "denture", label: "Uzun Süreli Sabit Geçici Hibrit Protez (Alt)", teeth: ["36", "35", "34", "33", "32", "31", "41", "42", "43", "44", "45", "46"] },
      { type: "screw", label: "Protetik Kilitleme Vidaları (Üst)", teeth: ["12", "14", "22", "24"] },
      { type: "screw", label: "Protetik Kilitleme Vidaları (Alt)", teeth: ["32", "34", "42", "44"] },
    ],
  },
  {
    id: "all-on-6-full",
    title: "All-on-6 (Üst) / All-on-4 (Alt) Hibrit Protokolü",
    tag: "full",
    category: "full_mouth",
    isStarred: true,
    packageUpperPrice: 7500,
    packageLowerPrice: 5999,
    notice: "Üst çenede 6 implant ile maksimum kret ankrajı ve vidalı zirkonyum köprü.",
    items: [
      { type: "package", label: "All-on-6 Üst Çene Paketi", teeth: ["16", "14", "12", "22", "24", "26"], price: 7500 },
      { type: "package", label: "All-on-4 Alt Çene Paketi", teeth: ["32", "34", "42", "44"], price: 5999 },
      { type: "implant", label: "Titanyum İmplant Fikstür (Üst)", teeth: ["16", "14", "12", "22", "24", "26"] },
      { type: "implant", label: "Titanyum İmplant Fikstür (Alt)", teeth: ["32", "34", "42", "44"] },
      { type: "abutment", label: "Multi-Unit Abutment Seti", teeth: ["16", "14", "12", "22", "24", "26", "32", "34", "42", "44"] },
      { type: "denture", label: "Güçlendirilmiş Geçici Vidalı Köprü", teeth: ["16", "26", "36", "46"] },
    ],
  },
  {
    id: "bridges-8-6",
    title: "8/6 İmplant ve Monolitik Zirkonyum Köprüler",
    tag: "full",
    category: "full_mouth",
    isStarred: false,
    packageUpperPrice: 8900,
    packageLowerPrice: 6800,
    notice: "Tam çene anatomik zirkonyum köprüler ile doğal diş hissiyatı.",
    items: [
      { type: "package", label: "8 İmplantlı Üst Çene Zirkonyum Köprü", teeth: ["17", "15", "13", "11", "21", "23", "25", "27"], price: 8900 },
      { type: "package", label: "6 İmplantlı Alt Çene Zirkonyum Köprü", teeth: ["46", "44", "42", "32", "34", "36"], price: 6800 },
      { type: "implant", label: "İmplant Fikstür (Üst 8 Adet)", teeth: ["17", "15", "13", "11", "21", "23", "25", "27"] },
      { type: "implant", label: "İmplant Fikstür (Alt 6 Adet)", teeth: ["46", "44", "42", "32", "34", "36"] },
    ],
  },
  {
    id: "hollywood-smile",
    title: "Hollywood Smile (20 Üye E-Max / Zirkonyum)",
    tag: "other",
    category: "other",
    isStarred: true,
    packageUpperPrice: 3400,
    packageLowerPrice: 3000,
    notice: "Gülüş hattındaki tüm ön ve yan dişler için estetik monolitik kuron / lamina seti.",
    items: [
      { type: "package", label: "Üst Çene Gülüş Tasarımı (10 Üye)", teeth: ["15", "14", "13", "12", "11", "21", "22", "23", "24", "25"], price: 3400 },
      { type: "package", label: "Alt Çene Gülüş Tasarımı (10 Üye)", teeth: ["35", "34", "33", "32", "31", "41", "42", "43", "44", "45"], price: 3000 },
      { type: "crown", label: "E-Max / Vita Zirkonyum Lamina & Kuron", teeth: ["15", "14", "13", "12", "11", "21", "22", "23", "24", "25"] },
    ],
  },
  {
    id: "single-implant-crown",
    title: "Tek Diş İmplant & Zirkonyum Kuron",
    tag: "upper",
    category: "upper_jaw",
    isStarred: false,
    packageUpperPrice: 950,
    notice: "Tekil diş eksikliği için titanyum implant ve zirkonyum üst yapı paketi.",
    items: [
      { type: "package", label: "İmplant + Zirkonyum Kuron Paketi", teeth: ["16"], price: 950 },
      { type: "implant", label: "Straumann / Nobel İmplant", teeth: ["16"] },
      { type: "abutment", label: "Kişiye Özel Zirkonyum Abutment", teeth: ["16"] },
      { type: "crown", label: "Monolitik Zirkonyum Kuron", teeth: ["16"] },
    ],
  },
];

interface DraftsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (template: SavedDraftTemplate) => void;
}

export function DraftsModal({ isOpen, onClose, onApplyTemplate }: DraftsModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "full_mouth" | "upper_jaw" | "lower_jaw" | "other"
  >("full_mouth");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("all-on-4-full");

  if (!isOpen) return null;

  const filteredTemplates = DEFAULT_TEMPLATES.filter((t) => {
    if (selectedCategory === "all") return true;
    return t.category === selectedCategory;
  });

  const activeTemplate: SavedDraftTemplate =
    DEFAULT_TEMPLATES.find((t) => t.id === selectedTemplateId) || DEFAULT_TEMPLATES[0]!;

  const handleApply = () => {
    if (activeTemplate) {
      onApplyTemplate(activeTemplate);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden font-sans">
        {/* Header matching Treatment+ branding */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-xs shadow-2xs">
              T+
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Tedavi Şablonları (Saved Drafts)
              </h2>
              <p className="text-[11px] text-slate-500 font-normal">
                Klinik protokollere uygun hazır implant, protez ve estetik vaka şablonları
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl w-fit">
            {(
              [
                { id: "all", label: "Tümü (All)" },
                { id: "full_mouth", label: "Tam Çene (Full Mouth)" },
                { id: "upper_jaw", label: "Üst Çene (Upper)" },
                { id: "lower_jaw", label: "Alt Çene (Lower)" },
                { id: "other", label: "Estetik & Lamine" },
              ] as const
            ).map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* 2-Column Split: Visual Arch & Itemized Details vs Template List */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 7 Cols: Arch Schematic & Items Breakdown */}
            <div className="lg:col-span-7 space-y-4">
              {/* Odontogram Arch Schematic matching Treatment+ aesthetics */}
              <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-b from-slate-50 to-white p-5 shadow-2xs">
                <div className="flex items-center justify-between mb-3 border-b border-slate-200/60 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                      Anatomik Çene & İmplant Yerleşim Şeması
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    FDI Uyumlu
                  </span>
                </div>

                <div className="flex items-center justify-center py-2">
                  <AnatomicalArchSchematic template={activeTemplate} />
                </div>
              </div>

              {/* Items Breakdown Table */}
              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-xs">
                <div className="bg-slate-900 text-white px-5 py-3 text-xs font-bold flex items-center justify-between">
                  <span>Prosedür ve Parça Dökümü</span>
                  <span className="text-[11px] font-normal text-slate-300">
                    {activeTemplate.items.length} Kalem
                  </span>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {/* Package Prices */}
                  {activeTemplate.packageUpperPrice && (
                    <div className="flex items-center justify-between px-5 py-3 bg-slate-100/70">
                      <span className="font-bold text-slate-900">
                        {activeTemplate.title} — Üst Çene Paketi
                      </span>
                      <span className="rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-black text-white shadow-2xs">
                        € {activeTemplate.packageUpperPrice.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {activeTemplate.packageLowerPrice && (
                    <div className="flex items-center justify-between px-5 py-3 bg-slate-100/70">
                      <span className="font-bold text-slate-900">
                        {activeTemplate.title} — Alt Çene Paketi
                      </span>
                      <span className="rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-black text-white shadow-2xs">
                        € {activeTemplate.packageLowerPrice.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {/* Components */}
                  {activeTemplate.items
                    .filter((it) => it.type !== "package")
                    .map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between px-5 py-2.5 text-slate-700 hover:bg-slate-50/80 transition">
                        <span className="font-medium text-slate-800">{item.label}</span>
                        <div className="flex flex-wrap items-center gap-1">
                          {item.teeth.map((t) => (
                            <span
                              key={t}
                              className="rounded-md bg-slate-100 border border-slate-200/80 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-800"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Right 5 Cols: Template List Options */}
            <div className="lg:col-span-5 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 px-1">
                Kayıtlı Klinik Şablonları ({filteredTemplates.length})
              </div>

              <div className="space-y-2.5">
                {filteredTemplates.map((tpl) => {
                  const isSelected = tpl.id === selectedTemplateId;
                  return (
                    <div
                      key={tpl.id}
                      onClick={() => setSelectedTemplateId(tpl.id)}
                      className={`group flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? "border-slate-900 bg-slate-900 text-white shadow-md ring-2 ring-slate-900/10 scale-[1.01]"
                          : "border-slate-200 bg-white hover:border-blue-400 hover:bg-slate-50/70 text-slate-800 shadow-2xs"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`size-5 rounded-full border-2 flex items-center justify-center transition ${
                            isSelected
                              ? "border-blue-500 bg-blue-500 text-white"
                              : "border-slate-300 bg-white group-hover:border-blue-400"
                          }`}
                        >
                          {isSelected && <div className="size-2 rounded-full bg-white" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold leading-snug">{tpl.title}</div>
                          <span
                            className={`inline-block text-[10px] uppercase font-bold tracking-wider mt-0.5 ${
                              isSelected ? "text-blue-200" : "text-slate-400"
                            }`}
                          >
                            {tpl.tag === "full" ? "Tam Çene" : tpl.tag === "upper" ? "Üst Çene" : tpl.tag}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {tpl.isStarred && (
                          <Star className={`size-4 ${isSelected ? "text-blue-400 fill-blue-400" : "text-blue-500 fill-blue-500"}`} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/90 px-6 py-4">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <AlertCircle className="size-4 shrink-0 text-blue-600" />
            <span>{activeTemplate.notice || "Bu şablon kliniğinize özel paket fiyatlandırması ile yapılandırılmıştır."}</span>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition cursor-pointer active:scale-95"
            >
              <span>Plana Ekle</span>
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * High-end Curved Horseshoe Arch Schematic showing implants, bridges, and abutments
 */
function AnatomicalArchSchematic({ template }: { template: SavedDraftTemplate }) {
  const upperTeeth = ["18", "17", "16", "15", "14", "13", "12", "11", "21", "22", "23", "24", "25", "26", "27", "28"];
  const lowerTeeth = ["48", "47", "46", "45", "44", "43", "42", "41", "31", "32", "33", "34", "35", "36", "37", "38"];

  // Collect active implant teeth from template items
  const implantTeethSet = new Set<string>();
  template.items.forEach((it) => {
    if (it.type === "implant") {
      it.teeth.forEach((t) => implantTeethSet.add(t));
    }
  });

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-md py-1">
      {/* Upper Arch (Curved) */}
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Üst Çene (Maksilla)</div>
      <div className="flex items-center justify-center gap-1.5 w-full flex-wrap">
        {upperTeeth.map((tooth) => {
          const isImplant = implantTeethSet.has(tooth);
          return (
            <div key={tooth} className="flex flex-col items-center">
              {isImplant ? (
                <div className="flex flex-col items-center group">
                  <div className="w-1.5 h-3 bg-emerald-600 rounded-t-xs"></div>
                  <div className="size-6 rounded-lg bg-emerald-500 border-2 border-emerald-700 flex items-center justify-center shadow-xs">
                    <span className="text-[9px] font-bold text-white">{tooth}</span>
                  </div>
                </div>
              ) : (
                <div className="size-5 rounded-md border border-slate-200 bg-white flex items-center justify-center">
                  <span className="text-[8px] font-medium text-slate-400">{tooth}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bridge connector representation */}
      <div className="w-4/5 h-2 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 rounded-full shadow-xs my-1"></div>

      {/* Lower Arch (Curved) */}
      <div className="flex items-center justify-center gap-1.5 w-full flex-wrap">
        {lowerTeeth.map((tooth) => {
          const isImplant = implantTeethSet.has(tooth);
          return (
            <div key={tooth} className="flex flex-col items-center">
              {isImplant ? (
                <div className="flex flex-col items-center group">
                  <div className="size-6 rounded-lg bg-emerald-500 border-2 border-emerald-700 flex items-center justify-center shadow-xs">
                    <span className="text-[9px] font-bold text-white">{tooth}</span>
                  </div>
                  <div className="w-1.5 h-3 bg-emerald-600 rounded-b-xs"></div>
                </div>
              ) : (
                <div className="size-5 rounded-md border border-slate-200 bg-white flex items-center justify-center">
                  <span className="text-[8px] font-medium text-slate-400">{tooth}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Alt Çene (Mandibula)</div>
    </div>
  );
}
