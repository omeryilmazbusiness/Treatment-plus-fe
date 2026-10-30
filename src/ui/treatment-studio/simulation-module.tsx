"use client";

import React, { useEffect, useState } from "react";
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

interface SimulationModuleProps {
  stages?: AnimationTimelineStage[];
  planItems?: StudioPlanItem[];
  visits?: StudioVisit[];
}

export function SimulationModule({
  stages = DEFAULT_ANIMATION_STAGES,
}: SimulationModuleProps) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

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

        {/* Media Player Controls (Image 5 bottom player bar) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Step info */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Aşama {currentStageIndex + 1} / {stages.length}
              </div>
              <div className="text-sm font-bold text-slate-900">
                {activeStage.stageName}
              </div>
            </div>

            {/* Playback Buttons */}
            <div className="flex items-center gap-2 self-center">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStageIndex === 0}
                className="rounded-xl border border-slate-200 p-2.5 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-2xs"
                title="Önceki Aşama"
              >
                <SkipBack className="size-4" />
              </button>

              <button
                type="button"
                onClick={handleTogglePlay}
                className="flex items-center justify-center size-11 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition cursor-pointer shadow-md active:scale-95"
                title={isPlaying ? "Durdur" : "Oynat"}
              >
                {isPlaying ? <Pause className="size-5 fill-white" /> : <Play className="size-5 fill-white ml-0.5" />}
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={currentStageIndex === stages.length - 1}
                className="rounded-xl border border-slate-200 p-2.5 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-2xs"
                title="Sonraki Aşama"
              >
                <SkipForward className="size-4" />
              </button>
            </div>

            {/* Speed & Timeline Slider */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 text-[11px] font-semibold text-slate-700">
                {[1, 1.5, 2].map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`rounded-lg px-2 py-0.5 transition cursor-pointer ${
                      playbackSpeed === spd
                        ? "bg-white text-slate-900 shadow-2xs font-bold"
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
          <div className="mt-3.5 pt-3 border-t border-slate-100">
            <div className="relative w-full h-2 bg-slate-100 rounded-full overflow-hidden cursor-pointer">
              <div
                className="h-full bg-slate-900 transition-all duration-300"
                style={{
                  width: `${((currentStageIndex + 1) / stages.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right 5 Columns: Chronological Treatment Stages Timeline (Image 5 exact style) */}
      <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Tedavi Süreç Takvimi</h3>
            <p className="text-[11px] text-slate-500">
              Kronolojik klinik aşamalar ve iyileşme periyotları
            </p>
          </div>
          <span className="rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-800 border border-blue-200">
            3D İnteraktif
          </span>
        </div>

        {/* Grouped stages list */}
        <div className="space-y-4 max-h-[560px] overflow-y-auto pr-1">
          {Object.entries(groupedStages).map(([visitTitle, vStages]) => (
            <div key={visitTitle} className="space-y-1.5">
              {/* Visit Header */}
              <div className="flex items-center gap-2 rounded-xl bg-slate-100/80 px-3.5 py-2 text-xs font-bold text-slate-800">
                <Calendar className="size-3.5 text-slate-500" />
                <span>{visitTitle}</span>
              </div>

              {/* Stages under this visit */}
              <div className="space-y-1 pl-2">
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
                      className={`group flex items-center justify-between rounded-xl px-3 py-2.5 transition cursor-pointer border ${
                        isActive
                          ? "bg-slate-900 border-slate-900 text-white shadow-sm font-semibold"
                          : isPassed
                          ? "bg-slate-50/60 border-slate-100 text-slate-600 hover:bg-slate-100"
                          : "bg-white border-transparent text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`size-2.5 rounded-full ${
                            isActive
                              ? "bg-blue-400 ring-2 ring-blue-300/40 animate-pulse"
                              : isPassed
                              ? "bg-emerald-500"
                              : "bg-slate-300"
                          }`}
                        />
                        <div>
                          <div className="text-xs">{st.stageName}</div>
                          {st.description && (
                            <div className={`text-[10px] line-clamp-1 ${isActive ? "text-slate-300" : "text-slate-500"}`}>
                              {st.description}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Tooth pills */}
                      {st.teeth.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 justify-end max-w-[130px]">
                          {st.teeth.slice(0, 4).map((t) => (
                            <span
                              key={t}
                              className={`rounded px-1.5 py-0.5 text-[9px] font-mono font-bold ${
                                isActive
                                  ? "bg-slate-800 text-slate-200 border border-slate-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {t}
                            </span>
                          ))}
                          {st.teeth.length > 4 && (
                            <span className="text-[9px] text-slate-400">
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
