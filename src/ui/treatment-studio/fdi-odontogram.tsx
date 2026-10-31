"use client";

import React, { useMemo } from "react";
import type { ToothCondition } from "./types";

export const UPPER_TEETH_FDI = [
  "18", "17", "16", "15", "14", "13", "12", "11",
  "21", "22", "23", "24", "25", "26", "27", "28",
] as const;

export const LOWER_TEETH_FDI = [
  "48", "47", "46", "45", "44", "43", "42", "41",
  "31", "32", "33", "34", "35", "36", "37", "38",
] as const;

export const TOOTH_METADATA: Record<string, { nameTr: string; nameEn: string; type: "incisor" | "canine" | "premolar" | "molar"; jaw: "upper" | "lower" }> = {
  // Upper Right (Q1)
  "18": { nameTr: "Sağ Üst 3. Azı (20 Yaş)", nameEn: "Upper Right 3rd Molar", type: "molar", jaw: "upper" },
  "17": { nameTr: "Sağ Üst 2. Azı", nameEn: "Upper Right 2nd Molar", type: "molar", jaw: "upper" },
  "16": { nameTr: "Sağ Üst 1. Azı", nameEn: "Upper Right 1st Molar", type: "molar", jaw: "upper" },
  "15": { nameTr: "Sağ Üst 2. Küçük Azı", nameEn: "Upper Right 2nd Premolar", type: "premolar", jaw: "upper" },
  "14": { nameTr: "Sağ Üst 1. Küçük Azı", nameEn: "Upper Right 1st Premolar", type: "premolar", jaw: "upper" },
  "13": { nameTr: "Sağ Üst Köpek Dişi (Kanin)", nameEn: "Upper Right Canine", type: "canine", jaw: "upper" },
  "12": { nameTr: "Sağ Üst Yan Kesici", nameEn: "Upper Right Lateral Incisor", type: "incisor", jaw: "upper" },
  "11": { nameTr: "Sağ Üst Orta Kesici", nameEn: "Upper Right Central Incisor", type: "incisor", jaw: "upper" },
  // Upper Left (Q2)
  "21": { nameTr: "Sol Üst Orta Kesici", nameEn: "Upper Left Central Incisor", type: "incisor", jaw: "upper" },
  "22": { nameTr: "Sol Üst Yan Kesici", nameEn: "Upper Left Lateral Incisor", type: "incisor", jaw: "upper" },
  "23": { nameTr: "Sol Üst Köpek Dişi (Kanin)", nameEn: "Upper Left Canine", type: "canine", jaw: "upper" },
  "24": { nameTr: "Sol Üst 1. Küçük Azı", nameEn: "Upper Left 1st Premolar", type: "premolar", jaw: "upper" },
  "25": { nameTr: "Sol Üst 2. Küçük Azı", nameEn: "Upper Left 2nd Premolar", type: "premolar", jaw: "upper" },
  "26": { nameTr: "Sol Üst 1. Azı", nameEn: "Upper Left 1st Molar", type: "molar", jaw: "upper" },
  "27": { nameTr: "Sol Üst 2. Azı", nameEn: "Upper Left 2nd Molar", type: "molar", jaw: "upper" },
  "28": { nameTr: "Sol Üst 3. Azı (20 Yaş)", nameEn: "Upper Left 3rd Molar", type: "molar", jaw: "upper" },
  // Lower Right (Q4)
  "48": { nameTr: "Sağ Alt 3. Azı (20 Yaş)", nameEn: "Lower Right 3rd Molar", type: "molar", jaw: "lower" },
  "47": { nameTr: "Sağ Alt 2. Azı", nameEn: "Lower Right 2nd Molar", type: "molar", jaw: "lower" },
  "46": { nameTr: "Sağ Alt 1. Azı", nameEn: "Lower Right 1st Molar", type: "molar", jaw: "lower" },
  "45": { nameTr: "Sağ Alt 2. Küçük Azı", nameEn: "Lower Right 2nd Premolar", type: "premolar", jaw: "lower" },
  "44": { nameTr: "Sağ Alt 1. Küçük Azı", nameEn: "Lower Right 1st Premolar", type: "premolar", jaw: "lower" },
  "43": { nameTr: "Sağ Alt Köpek Dişi (Kanin)", nameEn: "Lower Right Canine", type: "canine", jaw: "lower" },
  "42": { nameTr: "Sağ Alt Yan Kesici", nameEn: "Lower Right Lateral Incisor", type: "incisor", jaw: "lower" },
  "41": { nameTr: "Sağ Alt Orta Kesici", nameEn: "Lower Right Central Incisor", type: "incisor", jaw: "lower" },
  // Lower Left (Q3)
  "31": { nameTr: "Sol Alt Orta Kesici", nameEn: "Lower Left Central Incisor", type: "incisor", jaw: "lower" },
  "32": { nameTr: "Sol Alt Yan Kesici", nameEn: "Lower Left Lateral Incisor", type: "incisor", jaw: "lower" },
  "33": { nameTr: "Sol Alt Köpek Dişi (Kanin)", nameEn: "Lower Left Canine", type: "canine", jaw: "lower" },
  "34": { nameTr: "Sol Alt 1. Küçük Azı", nameEn: "Lower Left 1st Premolar", type: "premolar", jaw: "lower" },
  "35": { nameTr: "Sol Alt 2. Küçük Azı", nameEn: "Lower Left 2nd Premolar", type: "premolar", jaw: "lower" },
  "36": { nameTr: "Sol Alt 1. Azı", nameEn: "Lower Left 1st Molar", type: "molar", jaw: "lower" },
  "37": { nameTr: "Sol Alt 2. Azı", nameEn: "Lower Left 2nd Molar", type: "molar", jaw: "lower" },
  "38": { nameTr: "Sol Alt 3. Azı (20 Yaş)", nameEn: "Lower Left 3rd Molar", type: "molar", jaw: "lower" },
};

interface FdiOdontogramProps {
  conditions: Record<string, ToothCondition>;
  selectedTeeth: string[];
  onToggleTooth: (toothNumber: string, multiSelect?: boolean) => void;
  activeTreatments?: Record<string, string[]>;
  readonly?: boolean;
  className?: string;
}

export function FdiOdontogram({
  conditions,
  selectedTeeth,
  onToggleTooth,
  activeTreatments = {},
  readonly = false,
  className,
}: FdiOdontogramProps) {
  const selectedSet = useMemo(() => new Set(selectedTeeth), [selectedTeeth]);

  return (
    <div
      className={
        className ||
        "w-full select-none rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all"
      }
    >
      {/* Upper Jaw Arch Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-slate-900"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Üst Çene (Maksilla)
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-400">
            <span>Sağ (Q1)</span>
            <span className="text-slate-200">|</span>
            <span>Sol (Q2)</span>
          </div>
        </div>

        {/* Upper teeth grid */}
        <div className="grid grid-cols-16 gap-1 md:gap-1.5 items-end justify-items-center">
          {UPPER_TEETH_FDI.map((tooth) => {
            const isSelected = selectedSet.has(tooth);
            const condition = conditions[tooth] || "intact";
            const treatments = activeTreatments[tooth] || [];
            const meta = TOOTH_METADATA[tooth];

            return (
              <div
                key={tooth}
                onClick={() => !readonly && onToggleTooth(tooth)}
                className={`group relative flex flex-col items-center justify-end rounded-xl px-1 py-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-slate-900/10 ring-2 ring-slate-800 shadow-xs scale-105 z-10"
                    : "hover:bg-slate-50 hover:shadow-2xs"
                }`}
                title={`${tooth}: ${meta?.nameTr || ""} (${condition})`}
              >
                {/* Tooth Visual SVG representation (Upper jaw - roots point up) */}
                <div className="relative h-16 w-6 sm:w-8 flex items-center justify-center">
                  <AnatomicalToothSvg
                    fdi={tooth}
                    jaw="upper"
                    type={meta?.type || "molar"}
                    condition={condition}
                    isSelected={isSelected}
                    hasTreatments={treatments.length > 0}
                  />
                </div>

                {/* Tooth Number */}
                <span
                  className={`mt-1 text-[11px] font-bold transition ${
                    isSelected
                      ? "text-slate-950 font-black"
                      : "text-slate-600 group-hover:text-slate-900"
                  }`}
                >
                  {tooth}
                </span>

                {/* Condition Indicator dot */}
                <span
                  className={`mt-0.5 size-1.5 rounded-full transition-colors ${
                    condition === "missing"
                      ? "bg-rose-500"
                      : condition === "filled"
                      ? "bg-sky-500"
                      : condition === "caries"
                      ? "bg-amber-500"
                      : condition === "root_canal"
                      ? "bg-purple-500"
                      : condition === "implant"
                      ? "bg-teal-500"
                      : condition === "crown"
                      ? "bg-yellow-500"
                      : "bg-emerald-400"
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Midline Occlusal Separator */}
      <div className="relative my-3 flex items-center justify-center">
        <div className="w-full border-t border-dashed border-slate-200"></div>
        <span className="absolute bg-white px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Oklüzal Düzlem
        </span>
      </div>

      {/* Lower Jaw Arch */}
      <div>
        {/* Lower teeth grid */}
        <div className="grid grid-cols-16 gap-1 md:gap-1.5 items-start justify-items-center">
          {LOWER_TEETH_FDI.map((tooth) => {
            const isSelected = selectedSet.has(tooth);
            const condition = conditions[tooth] || "intact";
            const treatments = activeTreatments[tooth] || [];
            const meta = TOOTH_METADATA[tooth];

            return (
              <div
                key={tooth}
                onClick={() => !readonly && onToggleTooth(tooth)}
                className={`group relative flex flex-col items-center justify-start rounded-xl px-1 py-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-slate-900/10 ring-2 ring-slate-800 shadow-xs scale-105 z-10"
                    : "hover:bg-slate-50 hover:shadow-2xs"
                }`}
                title={`${tooth}: ${meta?.nameTr || ""} (${condition})`}
              >
                {/* Condition Indicator dot */}
                <span
                  className={`mb-0.5 size-1.5 rounded-full transition-colors ${
                    condition === "missing"
                      ? "bg-rose-500"
                      : condition === "filled"
                      ? "bg-sky-500"
                      : condition === "caries"
                      ? "bg-amber-500"
                      : condition === "root_canal"
                      ? "bg-purple-500"
                      : condition === "implant"
                      ? "bg-teal-500"
                      : condition === "crown"
                      ? "bg-yellow-500"
                      : "bg-emerald-400"
                  }`}
                />

                {/* Tooth Number */}
                <span
                  className={`mb-1 text-[11px] font-bold transition ${
                    isSelected
                      ? "text-slate-950 font-black"
                      : "text-slate-600 group-hover:text-slate-900"
                  }`}
                >
                  {tooth}
                </span>

                {/* Tooth Visual SVG representation (Lower jaw - roots point down) */}
                <div className="relative h-16 w-6 sm:w-8 flex items-center justify-center">
                  <AnatomicalToothSvg
                    fdi={tooth}
                    jaw="lower"
                    type={meta?.type || "molar"}
                    condition={condition}
                    isSelected={isSelected}
                    hasTreatments={treatments.length > 0}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 mt-2.5">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-slate-900"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Alt Çene (Mandibula)
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-400">
            <span>Sağ (Q4)</span>
            <span className="text-slate-200">|</span>
            <span>Sol (Q3)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Anatomical proportional SVG tooth (viewBox 0 0 38 68)
 */
function AnatomicalToothSvg({
  fdi,
  jaw,
  type,
  condition,
  isSelected,
}: {
  fdi: string;
  jaw: "upper" | "lower";
  type: "incisor" | "canine" | "premolar" | "molar";
  condition: ToothCondition;
  isSelected: boolean;
  hasTreatments?: boolean;
}) {
  const isUpper = jaw === "upper";
  const enamelFill = condition === "missing" ? "#f8fafc" : "#ffffff";
  const enamelStroke = isSelected ? "#2563eb" : "#94a3b8";
  const strokeWidth = isSelected ? "1.6" : "1.2";

  return (
    <svg
      viewBox="0 0 38 68"
      className={`h-full w-full transition-transform duration-150 ${
        condition === "missing" ? "opacity-35" : "opacity-100"
      }`}
    >
      <defs>
        <linearGradient id={`implant-metal-${fdi}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="50%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>

        <linearGradient id={`crown-zirconia-${fdi}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#fef9c3" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>
      </defs>

      <g transform={isUpper ? "translate(0, 0)" : "translate(0, 68) scale(1, -1)"}>
        {/* ================= 1. ROOTS (Top half) ================= */}
        {condition === "implant" ? (
          // Titanium Fixture & Abutment Collar
          <g>
            <path
              d="M12,8 L26,8 L24,38 L14,38 Z"
              fill={`url(#implant-metal-${fdi})`}
              stroke="#334155"
              strokeWidth="1.1"
            />
            {/* Thread ribs */}
            <line x1="11" y1="14" x2="27" y2="14" stroke="#1e293b" strokeWidth="1" />
            <line x1="12" y1="20" x2="26" y2="20" stroke="#1e293b" strokeWidth="1" />
            <line x1="13" y1="26" x2="25" y2="26" stroke="#1e293b" strokeWidth="1" />
            <line x1="14" y1="32" x2="24" y2="32" stroke="#1e293b" strokeWidth="1" />
            {/* Abutment collar */}
            <rect x="13" y="38" width="12" height="4" fill="#0d9488" rx="1" />
          </g>
        ) : type === "molar" ? (
          // Molar Multi-Roots
          <g>
            {/* Mesial root */}
            <path
              d="M9,38 C7,24 7,12 11,4 C14,14 15,26 16,38 Z"
              fill={enamelFill}
              stroke={enamelStroke}
              strokeWidth={strokeWidth}
            />
            {/* Distal root */}
            <path
              d="M22,38 C23,26 24,14 27,4 C31,12 31,24 29,38 Z"
              fill={enamelFill}
              stroke={enamelStroke}
              strokeWidth={strokeWidth}
            />
            {/* Upper palatal root */}
            {isUpper && (
              <path
                d="M16,35 C17,22 18,10 19,6 C20,10 21,22 22,35 Z"
                fill={enamelFill}
                stroke={enamelStroke}
                strokeWidth="0.8"
              />
            )}
            {/* Root canal therapy lines */}
            {condition === "root_canal" && (
              <g stroke="#ec4899" strokeWidth="1.5" strokeLinecap="round">
                <line x1="11" y1="8" x2="13" y2="34" />
                <line x1="27" y1="8" x2="25" y2="34" />
              </g>
            )}
          </g>
        ) : type === "premolar" ? (
          // Premolar Roots
          <g>
            <path
              d="M12,38 C10,26 12,14 15,5 C17,14 18,26 18,38 Z"
              fill={enamelFill}
              stroke={enamelStroke}
              strokeWidth={strokeWidth}
            />
            <path
              d="M20,38 C20,26 21,14 23,5 C26,14 28,26 26,38 Z"
              fill={enamelFill}
              stroke={enamelStroke}
              strokeWidth={strokeWidth}
            />
            {condition === "root_canal" && (
              <line x1="19" y1="8" x2="19" y2="36" stroke="#ec4899" strokeWidth="1.5" strokeLinecap="round" />
            )}
          </g>
        ) : (
          // Incisors & Canine Single Robust Root
          <g>
            <path
              d={
                type === "canine"
                  ? "M11,38 C10,24 15,10 19,2 C23,10 28,24 27,38 Z"
                  : "M12,38 C11,25 15,12 19,4 C23,12 27,25 26,38 Z"
              }
              fill={enamelFill}
              stroke={enamelStroke}
              strokeWidth={strokeWidth}
            />
            {condition === "root_canal" && (
              <line x1="19" y1="6" x2="19" y2="36" stroke="#ec4899" strokeWidth="1.5" strokeLinecap="round" />
            )}
          </g>
        )}

        {/* ================= 2. CROWNS (Bottom half) ================= */}
        {condition === "crown" ? (
          // Monolithic Zirconia Crown Cap
          <path
            d="M6,39 C6,37 32,37 32,39 C33,48 33,56 31,64 C25,67 13,67 7,64 C5,56 5,48 6,39 Z"
            fill={`url(#crown-zirconia-${fdi})`}
            stroke="#ca8a04"
            strokeWidth="1.4"
          />
        ) : type === "molar" ? (
          // Broad anatomical Molar Crown
          <g>
            <path
              d="M6,38 C5,47 5,57 8,64 C13,67 25,67 30,64 C33,57 33,47 32,38 C26,37 12,37 6,38 Z"
              fill={enamelFill}
              stroke={enamelStroke}
              strokeWidth={strokeWidth}
            />
            {/* Occlusal fissure anatomy */}
            <path d="M12,48 Q19,53 26,48" fill="none" stroke="#cbd5e1" strokeWidth="0.8" />
            <path d="M19,40 L19,61" fill="none" stroke="#cbd5e1" strokeWidth="0.8" />
          </g>
        ) : type === "premolar" ? (
          // Premolar Bicuspid Crown
          <g>
            <path
              d="M8,38 C7,47 7,56 10,63 C14,66 24,66 28,63 C31,56 31,47 30,38 C24,37 14,37 8,38 Z"
              fill={enamelFill}
              stroke={enamelStroke}
              strokeWidth={strokeWidth}
            />
            <path d="M13,50 Q19,54 25,50" fill="none" stroke="#cbd5e1" strokeWidth="0.8" />
          </g>
        ) : type === "canine" ? (
          // Canine Cuspid Point
          <path
            d="M9,38 C8,47 9,56 12,63 C15,66 19,67 23,65 C26,62 30,56 29,38 C23,37 15,37 9,38 Z"
            fill={enamelFill}
            stroke={enamelStroke}
            strokeWidth={strokeWidth}
          />
        ) : (
          // Incisor Shovel-edge Crown
          <path
            d="M9,38 C8,46 8,55 9,64 C14,66 24,66 29,64 C30,55 30,46 29,38 C23,37 15,37 9,38 Z"
            fill={enamelFill}
            stroke={enamelStroke}
            strokeWidth={strokeWidth}
          />
        )}

        {/* ================= 3. PATHOLOGY OVERLAYS ================= */}
        {/* Composite / Amalgam Filling */}
        {condition === "filled" && (
          <ellipse
            cx="19"
            cy="50"
            rx="6"
            ry="4.5"
            fill="#38bdf8"
            stroke="#0284c7"
            strokeWidth="1"
          />
        )}

        {/* Caries Decay */}
        {condition === "caries" && (
          <g>
            <circle cx="20" cy="50" r="5" fill="#d97706" />
            <circle cx="19" cy="49" r="2.8" fill="#78350f" />
          </g>
        )}

        {/* Bridge Connector Bar */}
        {condition === "bridge" && (
          <rect
            x="0"
            y="46"
            width="38"
            height="5"
            fill="#818cf8"
            opacity="0.9"
            rx="2"
          />
        )}

        {/* Missing Tooth Slash Mark */}
        {condition === "missing" && (
          <g stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round">
            <line x1="8" y1="12" x2="30" y2="58" />
            <line x1="30" y1="12" x2="8" y2="58" />
          </g>
        )}
      </g>
    </svg>
  );
}
