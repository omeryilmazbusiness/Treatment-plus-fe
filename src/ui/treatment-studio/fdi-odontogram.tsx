"use client";

import React, { useCallback, useEffect, useMemo, useRef } from "react";
import type { ToothCondition } from "./types";

export const UPPER_TEETH_FDI = [
  "18", "17", "16", "15", "14", "13", "12", "11",
  "21", "22", "23", "24", "25", "26", "27", "28",
] as const;

export const LOWER_TEETH_FDI = [
  "48", "47", "46", "45", "44", "43", "42", "41",
  "31", "32", "33", "34", "35", "36", "37", "38",
] as const;

export const TOOTH_METADATA: Record<
  string,
  {
    nameTr: string;
    nameEn: string;
    type: "incisor" | "canine" | "premolar" | "molar";
    jaw: "upper" | "lower";
  }
> = {
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

const CONDITION_DOT_CLASS: Record<ToothCondition, string> = {
  intact: "bg-emerald-400",
  missing: "bg-rose-500 ring-2 ring-rose-200",
  filled: "bg-sky-500 ring-2 ring-sky-200",
  caries: "bg-amber-600 ring-2 ring-amber-200",
  root_canal: "bg-purple-500 ring-2 ring-purple-200",
  implant: "bg-teal-500 ring-2 ring-teal-200",
  crown: "bg-amber-400 ring-2 ring-amber-200",
  bridge: "bg-indigo-500 ring-2 ring-indigo-200",
};

const CONDITION_LABELS_TR: Record<ToothCondition, string> = {
  intact: "Sağlam",
  missing: "Eksik Diş",
  filled: "Dolgulu",
  caries: "Çürük",
  root_canal: "Kanal Tedavili",
  implant: "İmplant",
  crown: "Kuron",
  bridge: "Köprü",
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

  // Drag-to-select (paint selection) state refs
  const isDraggingRef = useRef(false);
  const dragModeRef = useRef<"select" | "deselect" | "pending-selected" | null>(null);
  const pendingStartToothRef = useRef<string | null>(null);
  const visitedTeethRef = useRef<Set<string>>(new Set());
  const selectedSetRef = useRef<Set<string>>(selectedSet);

  useEffect(() => {
    selectedSetRef.current = new Set(selectedTeeth);
  }, [selectedTeeth]);

  const processDragOverTooth = useCallback(
    (tooth: string) => {
      if (readonly || !isDraggingRef.current) return;
      if (visitedTeethRef.current.has(tooth)) return;
      visitedTeethRef.current.add(tooth);

      if (dragModeRef.current === "pending-selected") {
        const isTargetSelected = selectedSetRef.current.has(tooth);
        if (!isTargetSelected) {
          // Started on a selected tooth and dragged onto an unselected tooth -> select mode
          dragModeRef.current = "select";
          pendingStartToothRef.current = null;
        } else {
          // Started on a selected tooth and dragged onto another selected tooth -> deselect mode
          dragModeRef.current = "deselect";
          if (pendingStartToothRef.current) {
            selectedSetRef.current.delete(pendingStartToothRef.current);
            onToggleTooth(pendingStartToothRef.current, true);
            pendingStartToothRef.current = null;
          }
        }
      }

      if (dragModeRef.current === "select" && !selectedSetRef.current.has(tooth)) {
        selectedSetRef.current.add(tooth);
        onToggleTooth(tooth, true);
      } else if (dragModeRef.current === "deselect" && selectedSetRef.current.has(tooth)) {
        selectedSetRef.current.delete(tooth);
        onToggleTooth(tooth, true);
      }
    },
    [readonly, onToggleTooth]
  );

  const handleToothPointerDown = useCallback(
    (tooth: string, e: React.PointerEvent) => {
      if (readonly || e.button !== 0) return;
      e.preventDefault();
      isDraggingRef.current = true;
      visitedTeethRef.current.clear();
      visitedTeethRef.current.add(tooth);

      if (!selectedSetRef.current.has(tooth)) {
        dragModeRef.current = "select";
        pendingStartToothRef.current = null;
        selectedSetRef.current.add(tooth);
        onToggleTooth(tooth, true);
      } else {
        dragModeRef.current = "pending-selected";
        pendingStartToothRef.current = tooth;
      }
    },
    [readonly, onToggleTooth]
  );

  const handleContainerPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (readonly || e.button !== 0) return;
      const target = (e.target as HTMLElement | null)?.closest("[data-tooth-fdi]");
      if (!target) {
        isDraggingRef.current = true;
        dragModeRef.current = "select";
        pendingStartToothRef.current = null;
        visitedTeethRef.current.clear();
      }
    },
    [readonly]
  );

  const handleContainerPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (readonly || !isDraggingRef.current) return;
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const toothEl = el?.closest("[data-tooth-fdi]") as HTMLElement | null;
      const tooth = toothEl?.dataset.toothFdi;
      if (tooth) {
        processDragOverTooth(tooth);
      }
    },
    [readonly, processDragOverTooth]
  );

  useEffect(() => {
    const handleGlobalPointerUp = () => {
      if (!isDraggingRef.current) return;
      if (dragModeRef.current === "pending-selected" && pendingStartToothRef.current) {
        const tooth = pendingStartToothRef.current;
        selectedSetRef.current.delete(tooth);
        onToggleTooth(tooth, false);
      }
      isDraggingRef.current = false;
      dragModeRef.current = null;
      pendingStartToothRef.current = null;
      visitedTeethRef.current.clear();
    };

    window.addEventListener("pointerup", handleGlobalPointerUp);
    window.addEventListener("pointercancel", handleGlobalPointerUp);
    return () => {
      window.removeEventListener("pointerup", handleGlobalPointerUp);
      window.removeEventListener("pointercancel", handleGlobalPointerUp);
    };
  }, [onToggleTooth]);

  return (
    <div
      onPointerDown={handleContainerPointerDown}
      onPointerMove={handleContainerPointerMove}
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
        <div className="grid grid-cols-16 gap-0.5 sm:gap-1 items-end justify-items-center">
          {UPPER_TEETH_FDI.map((tooth, idx) => {
            const isSelected = selectedSet.has(tooth);
            const condition = conditions[tooth] || "intact";
            const prevTooth = idx > 0 ? UPPER_TEETH_FDI[idx - 1] : undefined;
            const nextTooth = idx < UPPER_TEETH_FDI.length - 1 ? UPPER_TEETH_FDI[idx + 1] : undefined;
            const connectLeft =
              condition === "bridge" &&
              prevTooth !== undefined &&
              (conditions[prevTooth] === "bridge" ||
                conditions[prevTooth] === "crown" ||
                conditions[prevTooth] === "implant");
            const connectRight =
              condition === "bridge" &&
              nextTooth !== undefined &&
              (conditions[nextTooth] === "bridge" ||
                conditions[nextTooth] === "crown" ||
                conditions[nextTooth] === "implant");

            const treatments = activeTreatments[tooth] || [];
            const meta = TOOTH_METADATA[tooth];

            return (
              <div
                key={tooth}
                data-tooth-fdi={tooth}
                onPointerDown={(e) => handleToothPointerDown(tooth, e)}
                onPointerEnter={() => processDragOverTooth(tooth)}
                className={`group relative flex flex-col items-center justify-end rounded-xl px-0.5 py-1.5 transition-all w-full touch-none ${
                  readonly ? "cursor-default" : "cursor-pointer"
                } ${
                  isSelected
                    ? "bg-slate-900/10 ring-2 ring-slate-800 shadow-xs scale-[1.04] z-10"
                    : !readonly
                    ? "hover:bg-slate-100/70 hover:shadow-2xs"
                    : ""
                }`}
                title={`#${tooth} ${meta?.nameTr || ""} • ${CONDITION_LABELS_TR[condition]}`}
              >
                {/* Tooth Visual SVG representation (Upper jaw - roots point up) */}
                <div className="relative h-20 w-full max-w-[38px] flex items-center justify-center">
                  <AnatomicalToothSvg
                    fdi={tooth}
                    jaw="upper"
                    type={meta?.type || "molar"}
                    condition={condition}
                    isSelected={isSelected}
                    hasTreatments={treatments.length > 0}
                    connectLeft={connectLeft}
                    connectRight={connectRight}
                  />
                </div>

                {/* Tooth Number */}
                <span
                  className={`mt-1 text-[11px] font-bold transition ${
                    isSelected
                      ? "text-slate-950 font-black"
                      : condition !== "intact"
                      ? "text-slate-900"
                      : "text-slate-600 group-hover:text-slate-900"
                  }`}
                >
                  {tooth}
                </span>

                {/* Condition Indicator dot */}
                <span
                  className={`mt-0.5 size-1.5 rounded-full transition-all ${CONDITION_DOT_CLASS[condition]}`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Midline Occlusal Separator */}
      <div className="relative my-3 flex items-center justify-center">
        <div className="w-full border-t border-dashed border-slate-200"></div>
        <span className="absolute bg-slate-50/90 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 rounded-full">
          Oklüzal Düzlem
        </span>
      </div>

      {/* Lower Jaw Arch */}
      <div>
        {/* Lower teeth grid */}
        <div className="grid grid-cols-16 gap-0.5 sm:gap-1 items-start justify-items-center">
          {LOWER_TEETH_FDI.map((tooth, idx) => {
            const isSelected = selectedSet.has(tooth);
            const condition = conditions[tooth] || "intact";
            const prevTooth = idx > 0 ? LOWER_TEETH_FDI[idx - 1] : undefined;
            const nextTooth = idx < LOWER_TEETH_FDI.length - 1 ? LOWER_TEETH_FDI[idx + 1] : undefined;
            const connectLeft =
              condition === "bridge" &&
              prevTooth !== undefined &&
              (conditions[prevTooth] === "bridge" ||
                conditions[prevTooth] === "crown" ||
                conditions[prevTooth] === "implant");
            const connectRight =
              condition === "bridge" &&
              nextTooth !== undefined &&
              (conditions[nextTooth] === "bridge" ||
                conditions[nextTooth] === "crown" ||
                conditions[nextTooth] === "implant");

            const treatments = activeTreatments[tooth] || [];
            const meta = TOOTH_METADATA[tooth];

            return (
              <div
                key={tooth}
                data-tooth-fdi={tooth}
                onPointerDown={(e) => handleToothPointerDown(tooth, e)}
                onPointerEnter={() => processDragOverTooth(tooth)}
                className={`group relative flex flex-col items-center justify-start rounded-xl px-0.5 py-1.5 transition-all w-full touch-none ${
                  readonly ? "cursor-default" : "cursor-pointer"
                } ${
                  isSelected
                    ? "bg-slate-900/10 ring-2 ring-slate-800 shadow-xs scale-[1.04] z-10"
                    : !readonly
                    ? "hover:bg-slate-100/70 hover:shadow-2xs"
                    : ""
                }`}
                title={`#${tooth} ${meta?.nameTr || ""} • ${CONDITION_LABELS_TR[condition]}`}
              >
                {/* Condition Indicator dot */}
                <span
                  className={`mb-0.5 size-1.5 rounded-full transition-all ${CONDITION_DOT_CLASS[condition]}`}
                />

                {/* Tooth Number */}
                <span
                  className={`mb-1 text-[11px] font-bold transition ${
                    isSelected
                      ? "text-slate-950 font-black"
                      : condition !== "intact"
                      ? "text-slate-900"
                      : "text-slate-600 group-hover:text-slate-900"
                  }`}
                >
                  {tooth}
                </span>

                {/* Tooth Visual SVG representation (Lower jaw - roots point down) */}
                <div className="relative h-20 w-full max-w-[38px] flex items-center justify-center">
                  <AnatomicalToothSvg
                    fdi={tooth}
                    jaw="lower"
                    type={meta?.type || "molar"}
                    condition={condition}
                    isSelected={isSelected}
                    hasTreatments={treatments.length > 0}
                    connectLeft={connectLeft}
                    connectRight={connectRight}
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
 * High-Detail Clinical Anatomical Tooth SVG (viewBox 0 0 44 78)
 * Renders anatomically accurate root cementum, curved CEJ, 3D enamel shading,
 * occlusal/incisal morphology, and realistic clinical pathology/restoration models.
 */
export function AnatomicalToothSvg({
  fdi,
  jaw,
  type,
  condition,
  isSelected,
  hasTreatments = false,
  connectLeft = false,
  connectRight = false,
}: {
  fdi: string;
  jaw: "upper" | "lower";
  type: "incisor" | "canine" | "premolar" | "molar";
  condition: ToothCondition;
  isSelected: boolean;
  hasTreatments?: boolean;
  connectLeft?: boolean;
  connectRight?: boolean;
}) {
  const isUpper = jaw === "upper";
  const quadrant = fdi.charAt(0);
  const toothIndex = parseInt(fdi.charAt(1), 10) || 1;
  // Q1 (1x) and Q4 (4x) are patient's right side (left side of screen).
  // Q2 (2x) and Q3 (3x) are patient's left side (right side of screen).
  // Mirroring horizontally across the midline makes mesial/distal curvature anatomically accurate.
  const isLeftScreenSide = quadrant === "1" || quadrant === "4";

  // Subtle anatomical width scaling per tooth number (e.g. central vs lateral incisor, lower incisors narrower)
  const widthScale =
    type === "incisor"
      ? !isUpper
        ? 0.78 // Mandibular incisors are slender
        : toothIndex === 1
        ? 0.98 // Maxillary central incisor is broad
        : 0.84 // Maxillary lateral incisor
      : type === "canine"
      ? 0.92
      : type === "premolar"
      ? 0.94
      : toothIndex === 6
      ? 1.04 // 1st molar is broadest
      : 0.98;

  const uid = `${fdi}-${condition}`;

  // Crown & root stroke colors
  const rootStroke = isSelected ? "#1d4ed8" : "#a68b67";
  const enamelStroke = isSelected ? "#1d4ed8" : "#64748b";
  const crownProstheticStroke =
    condition === "crown"
      ? "#b45309"
      : condition === "bridge"
      ? "#4338ca"
      : condition === "implant"
      ? "#0f766e"
      : enamelStroke;

  // Determine crown geometry path (in local coordinates where Y=0..42 is Root, Y=40..72 is Crown)
  const getCrownOutlinePath = () => {
    if (type === "molar") {
      return "M 7,41 C 14,38.5 30,38.5 37,41 C 39.5,48 40,57 37.5,65.5 C 35.5,70.5 31,72.5 27.5,71 C 24.5,69.8 22,68.8 19.5,70.8 C 16,72.5 10,71 7,65.5 C 4,57 4.5,48 7,41 Z";
    }
    if (type === "premolar") {
      return "M 9.5,41 C 15,38.5 29,38.5 34.5,41 C 37,48 37,57 34,65 C 31.5,70 26.5,72 22,70.2 C 17.5,72 12.5,70 10,65 C 7,57 7,48 9.5,41 Z";
    }
    if (type === "canine") {
      return "M 10.5,40.5 C 16,38 28,38 33.5,40.5 C 36,48 35.5,58 30.5,65.5 C 26.5,70.5 23.8,73.5 22,74 C 20.2,73.5 17.5,70.5 13.5,65.5 C 8.5,58 8,48 10.5,40.5 Z";
    }
    // Incisor
    return "M 10,41 C 15.5,38.5 28.5,38.5 34,41 C 35.5,49 35.8,60 34,68.5 C 32.5,71.5 27,72 22,72 C 17,72 11.5,71.5 10,68.5 C 8.2,60 8.5,49 10,41 Z";
  };

  const crownPath = getCrownOutlinePath();

  // Horizontal transform for anatomical mesial/distal symmetry + width scaling around X=22
  const anatomicalTransform = [
    isUpper ? "translate(0, 0)" : "translate(0, 78) scale(1, -1)",
    `translate(22, 0) scale(${isLeftScreenSide ? widthScale : -widthScale}, 1) translate(-22, 0)`,
  ].join(" ");

  const isProstheticCrown = condition === "crown" || condition === "bridge";

  return (
    <svg
      viewBox="0 0 44 78"
      className="h-full w-full overflow-visible transition-transform duration-200"
    >
      <defs>
        {/* 1. Natural Root Dentin / Cementum 3D Gradient */}
        <linearGradient id={`root-dentin-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#d9c39e" />
          <stop offset="30%" stopColor="#f3e8d2" />
          <stop offset="65%" stopColor="#eadbc0" />
          <stop offset="100%" stopColor="#bfa57d" />
        </linearGradient>

        {/* 2. Natural Enamel 3D Pearl Gradient */}
        <linearGradient id={`enamel-body-${uid}`} x1="15%" y1="0%" x2="85%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor="#f8fafc" />
          <stop offset="80%" stopColor="#eef2f6" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>

        {/* Cervical Warmth near CEJ */}
        <linearGradient id={`cej-warmth-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ebd9b4" stopOpacity="0.65" />
          <stop offset="45%" stopColor="#fef3c7" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        {/* 3. Zirconia / Ceramic Crown Gradient (Warm Golden-Ceramic Luster) */}
        <linearGradient id={`prosthetic-crown-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="28%" stopColor="#fde68a" />
          <stop offset="65%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>

        {/* 4. Bridge Ceramic-Indigo Prosthetic Gradient */}
        <linearGradient id={`bridge-crown-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#eef2ff" />
          <stop offset="32%" stopColor="#c7d2fe" />
          <stop offset="70%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#4338ca" />
        </linearGradient>

        {/* 5. Titanium Implant Fixture Metallic Gradient */}
        <linearGradient id={`titanium-fixture-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="22%" stopColor="#94a3b8" />
          <stop offset="45%" stopColor="#f1f5f9" />
          <stop offset="70%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>

        {/* Titanium Ti-Base Gold/Teal Anodized Abutment Gradient */}
        <linearGradient id={`tibase-abutment-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0f766e" />
          <stop offset="45%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#115e59" />
        </linearGradient>

        {/* 6. Composite / Amalgam Restoration Gradient */}
        <radialGradient id={`filling-comp-${uid}`} cx="38%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#bae6fd" />
          <stop offset="45%" stopColor="#38bdf8" />
          <stop offset="85%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </radialGradient>

        {/* 7. Carious Lesion (Multi-Zone Decay) Gradient */}
        <radialGradient id={`caries-lesion-${uid}`} cx="48%" cy="48%" r="55%">
          <stop offset="0%" stopColor="#1c0a00" />
          <stop offset="42%" stopColor="#451a03" />
          <stop offset="72%" stopColor="#92400e" />
          <stop offset="92%" stopColor="#d97706" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>

        {/* 8. Endodontic Gutta-Percha Gradient */}
        <linearGradient id={`endo-gutta-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#be123c" />
          <stop offset="50%" stopColor="#fb7185" />
          <stop offset="100%" stopColor="#9f1239" />
        </linearGradient>
      </defs>

      {/* ===================================================================== */}
      {/* INTERPROXIMAL BRIDGE CONNECTORS (Rendered in screen orientation)      */}
      {/* ===================================================================== */}
      {condition === "bridge" && (
        <g
          transform={isUpper ? "translate(0, 0)" : "translate(0, 78) scale(1, -1)"}
        >
          {/* Left interproximal connector */}
          <path
            d={
              connectLeft
                ? "M -6,49 C -1,49.5 4,50 9,50 L 9,59 C 4,59 -1,59.5 -6,60 Z"
                : "M 1,50.5 C 4,50.5 7,51 9,51 L 9,58 C 7,58 4,58.5 1,58.5 C -0.5,58.5 -0.5,50.5 1,50.5 Z"
            }
            fill={`url(#bridge-crown-${uid})`}
            stroke="#3730a3"
            strokeWidth="1"
          />
          {/* Right interproximal connector */}
          <path
            d={
              connectRight
                ? "M 35,50 C 40,50 45,49.5 50,49 L 50,60 C 45,59.5 40,59 35,59 Z"
                : "M 35,51 C 37,51 40,50.5 43,50.5 C 44.5,50.5 44.5,58.5 43,58.5 C 40,58.5 37,58 35,58 Z"
            }
            fill={`url(#bridge-crown-${uid})`}
            stroke="#3730a3"
            strokeWidth="1"
          />
        </g>
      )}

      {/* ===================================================================== */}
      {/* MAIN ANATOMICAL TOOTH GROUP                                           */}
      {/* ===================================================================== */}
      <g transform={anatomicalTransform}>
        {/* ----------------------------------------------------------------- */}
        {/* CASE A: MISSING TOOTH (Alveolar Socket Silhouette + Extraction X) */}
        {/* ----------------------------------------------------------------- */}
        {condition === "missing" ? (
          <g>
            {/* Ghosted Alveolar Socket & Resorbed Root Outline */}
            <g opacity="0.38" stroke="#94a3b8" strokeDasharray="2.2 1.8" fill="#f1f5f9">
              {type === "molar" ? (
                <path
                  d="M 10,41 C 8,27 8,14 12,6 C 15,15 16,27 17,37 C 19,24 20,12 22,8 C 24,12 25,24 27,37 C 28,27 29,15 32,6 C 36,14 36,27 34,41 Z"
                  strokeWidth="1.1"
                />
              ) : type === "premolar" ? (
                <path
                  d="M 13,41 C 11,27 13,14 16,6 C 18,15 19,26 20,37 C 21,26 23,15 26,6 C 29,14 31,27 29,41 Z"
                  strokeWidth="1.1"
                />
              ) : (
                <path
                  d="M 13,41 C 12,26 16,11 22,4 C 28,11 32,26 31,41 Z"
                  strokeWidth="1.1"
                />
              )}
              <path d={crownPath} strokeWidth="1.2" />
            </g>

            {/* Alveolar Ridge Healing Bone Trabeculae Lines */}
            <path
              d="M 8,39 Q 22,44 36,39"
              fill="none"
              stroke="#fda4af"
              strokeWidth="1.3"
              strokeDasharray="2 2"
            />

            {/* Clinical Extraction Cross Badge */}
            <g stroke="#e11d48" strokeLinecap="round">
              <line x1="11" y1="16" x2="33" y2="62" strokeWidth="2.4" opacity="0.85" />
              <line x1="33" y1="16" x2="11" y2="62" strokeWidth="2.4" opacity="0.85" />
            </g>
          </g>
        ) : (
          <>
            {/* ------------------------------------------------------------- */}
            {/* 1. ROOTS & ENDODONTICS / IMPLANT FIXTURE (Y = 2..42)          */}
            {/* ------------------------------------------------------------- */}
            {condition === "implant" ? (
              <g>
                {/* Peri-implant Alveolar Bone Shadow */}
                <ellipse cx="22" cy="23" rx="9.5" ry="17" fill="#cbd5e1" opacity="0.22" />

                {/* Tapered Titanium Implant Body */}
                <path
                  d="M 16.5,7 C 19,4.5 25,4.5 27.5,7 L 29.5,35.5 L 14.5,35.5 Z"
                  fill={`url(#titanium-fixture-${uid})`}
                  stroke="#1e293b"
                  strokeWidth="1.1"
                  strokeLinejoin="round"
                />

                {/* Helical Machined Thread Ribs (Angled 3D Threads) */}
                {[10, 14, 18, 22, 26, 30, 33.5].map((y, idx) => {
                  const halfW = 5.4 + idx * 0.35;
                  return (
                    <g key={y}>
                      <path
                        d={`M ${22 - halfW - 1.1},${y + 0.8} L ${22 + halfW + 1.1},${y - 0.5}`}
                        stroke="#1e293b"
                        strokeWidth="1.35"
                        strokeLinecap="round"
                      />
                      <path
                        d={`M ${22 - halfW - 0.8},${y + 0.3} L ${22 + halfW + 0.8},${y - 1.0}`}
                        stroke="#f8fafc"
                        strokeWidth="0.65"
                        strokeLinecap="round"
                        opacity="0.8"
                      />
                    </g>
                  );
                })}

                {/* Apical Anti-Rotation Self-Tapping Flute */}
                <path
                  d="M 20,7.5 L 21,16 L 23,16 L 24,7.5 Z"
                  fill="#334155"
                  opacity="0.55"
                />

                {/* Anodized Ti-Base Abutment & Emergence Collar */}
                <path
                  d="M 15.5,35.5 L 28.5,35.5 L 30.5,41 L 13.5,41 Z"
                  fill={`url(#tibase-abutment-${uid})`}
                  stroke="#0f766e"
                  strokeWidth="1"
                />
                {/* Machined Platform Ring */}
                <line x1="14" y1="38.2" x2="30" y2="38.2" stroke="#ccfbf1" strokeWidth="0.8" />
              </g>
            ) : type === "molar" ? (
              <g>
                {/* Upper Molar Palatal (3rd) Root in background */}
                {isUpper && (
                  <path
                    d="M 16.5,39 C 17,24 18.5,11 21.5,4.5 C 22.8,3.2 24,4.5 24.5,6.5 C 26,13 26.8,25 27.5,39 Z"
                    fill="#d5be97"
                    stroke={rootStroke}
                    strokeWidth="1"
                  />
                )}

                {/* Mesial Root (curved slightly distally) */}
                <path
                  d="M 8.5,41.5 C 7,28 7.5,15 11,6 C 11.8,4 13.5,4.2 14,6.5 C 15.5,14 16.5,25 18.5,37 C 19.8,39 14,41.5 8.5,41.5 Z"
                  fill={`url(#root-dentin-${uid})`}
                  stroke={rootStroke}
                  strokeWidth="1.15"
                  strokeLinejoin="round"
                />

                {/* Distal Root */}
                <path
                  d="M 24.5,37 C 26.5,25 27.5,14 29,6.5 C 29.5,4.2 31.2,4 32,6 C 35.5,15 36,28 34.5,41.5 C 29,41.5 23.5,39 24.5,37 Z"
                  fill={`url(#root-dentin-${uid})`}
                  stroke={rootStroke}
                  strokeWidth="1.15"
                  strokeLinejoin="round"
                />

                {/* Root Furcation Shadow */}
                <path
                  d="M 17.5,38 Q 21.5,31 25.5,38"
                  fill="none"
                  stroke="#9c8259"
                  strokeWidth="1.1"
                  opacity="0.7"
                />

                {/* Root Canal Obturation (Endo) */}
                {condition === "root_canal" && (
                  <g>
                    {/* Translucent Pulp Chamber & Canal Halo */}
                    <path
                      d="M 12.2,7.5 C 13.5,17 15,28 16.5,41 L 27,41 C 28.5,28 29.5,17 30.8,7.5"
                      fill="none"
                      stroke="#fda4af"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      opacity="0.35"
                    />
                    {/* Mesial Gutta-Percha Cone */}
                    <path
                      d="M 12.2,6.5 C 13.2,17 14.5,28 16.2,42 L 18.5,42 C 16.5,28 14.5,17 13,6.5 Z"
                      fill={`url(#endo-gutta-${uid})`}
                    />
                    {/* Distal Gutta-Percha Cone */}
                    <path
                      d="M 30.5,6.5 C 29,17 27,28 25,42 L 27.3,42 C 29,28 30.2,17 31.3,6.5 Z"
                      fill={`url(#endo-gutta-${uid})`}
                    />
                    {/* Palatal Gutta-Percha Cone (Upper Molar) */}
                    {isUpper && (
                      <path
                        d="M 22.2,6 C 22,17 21.8,28 21.2,41 L 23,41 C 23,28 23.2,17 23,6 Z"
                        fill={`url(#endo-gutta-${uid})`}
                        opacity="0.9"
                      />
                    )}
                    {/* Apical Sealer Puffs */}
                    <circle cx="12.5" cy="6.2" r="1.1" fill="#fb7185" />
                    <circle cx="30.9" cy="6.2" r="1.1" fill="#fb7185" />
                  </g>
                )}
              </g>
            ) : type === "premolar" ? (
              <g>
                {/* Bifid / Double Root Anatomy for Premolars */}
                <path
                  d="M 11,41.5 C 9.8,28 11,15 14.8,6 C 15.6,4.2 17.2,4.5 17.8,6.5 C 19,13 19.8,24 20.8,35 C 21.8,24 22.8,13 24.5,6.5 C 25.2,4.5 26.8,4.2 27.5,6 C 31,15 32.5,28 31.5,41.5 Z"
                  fill={`url(#root-dentin-${uid})`}
                  stroke={rootStroke}
                  strokeWidth="1.15"
                  strokeLinejoin="round"
                />
                {/* Root Concavity / Developmental Groove */}
                <path
                  d="M 21.2,16 L 21.2,37"
                  stroke="#b59a72"
                  strokeWidth="0.9"
                  strokeDasharray="12 2"
                  opacity="0.65"
                />

                {condition === "root_canal" && (
                  <g>
                    <path
                      d="M 16.2,7 C 17.2,18 18.2,29 19,42 L 20.8,42 C 19.8,29 18.2,18 17,7 Z"
                      fill={`url(#endo-gutta-${uid})`}
                    />
                    <path
                      d="M 26,7 C 24.8,18 23.5,29 22.5,42 L 24.3,42 C 25.2,29 26.2,18 26.8,7 Z"
                      fill={`url(#endo-gutta-${uid})`}
                    />
                    <circle cx="16.6" cy="6.6" r="1" fill="#fb7185" />
                    <circle cx="26.4" cy="6.6" r="1" fill="#fb7185" />
                  </g>
                )}
              </g>
            ) : (
              // Canine & Incisor Single Conical Root with slight distal apical curvature
              <g>
                <path
                  d={
                    type === "canine"
                      ? "M 11.5,41.5 C 10.5,27 13.5,12 19.5,3 C 20.8,1.5 22.8,1.8 23.5,3.8 C 28,13 31.5,27 31.5,41.5 Z"
                      : "M 12,41.5 C 11.2,28 14.2,14 19.8,5.5 C 21,3.8 22.8,4 23.6,5.8 C 28,14 30.8,28 30.5,41.5 Z"
                  }
                  fill={`url(#root-dentin-${uid})`}
                  stroke={rootStroke}
                  strokeWidth="1.15"
                  strokeLinejoin="round"
                />
                {/* Subtle Root Highlight */}
                <path
                  d="M 16.5,14 C 15.5,23 15,31 15.5,39"
                  fill="none"
                  stroke="#fbf6ec"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  opacity="0.65"
                />

                {condition === "root_canal" && (
                  <g>
                    {/* Translucent Canal Space */}
                    <path
                      d="M 21.5,5.5 L 19,42 L 24.5,42 Z"
                      fill="#fda4af"
                      opacity="0.3"
                    />
                    {/* Tapered Master Gutta-Percha Cone */}
                    <path
                      d="M 21.1,5.2 L 19.6,42.5 L 23.6,42.5 L 22.2,5.2 Z"
                      fill={`url(#endo-gutta-${uid})`}
                    />
                    <circle cx="21.6" cy="5" r="1.15" fill="#fb7185" />
                  </g>
                )}
              </g>
            )}

            {/* ------------------------------------------------------------- */}
            {/* 2. ANATOMICAL CROWN & SURFACE MORPHOLOGY (Y = 39..74)         */}
            {/* ------------------------------------------------------------- */}
            <g>
              {/* Main Crown Body */}
              <path
                d={crownPath}
                fill={
                  condition === "crown"
                    ? `url(#prosthetic-crown-${uid})`
                    : condition === "bridge"
                    ? `url(#bridge-crown-${uid})`
                    : `url(#enamel-body-${uid})`
                }
                stroke={crownProstheticStroke}
                strokeWidth={isSelected || isProstheticCrown ? "1.5" : "1.2"}
                strokeLinejoin="round"
              />

              {/* Natural Cervical Dentin Warmth & CEJ Curve (Only on natural/implant crowns) */}
              {!isProstheticCrown && (
                <path
                  d={crownPath}
                  fill={`url(#cej-warmth-${uid})`}
                  pointerEvents="none"
                />
              )}

              {/* Prosthetic Chamfer Margin Ring (For Crown, Bridge, Implant) */}
              {(condition === "crown" || condition === "bridge" || condition === "implant") && (
                <path
                  d="M 9,41.5 Q 22,38.2 35,41.5"
                  fill="none"
                  stroke={
                    condition === "crown"
                      ? "#d97706"
                      : condition === "bridge"
                      ? "#4f46e5"
                      : "#0d9488"
                  }
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              )}

              {/* 3D Labial / Buccal Specular Enamel Highlight */}
              <path
                d={
                  type === "molar"
                    ? "M 10.5,45 C 9.5,52 9.8,59 11.5,64"
                    : type === "canine"
                    ? "M 14,44 C 13,52 14.5,60 18,67"
                    : "M 12.5,45 C 12,53 12.2,60 13,66"
                }
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
                opacity={isProstheticCrown ? "0.75" : "0.9"}
              />

              {/* Tooth-Type Specific Occlusal / Lingual Anatomical Grooves */}
              {type === "molar" && (
                <g
                  fill="none"
                  stroke={
                    condition === "crown"
                      ? "#b45309"
                      : condition === "bridge"
                      ? "#4338ca"
                      : "#94a3b8"
                  }
                  strokeLinecap="round"
                  opacity={isProstheticCrown ? "0.55" : "0.75"}
                >
                  {/* Central developmental groove */}
                  <path d="M 11,56 C 16,58 21,54.5 25,57 C 28.5,58.5 31.5,56.5 33.5,55.5" strokeWidth="1.05" />
                  {/* Buccal & lingual developmental grooves */}
                  <path d="M 21.5,45 C 21,51 21.8,57 20,65" strokeWidth="0.95" />
                  <path d="M 27,48 C 26,53 26,57 27.5,63" strokeWidth="0.8" />
                  {/* Cusp ridge highlights */}
                  <path d="M 11,64 Q 15.5,67.5 19.5,66" stroke="#ffffff" strokeWidth="1" opacity="0.7" />
                  <path d="M 23.5,66 Q 28.5,67.5 33,64" stroke="#ffffff" strokeWidth="1" opacity="0.7" />
                </g>
              )}

              {type === "premolar" && (
                <g
                  fill="none"
                  stroke={
                    condition === "crown"
                      ? "#b45309"
                      : condition === "bridge"
                      ? "#4338ca"
                      : "#94a3b8"
                  }
                  strokeLinecap="round"
                  opacity={isProstheticCrown ? "0.55" : "0.75"}
                >
                  {/* Mesial-distal central groove & marginal ridges */}
                  <path d="M 13.5,56.5 Q 22,59.5 30.5,56.5" strokeWidth="1.05" />
                  <path d="M 13.5,54.5 L 15,58.5" strokeWidth="0.85" />
                  <path d="M 30.5,54.5 L 29,58.5" strokeWidth="0.85" />
                  <path d="M 22,47 L 22,63" strokeWidth="0.8" opacity="0.6" />
                </g>
              )}

              {type === "canine" && (
                <g
                  fill="none"
                  stroke={
                    condition === "crown"
                      ? "#b45309"
                      : condition === "bridge"
                      ? "#4338ca"
                      : "#cbd5e1"
                  }
                  strokeLinecap="round"
                  opacity="0.7"
                >
                  {/* Labial ridge & mesial/distal developmental depressions */}
                  <path d="M 22,43 L 22,70" strokeWidth="1" />
                  <path d="M 15,62 Q 22,69 29,62" stroke="#ffffff" strokeWidth="1.1" />
                </g>
              )}

              {type === "incisor" && (
                <g
                  fill="none"
                  stroke={
                    condition === "crown"
                      ? "#b45309"
                      : condition === "bridge"
                      ? "#4338ca"
                      : "#cbd5e1"
                  }
                  strokeLinecap="round"
                  opacity="0.7"
                >
                  {/* Developmental lobes & incisal edge translucency */}
                  <path d="M 18.5,47 L 18,66" strokeWidth="0.75" />
                  <path d="M 25.5,47 L 26,66" strokeWidth="0.75" />
                  <path d="M 12.5,68.8 L 31.5,68.8" stroke="#94a3b8" strokeWidth="1.2" opacity="0.35" />
                </g>
              )}
            </g>

            {/* ------------------------------------------------------------- */}
            {/* 3. CLINICAL PATHOLOGY & RESTORATION OVERLAYS                  */}
            {/* ------------------------------------------------------------- */}

            {/* A. ROOT CANAL CORONAL PULP CHAMBER & ACCESS RESTORATION */}
            {condition === "root_canal" && (
              <g>
                {/* Coronal Pulp Chamber Gutta-Percha Base */}
                <path
                  d={
                    type === "molar"
                      ? "M 15,41 L 28,41 L 26.5,51 C 23,52.5 19.5,52.5 16.5,51 Z"
                      : "M 18.5,41 L 25,41 L 24,50 C 22.5,51.5 21,51.5 19.5,50 Z"
                  }
                  fill={`url(#endo-gutta-${uid})`}
                  opacity="0.92"
                />
                {/* Occlusal / Palatal Composite Access Seal */}
                <ellipse
                  cx="22"
                  cy="53.5"
                  rx={type === "molar" ? "5.8" : "4"}
                  ry={type === "molar" ? "3.5" : "2.8"}
                  fill="#c084fc"
                  stroke="#7e22ce"
                  strokeWidth="0.9"
                />
                <ellipse
                  cx="20.5"
                  cy="52.8"
                  rx={type === "molar" ? "2.5" : "1.6"}
                  ry="1.1"
                  fill="#f3e8ff"
                  opacity="0.8"
                />
              </g>
            )}

            {/* B. IMPLANT SCREW-RETAINED ACCESS CHANNEL */}
            {condition === "implant" && (
              <g>
                <circle
                  cx="22"
                  cy="56"
                  r={type === "molar" ? "3.8" : "3"}
                  fill="#ccfbf1"
                  stroke="#0d9488"
                  strokeWidth="1"
                />
                <circle cx="22" cy="56" r="1.4" fill="#0f766e" opacity="0.65" />
              </g>
            )}

            {/* C. ANATOMICAL COMPOSITE / AMALGAM FILLING (DOLGULU) */}
            {condition === "filled" && (
              <g>
                {type === "molar" ? (
                  // Anatomical MOD / Occlusal Fissure Dove-Tail Restoration
                  <path
                    d="M 10.5,53.5 C 13,51.5 16.5,52.5 19,50.5 C 20.5,47.5 23.5,47.5 25,50.5 C 27.5,52.5 31,51.5 33.5,53.5 C 34.5,56 33.5,59.5 30.5,59.5 C 27.5,59.5 26,60.5 24.5,63 C 23,65 20.5,65 19,63 C 17.5,60.5 15.5,59.5 13,59.5 C 10.5,59.5 9.5,56 10.5,53.5 Z"
                    fill={`url(#filling-comp-${uid})`}
                    stroke="#0369a1"
                    strokeWidth="1.1"
                    strokeLinejoin="round"
                  />
                ) : type === "premolar" ? (
                  // Bicuspid Occlusal Isthmus + Dove-Tail Restoration
                  <path
                    d="M 12.5,54 C 14.5,51.5 17.5,53 20,52.5 C 22,52 24,52 25.5,52.5 C 28,53 30,51.5 31.5,54 C 32.8,56.5 31.2,60 28.5,59.5 C 26,59 24,58.8 22,59 C 19.5,58.8 17.5,59 15.5,59.5 C 12.8,60 11.2,56.5 12.5,54 Z"
                    fill={`url(#filling-comp-${uid})`}
                    stroke="#0369a1"
                    strokeWidth="1.1"
                    strokeLinejoin="round"
                  />
                ) : (
                  // Class III / Class IV Proximal-Incisal Restoration on Anterior Teeth
                  <path
                    d="M 10,49 C 14.5,49.5 17.5,52.5 18,56.5 C 18.5,60.5 15.5,64 11,65.5 C 9.2,60 9,54 10,49 Z"
                    fill={`url(#filling-comp-${uid})`}
                    stroke="#0369a1"
                    strokeWidth="1.1"
                    strokeLinejoin="round"
                  />
                )}
                {/* Specular Bevel Luster on Filling */}
                <ellipse
                  cx={type === "molar" || type === "premolar" ? "19.5" : "13.5"}
                  cy={type === "molar" || type === "premolar" ? "55" : "56"}
                  rx={type === "molar" ? "4" : "2.2"}
                  ry="1.4"
                  fill="#e0f2fe"
                  opacity="0.85"
                />
              </g>
            )}

            {/* D. REALISTIC CARIOUS LESION / DECAY CAVITATION (ÇÜRÜK) */}
            {condition === "caries" && (
              <g>
                {/* Demineralized Enamel/Dentin Outer Halo */}
                <ellipse
                  cx={type === "molar" || type === "premolar" ? "22.5" : "15.5"}
                  cy={type === "molar" || type === "premolar" ? "56.5" : "54.5"}
                  rx={type === "molar" ? "10.5" : type === "premolar" ? "8.5" : "6.5"}
                  ry={type === "molar" ? "8.5" : "6.8"}
                  fill={`url(#caries-lesion-${uid})`}
                />

                {/* Irregular Cavitated Dentin Decay Core */}
                {type === "molar" || type === "premolar" ? (
                  <>
                    <path
                      d="M 15.5,54.5 C 16.5,51 20,52 22.5,50 C 25,48.5 28,50.5 29.5,53.5 C 31,56.5 29.5,60.5 26.5,61.5 C 24,62.5 21.5,64 19,62 C 16,60.5 14.5,57.5 15.5,54.5 Z"
                      fill="#78350f"
                      stroke="#451a03"
                      strokeWidth="0.9"
                    />
                    {/* Deep Necrotic Fissure Cavitation Center */}
                    <path
                      d="M 18,55.5 C 19.5,53.5 22,53 24.5,53.8 C 26.8,54.5 27,57.5 25,59 C 23,60.5 20.5,60.2 18.8,58.5 C 17.5,57.2 17.2,56.5 18,55.5 Z"
                      fill="#1c0a00"
                    />
                    {/* Fissure Caries Spread Tracks */}
                    <path
                      d="M 12.5,56 L 17,56 M 27,55.5 L 31.5,54.5 M 22,47.5 L 22,52.5"
                      stroke="#451a03"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                  </>
                ) : (
                  <>
                    {/* Interproximal / Cervical Caries Cavitation on Incisor/Canine */}
                    <path
                      d="M 10,48.5 C 15,49 19,52 19.5,56 C 20,60 16.5,62.5 11,63 C 9.2,58.5 9.2,53 10,48.5 Z"
                      fill="#78350f"
                      stroke="#451a03"
                      strokeWidth="0.9"
                    />
                    <path
                      d="M 10.2,51.5 C 13.5,52 16,53.8 16.2,56.2 C 16.4,58.5 13.8,60.2 10.5,60.5 Z"
                      fill="#1c0a00"
                    />
                  </>
                )}
              </g>
            )}

            {/* E. CROWN & BRIDGE INTERNAL PREPARED DIE / ABUTMENT LINE */}
            {(condition === "crown" || condition === "bridge") && (
              <path
                d={
                  type === "molar"
                    ? "M 13,42 L 15,61 C 19,62.5 25,62.5 29,61 L 31,42"
                    : "M 15,42 L 17.5,62 C 20.5,63.5 23.5,63.5 26.5,62 L 29,42"
                }
                fill="none"
                stroke={condition === "crown" ? "#92400e" : "#312e81"}
                strokeWidth="0.9"
                strokeDasharray="2 1.8"
                opacity="0.45"
              />
            )}
          </>
        )}

        {/* Active Treatment Plan Indicator Ring */}
        {hasTreatments && (
          <circle
            cx="22"
            cy="56"
            r="15"
            fill="none"
            stroke="#10b981"
            strokeWidth="1.5"
            strokeDasharray="3 2"
            opacity="0.7"
          />
        )}
      </g>
    </svg>
  );
}
