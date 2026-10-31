"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Layers,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Sparkles,
} from "lucide-react";
import { ThreeMouthCanvas } from "./three-mouth-canvas";
import type { AnimationTimelineStage, StudioPlanItem, StudioVisit } from "./types";

export const DEFAULT_ANIMATION_STAGES: AnimationTimelineStage[] = [
  {
    id: "stage-ext-upper",
    visitTitle: "1. Seans: Cerrahi & İmplantasyon",
    stageName: "Üst Çene Çekimleri",
    teeth: ["11", "12", "13", "21", "22", "23", "27"],
    actionType: "extraction",
    durationSeconds: 3,
    description: "Enfekte ve restore edilemeyen üst dişlerin atraumatik çekimi.",
  },
  {
    id: "stage-ext-lower",
    visitTitle: "1. Seans: Cerrahi & İmplantasyon",
    stageName: "Alt Çene Çekimleri",
    teeth: ["31", "32", "33", "41", "42", "43"],
    actionType: "extraction",
    durationSeconds: 3,
    description: "Alt çenede kalan harap dişlerin cerrahi çekimi.",
  },
  {
    id: "stage-imp-upper",
    visitTitle: "1. Seans: Cerrahi & İmplantasyon",
    stageName: "Üst Çene İmplantasyonu",
    teeth: ["12", "14", "22", "24"],
    actionType: "implant",
    durationSeconds: 4,
    description: "All-on-4 protokolü ile 4 adet titanyum fikstür yerleşimi.",
  },
  {
    id: "stage-imp-lower",
    visitTitle: "1. Seans: Cerrahi & İmplantasyon",
    stageName: "Alt Çene İmplantasyonu",
    teeth: ["32", "34", "42", "44"],
    actionType: "implant",
    durationSeconds: 4,
    description: "Alt çenede interforaminal bölgeye 4 adet açılı implant uygulaması.",
  },
  {
    id: "stage-abut-upper",
    visitTitle: "1. Seans: Cerrahi & İmplantasyon",
    stageName: "Multi-Unit Abutment Bağlantısı",
    teeth: ["12", "14", "22", "24"],
    actionType: "abutment",
    durationSeconds: 3,
    description: "Vidalı protez dayanaklarının implant gövdesine torklanması.",
  },
  {
    id: "stage-abut-lower",
    visitTitle: "1. Seans: Cerrahi & İmplantasyon",
    stageName: "Alt Çene Abutment Bağlantısı",
    teeth: ["32", "34", "42", "44"],
    actionType: "abutment",
    durationSeconds: 3,
    description: "Alt implantlar üzerine multi-unit dayanak montajı.",
  },
  {
    id: "stage-temp-denture",
    visitTitle: "1. Seans: Cerrahi & İmplantasyon",
    stageName: "Geçici Hibrit Protez Teslimi",
    teeth: ["16", "26", "36", "46"],
    actionType: "temporary_denture",
    durationSeconds: 4,
    description: "Aynı gün içinde hastaya estetik ve fonksiyon sağlayan sabit geçici protezler vidalanır.",
  },
  {
    id: "stage-healing",
    visitTitle: "İyileşme Süreci: 6 Ay",
    stageName: "Osteointegrasyon & Doku İyileşmesi",
    teeth: [],
    actionType: "healing",
    durationSeconds: 3,
    description: "Çene kemiği ile titanyum yüzey arasında biyolojik kaynama dönemi.",
    healingPeriod: "6 Ay İyileşme Süresi",
  },
  {
    id: "stage-perm-zirconia",
    visitTitle: "2. Seans: Kalıcı Zirkonyum Köprü",
    stageName: "Daimi Zirkonyum Köprülerin Takılması",
    teeth: ["16", "14", "12", "11", "21", "22", "24", "26", "36", "34", "32", "31", "41", "42", "44", "46"],
    actionType: "permanent_bridge",
    durationSeconds: 5,
    description: "Geçici protezler sökülür ve monolitik zirkonyum nihai estetik köprüler sabitlenir.",
  },
];

/**
 * Dosyanın kendi tedavi planı kalemleri ve seanslarından dinamik 3D akış oluşturur
 */
export function buildTimelineStagesFromPlan(
  visits?: StudioVisit[],
  items?: StudioPlanItem[]
): AnimationTimelineStage[] {
  if (!items || items.length === 0) {
    return DEFAULT_ANIMATION_STAGES;
  }

  const stages: AnimationTimelineStage[] = [];
  const safeVisits =
    visits && visits.length > 0
      ? visits
      : [
          {
            id: "v-default",
            orderNum: 1,
            title: "1. Seans: Tedavi Seansı",
            phaseLabel: "1. Aşama",
            healingNote: "",
            chartTeeth: [],
          },
        ];

  const matchedItemIds = new Set<string>();

  safeVisits.forEach((visit, vIdx) => {
    const visitItems = items.filter(
      (it) => it.visitId === visit.id || (!it.visitId && vIdx === 0)
    );

    visitItems.forEach((item, itemIdx) => {
      matchedItemIds.add(item.id || `idx-${vIdx}-${itemIdx}`);

      const name = (item.treatmentName || "").toLowerCase();
      const code = (item.animationCode || (item as any).animation_code || "").toLowerCase();
      let actionType: AnimationTimelineStage["actionType"] = "custom";

      if (
        code.includes("extract") ||
        code.includes("çekim") ||
        name.includes("çekim") ||
        name.includes("cerrahi çekim") ||
        name.includes("extraction")
      ) {
        actionType = "extraction";
      } else if (
        code.includes("implant") ||
        name.includes("implant") ||
        name.includes("fikstür")
      ) {
        actionType = "implant";
      } else if (
        code.includes("abutment") ||
        name.includes("abutment") ||
        name.includes("dayanak")
      ) {
        actionType = "abutment";
      } else if (
        code.includes("root") ||
        code.includes("endo") ||
        code.includes("canal") ||
        name.includes("kanal") ||
        name.includes("endo") ||
        name.includes("pulpa")
      ) {
        actionType = "root_canal";
      } else if (
        code.includes("fill") ||
        code.includes("composite") ||
        code.includes("dolgu") ||
        name.includes("dolgu") ||
        name.includes("kompozit") ||
        name.includes("bonding") ||
        name.includes("inlay") ||
        name.includes("onlay")
      ) {
        actionType = "filling";
      } else if (
        code.includes("zirconia") ||
        code.includes("crown") ||
        code.includes("bridge") ||
        code.includes("kaplama") ||
        code.includes("kuron") ||
        name.includes("zirkon") ||
        name.includes("kuron") ||
        name.includes("köprü") ||
        name.includes("kaplama") ||
        name.includes("emax") ||
        name.includes("veneer")
      ) {
        actionType = "permanent_bridge";
      } else if (
        code.includes("denture") ||
        code.includes("temp") ||
        name.includes("geçici") ||
        name.includes("protez")
      ) {
        actionType = "temporary_denture";
      } else {
        actionType = "custom";
      }

      const teeth = Array.isArray(item.teeth) ? item.teeth : [];

      stages.push({
        id: `stage-${visit.id}-${item.id || itemIdx}`,
        visitTitle: visit.title || `${visit.orderNum}. Seans`,
        stageName: item.treatmentName || "Tedavi Uygulaması",
        teeth,
        actionType,
        durationSeconds: 3.5,
        description: `${visit.title || `${visit.orderNum}. Seans`} seansında ${
          teeth.length > 0 ? teeth.join(", ") + " numaralı diş(ler)e " : ""
        }${item.treatmentName} işlemi uygulanacaktır.`,
      });
    });

    if (visit.healingNote && visit.healingNote.trim()) {
      stages.push({
        id: `healing-${visit.id}`,
        visitTitle: visit.title || `${visit.orderNum}. Seans`,
        stageName: visit.healingNote,
        teeth: [],
        actionType: "healing",
        durationSeconds: 3,
        description: `Seans sonrası doku iyileşmesi ve kontrol süreci (${visit.healingNote}).`,
        healingPeriod: visit.healingNote,
      });
    }
  });

  // Handle any items whose visitId did not match any visit in safeVisits
  const remainingItems = items.filter((it, idx) => !matchedItemIds.has(it.id || `idx-${idx}`));
  if (remainingItems.length > 0 && safeVisits.length > 0) {
    const fallbackVisit = safeVisits[0]!;
    remainingItems.forEach((item, itemIdx) => {
      const name = (item.treatmentName || "").toLowerCase();
      const code = (item.animationCode || (item as any).animation_code || "").toLowerCase();
      let actionType: AnimationTimelineStage["actionType"] = "custom";

      if (code.includes("extract") || name.includes("çekim") || name.includes("extraction")) {
        actionType = "extraction";
      } else if (code.includes("implant") || name.includes("implant")) {
        actionType = "implant";
      } else if (code.includes("abutment") || name.includes("abutment")) {
        actionType = "abutment";
      } else if (code.includes("root") || name.includes("kanal")) {
        actionType = "root_canal";
      } else if (code.includes("fill") || name.includes("dolgu")) {
        actionType = "filling";
      } else if (code.includes("zirconia") || code.includes("crown") || name.includes("zirkon") || name.includes("köprü")) {
        actionType = "permanent_bridge";
      } else if (code.includes("denture") || name.includes("protez")) {
        actionType = "temporary_denture";
      }

      const teeth = Array.isArray(item.teeth) ? item.teeth : [];

      stages.push({
        id: `stage-rem-${item.id || itemIdx}`,
        visitTitle: fallbackVisit.title || `${fallbackVisit.orderNum}. Seans`,
        stageName: item.treatmentName || "Tedavi Uygulaması",
        teeth,
        actionType,
        durationSeconds: 3.5,
        description: `${teeth.length > 0 ? teeth.join(", ") + " numaralı diş(ler)e " : ""}${item.treatmentName} işlemi uygulanacaktır.`,
      });
    });
  }

  return stages.length > 0 ? stages : DEFAULT_ANIMATION_STAGES;
}

interface SimulationModuleProps {
  stages?: AnimationTimelineStage[];
  planItems?: StudioPlanItem[];
  visits?: StudioVisit[];
  darkMode?: boolean;
}

export function SimulationModule({
  stages: customStages,
  planItems,
  visits,
  darkMode = false,
}: SimulationModuleProps) {
  const stages = useMemo(() => {
    if (planItems && planItems.length > 0) {
      return buildTimelineStagesFromPlan(visits, planItems);
    }
    if (customStages && customStages.length > 0) return customStages;
    return buildTimelineStagesFromPlan(visits, planItems);
  }, [customStages, visits, planItems]);

  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // Keep index within bounds
  useEffect(() => {
    if (currentStageIndex >= stages.length) {
      setCurrentStageIndex(0);
    }
  }, [stages.length, currentStageIndex]);

  const activeStage: AnimationTimelineStage =
    stages[currentStageIndex] || stages[0] || DEFAULT_ANIMATION_STAGES[0]!;

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = (activeStage.durationSeconds * 1000) / playbackSpeed;
    const timer = setTimeout(() => {
      if (currentStageIndex < stages.length - 1) {
        setCurrentStageIndex((prev) => prev + 1);
      } else {
        setIsPlaying(false);
      }
    }, intervalTime);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStageIndex, stages, activeStage, playbackSpeed]);

  const handlePrev = () => {
    setCurrentStageIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentStageIndex((prev) => Math.min(stages.length - 1, prev + 1));
  };

  const handleTogglePlay = () => {
    if (!isPlaying && currentStageIndex === stages.length - 1) {
      setCurrentStageIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  // Group stages by Visit Title for the timeline list (Matching Image 5)
  const groupedStages: Record<string, AnimationTimelineStage[]> = {};
  stages.forEach((st) => {
    const list = groupedStages[st.visitTitle] || [];
    list.push(st);
    groupedStages[st.visitTitle] = list;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left 7 Columns: 3D Three.js Viewport & Bottom Media Player */}
      <div className="lg:col-span-7 flex flex-col space-y-4">
        {/* 3D Model Canvas */}
        <ThreeMouthCanvas
          currentStage={activeStage}
          allStages={stages}
          isPlaying={isPlaying}
          onStepComplete={handleNext}
        />

        {/* Media Player Controls */}
        <div className={`rounded-2xl border p-4 shadow-xs transition-colors ${
          darkMode
            ? "border-slate-800 bg-slate-900 text-white"
            : "border-slate-200 bg-white text-slate-900"
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Step info */}
            <div>
              <div className={`text-[11px] font-bold uppercase tracking-wider ${
                darkMode ? "text-cyan-400" : "text-slate-400"
              }`}>
                Aşama {currentStageIndex + 1} / {stages.length}
              </div>
              <div className={`text-sm font-bold ${
                darkMode ? "text-white" : "text-slate-900"
              }`}>
                {activeStage.stageName}
              </div>
            </div>

            {/* Playback Buttons */}
            <div className="flex items-center gap-2 self-center">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStageIndex === 0}
                className={`rounded-xl border p-2.5 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-2xs ${
                  darkMode
                    ? "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                }`}
                title="Önceki Aşama"
              >
                <SkipBack className="size-4" />
              </button>

              <button
                type="button"
                onClick={handleTogglePlay}
                className={`flex items-center justify-center size-11 rounded-full transition cursor-pointer shadow-md active:scale-95 ${
                  darkMode
                    ? "bg-cyan-400 text-slate-950 hover:bg-cyan-300 shadow-cyan-500/25"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
                title={isPlaying ? "Durdur" : "Oynat"}
              >
                {isPlaying ? (
                  <Pause className={`size-5 ${darkMode ? "fill-slate-950" : "fill-white"}`} />
                ) : (
                  <Play className={`size-5 ml-0.5 ${darkMode ? "fill-slate-950" : "fill-white"}`} />
                )}
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={currentStageIndex === stages.length - 1}
                className={`rounded-xl border p-2.5 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-2xs ${
                  darkMode
                    ? "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                }`}
                title="Sonraki Aşama"
              >
                <SkipForward className="size-4" />
              </button>
            </div>

            {/* Speed & Timeline Slider */}
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-1 rounded-xl p-1 text-[11px] font-semibold ${
                darkMode ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-700"
              }`}>
                {[1, 1.5, 2].map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`rounded-lg px-2 py-0.5 transition cursor-pointer ${
                      playbackSpeed === spd
                        ? darkMode
                          ? "bg-cyan-500 text-slate-950 shadow-2xs font-bold"
                          : "bg-white text-slate-900 shadow-2xs font-bold"
                        : darkMode
                        ? "text-slate-400 hover:text-white"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Timeline progress scrubber */}
          <div className={`mt-3.5 pt-3 border-t ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
            <div
              className={`relative w-full h-2.5 rounded-full overflow-hidden cursor-pointer group ${
                darkMode ? "bg-slate-800" : "bg-slate-100"
              }`}
              title="Aşamalara atlamak için tıklayın"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const ratio = Math.max(0, Math.min(1, clickX / rect.width));
                const targetIdx = Math.min(stages.length - 1, Math.floor(ratio * stages.length));
                setCurrentStageIndex(targetIdx);
                setIsPlaying(false);
              }}
            >
              <div
                className={`h-full transition-all duration-300 ${
                  darkMode ? "bg-cyan-400 group-hover:bg-cyan-300" : "bg-slate-900 group-hover:bg-blue-600"
                }`}
                style={{
                  width: `${((currentStageIndex + 1) / stages.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right 5 Columns: Chronological Treatment Stages Timeline */}
      <div className={`lg:col-span-5 rounded-2xl border p-5 shadow-xs space-y-4 ${
        darkMode
          ? "border-slate-800 bg-slate-900 text-white"
          : "border-slate-200 bg-white text-slate-900"
      }`}>
        <div className={`flex items-center justify-between border-b pb-3 ${
          darkMode ? "border-slate-800" : "border-slate-100"
        }`}>
          <div className="flex items-center gap-2">
            <div className={`size-2 rounded-full ${
              darkMode ? "bg-cyan-400 ring-2 ring-cyan-400/20" : "bg-blue-600 ring-2 ring-blue-100"
            }`} />
            <h3 className={`text-sm font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>
              Tedavi Süreç Takvimi
            </h3>
          </div>
          <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
            darkMode ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"
          }`}>
            {currentStageIndex + 1} / {stages.length}
          </span>
        </div>

        {/* Grouped stages list */}
        <div className="space-y-4 max-h-[560px] overflow-y-auto pr-1">
          {Object.entries(groupedStages).map(([visitTitle, vStages]) => (
            <div key={visitTitle} className="space-y-1.5">
              {/* Visit Header */}
              <div className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold ${
                darkMode
                  ? "border-slate-800 bg-slate-950/60 text-cyan-300"
                  : "border-slate-200/70 bg-slate-50 text-slate-700"
              }`}>
                <Calendar className={`size-3.5 ${darkMode ? "text-cyan-400" : "text-slate-500"}`} />
                <span>{visitTitle}</span>
              </div>

              {/* Stages under this visit */}
              <div className="space-y-1 pl-1">
                {vStages.map((st) => {
                  const stageIndex = stages.findIndex((s) => s.id === st.id);
                  const isActive = stageIndex === currentStageIndex;
                  const isPassed = stageIndex < currentStageIndex;

                  return (
                    <div
                      key={st.id}
                      onClick={() => {
                        setCurrentStageIndex(stageIndex);
                        setIsPlaying(false);
                      }}
                      title={st.description}
                      className={`group flex items-center justify-between rounded-xl px-3 py-2.5 transition cursor-pointer border ${
                        isActive
                          ? darkMode
                            ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-200 shadow-sm font-semibold"
                            : "bg-slate-900 border-slate-900 text-white shadow-sm font-semibold"
                          : isPassed
                          ? darkMode
                            ? "bg-slate-950/40 border-slate-800/80 text-slate-300 hover:bg-slate-800/50"
                            : "bg-slate-50/70 border-slate-100 text-slate-700 hover:bg-slate-100"
                          : darkMode
                          ? "bg-transparent border-transparent text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                          : "bg-white border-transparent text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isActive ? (
                          <div className={`size-2 rounded-full ring-4 shrink-0 ${
                            darkMode ? "bg-cyan-400 ring-cyan-400/25" : "bg-blue-400 ring-blue-400/25"
                          }`} />
                        ) : isPassed ? (
                          <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <div className={`size-2 rounded-full shrink-0 ${
                            darkMode ? "bg-slate-700" : "bg-slate-300"
                          }`} />
                        )}
                        <span className="text-xs truncate">{st.stageName}</span>
                      </div>

                      {/* Tooth pills */}
                      {st.teeth.length > 0 && (
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          {st.teeth.slice(0, 4).map((t) => (
                            <span
                              key={t}
                              className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold border ${
                                isActive
                                  ? darkMode
                                    ? "bg-cyan-950 text-cyan-300 border-cyan-700"
                                    : "bg-slate-800 text-slate-200 border-slate-700"
                                  : darkMode
                                  ? "bg-slate-800 text-slate-300 border-slate-700/80"
                                  : "bg-slate-100 text-slate-600 border-slate-200/60"
                              }`}
                            >
                              {t}
                            </span>
                          ))}
                          {st.teeth.length > 4 && (
                            <span className="text-[10px] font-mono font-medium text-slate-400">
                              +{st.teeth.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
