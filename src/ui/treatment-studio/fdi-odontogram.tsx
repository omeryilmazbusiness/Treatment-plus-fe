"use client";

import React, { useCallback, useEffect, useMemo, useRef } from "react";
import type { ToothCondition } from "./types";
import {
  AnatomicalToothSvg,
  LOWER_TEETH_FDI,
  TOOTH_METADATA,
  UPPER_TEETH_FDI,
} from "./anatomical-tooth-svg";

export {
  AnatomicalToothSvg,
  LOWER_TEETH_FDI,
  TOOTH_METADATA,
  UPPER_TEETH_FDI,
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
          dragModeRef.current = "select";
          pendingStartToothRef.current = null;
        } else {
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
