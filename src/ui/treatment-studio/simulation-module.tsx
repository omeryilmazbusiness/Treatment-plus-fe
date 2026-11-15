"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Download,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Square,
  Video,
} from "lucide-react";
import { ThreeMouthCanvas } from "./three-mouth-canvas";
import { useTreatmentVideoRecorder } from "./use-treatment-video-recorder";
import type {
  AnimationTimelineStage,
  StudioPlanItem,
  StudioVisit,
  ToothCondition,
} from "./types";

export const DEFAULT_ANIMATION_STAGES: AnimationTimelineStage[] = [
  {
    id: "stage-ext-upper",
    visitTitle: "1. Seans: Cerrahi & İmplantasyon",
    stageName: "Üst Çene Çekimleri",
    teeth: ["11", "12", "13", "21", "22", "23", "27"],
    actionType: "extraction",
    durationSeconds: 16.0,
    description: "Enfekte ve restore edilemeyen üst dişlerin sırayla atravmatik çekimi.",
  },
  {
    id: "stage-ext-lower",
    visitTitle: "1. Seans: Cerrahi & İmplantasyon",
    stageName: "Alt Çene Çekimleri",
    teeth: ["31", "32", "33", "41", "42", "43"],
    actionType: "extraction",
    durationSeconds: 15.0,
    description: "Alt çenede kalan harap dişlerin sırayla cerrahi çekimi.",
  },
  {
    id: "stage-imp-upper",
    visitTitle: "1. Seans: Cerrahi & İmplantasyon",
    stageName: "Üst Çene İmplantasyonu",
    teeth: ["12", "14", "22", "24"],
    actionType: "implant",
    durationSeconds: 13.5,
    description: "All-on-4 protokolü ile 4 adet titanyum fikstürün sırayla yerleşimi.",
  },
  {
    id: "stage-imp-lower",
    visitTitle: "1. Seans: Cerrahi & İmplantasyon",
    stageName: "Alt Çene İmplantasyonu",
    teeth: ["32", "34", "42", "44"],
    actionType: "implant",
    durationSeconds: 13.5,
    description: "Alt çenede interforaminal bölgeye 4 adet açılı implantın sırayla uygulaması.",
  },
  {
    id: "stage-abut-upper",
    visitTitle: "1. Seans: Cerrahi & İmplantasyon",
    stageName: "Multi-Unit Abutment Bağlantısı",
    teeth: ["12", "14", "22", "24"],
    actionType: "abutment",
    durationSeconds: 11.5,
    description: "Vidalı protez dayanaklarının implant gövdelerine sırayla torklanması.",
  },
  {
    id: "stage-abut-lower",
    visitTitle: "1. Seans: Cerrahi & İmplantasyon",
    stageName: "Alt Çene Abutment Bağlantısı",
    teeth: ["32", "34", "42", "44"],
    actionType: "abutment",
    durationSeconds: 11.5,
    description: "Alt implantlar üzerine multi-unit dayanakların sırayla montajı.",
  },
  {
    id: "stage-temp-denture",
    visitTitle: "1. Seans: Cerrahi & İmplantasyon",
    stageName: "Geçici Hibrit Protez Teslimi",
    teeth: ["14", "13", "12", "11", "21", "22", "23", "24", "34", "33", "32", "31", "41", "42", "43", "44"],
    actionType: "temporary_denture",
    durationSeconds: 14.0,
    description: "Aynı gün içinde hastaya estetik ve fonksiyon sağlayan sabit geçici protezler vidalanır.",
  },
  {
    id: "stage-healing",
    visitTitle: "İyileşme Süreci: 6 Ay",
    stageName: "Osteointegrasyon & Doku İyileşmesi",
    teeth: [],
    actionType: "healing",
    durationSeconds: 6.0,
    description: "Çene kemiği ile titanyum yüzey arasında biyolojik kaynama dönemi.",
    healingPeriod: "6 Ay İyileşme Süresi",
  },
  {
    id: "stage-perm-zirconia",
    visitTitle: "2. Seans: Kalıcı Zirkonyum Köprü",
    stageName: "Daimi Zirkonyum Köprülerin Takılması",
    teeth: [
      "16", "15", "14", "13", "12", "11",
      "21", "22", "23", "24", "25", "26",
      "36", "35", "34", "33", "32", "31",
      "41", "42", "43", "44", "45", "46",
    ],
    actionType: "permanent_bridge",
    durationSeconds: 15.0,
    description: "Geçici protezler sökülür ve monolitik zirkonyum nihai estetik köprüler sabitlenir.",
  },
];

export const TEN_TREATMENT_SHOWCASE_STAGES: AnimationTimelineStage[] = [
  {
    id: "showcase-1-extraction",
    visitTitle: "1. Cerrahi Tedavi",
    stageName: "Diş Çekimi (Cerrahi Ekstraksiyon)",
    teeth: ["16"],
    actionType: "extraction",
    durationSeconds: 8.0,
    description:
      "Enfekte veya restore edilemeyen dişin atravmatik davye ile lüksasyonu ve alveol soketinden cerrahi çekimi.",
  },
  {
    id: "showcase-2-implant",
    visitTitle: "2. İmplantoloji",
    stageName: "Dental İmplant Yerleştirimi",
    teeth: ["14", "24"],
    actionType: "implant",
    durationSeconds: 11.5,
    description:
      "Cerrahi osteotomi frezi ile her bir implant yuvasının sırayla hazırlanması ve titanyum fikstürlerin kemik içine torklanması.",
  },
  {
    id: "showcase-3-abutment",
    visitTitle: "3. İmplant Üstü Protetik",
    stageName: "Abutment (Dayanak) Bağlantısı",
    teeth: ["14", "24"],
    actionType: "abutment",
    durationSeconds: 10.0,
    description:
      "Osteointegrasyonu tamamlanan titanyum implantlar üzerine multi-unit zirkonyum/titanyum dayanakların tork anahtarı ile sırayla sabitlenmesi.",
  },
  {
    id: "showcase-4-root-canal",
    visitTitle: "4. Endodonti",
    stageName: "Kanal Tedavisi (Endodonti)",
    teeth: ["26"],
    actionType: "root_canal",
    durationSeconds: 9.5,
    description:
      "Enflame pulpa dokusunun döner Ni-Ti eğelerle şekillendirilmesi, kök kanal dezenfeksiyonu ve Gutta-Perka ile hermetik dolumu.",
  },
  {
    id: "showcase-5-filling",
    visitTitle: "5. Restoratif Diş Hekimliği",
    stageName: "Kompozit Dolgu (Direkt Restorasyon)",
    teeth: ["36"],
    actionType: "filling",
    durationSeconds: 8.5,
    description:
      "Oklüzal çürük lezyonunun elmas rond frezle temizlenmesi, nano-hibrit kompozit rezin uygulanması ve mavi LED ışıkla polimerizasyonu.",
  },
  {
    id: "showcase-6-sealant",
    visitTitle: "6. Koruyucu Diş Hekimliği",
    stageName: "Fissür Örtücü (Koruyucu Sealant)",
    teeth: ["46"],
    actionType: "sealant",
    durationSeconds: 8.0,
    description:
      "Azı dişi oklüzal pit ve fissürlerinin profilaktik temizliği, akışkan fissür örtücü rezin uygulanması ve LED kürleme.",
  },
  {
    id: "showcase-7-crown",
    visitTitle: "7. Sabit Protetik Restorasyon",
    stageName: "Zirkonyum / Porselen Kuron",
    teeth: ["11", "21"],
    actionType: "crown",
    durationSeconds: 11.0,
    description:
      "Seçilen dişlerin sırayla 360° anatomik basamaklı kesimi (preparasyon) ve monolitik zirkonyum kuronların tek tek simantasyonu.",
  },
  {
    id: "showcase-8-veneer",
    visitTitle: "8. Estetik Gülüş Tasarımı",
    stageName: "Lamina Veneer (Yaprak Porselen)",
    teeth: ["13", "12", "11", "21", "22", "23"],
    actionType: "veneer",
    durationSeconds: 15.0,
    description:
      "Ön yüzeyde her bir dişte sırayla minimal (0.3 mm) mine preparasyonu, ultra-ince E-Max yaprak porselenlerin tek tek yerleştirilmesi ve LED simantasyonu.",
  },
  {
    id: "showcase-9-bridge",
    visitTitle: "9. Çok Üniteli Protetik Köprü",
    stageName: "Kalıcı Zirkonyum Köprü & Geçici Protez",
    teeth: ["14", "13", "12", "11", "21", "22", "23", "24"],
    actionType: "permanent_bridge",
    durationSeconds: 13.5,
    description:
      "Destek dişlerin sırayla prepare edilmesi ve çok üniteli monolitik zirkonyum ark köprüsünün tek tek simante edilmesi.",
  },
  {
    id: "showcase-10-scaling",
    visitTitle: "10. Periodontoloji",
    stageName: "Diş Taşı Temizliği (Detertraj & Polisaj)",
    teeth: ["33", "32", "31", "41", "42", "43"],
    actionType: "scaling",
    durationSeconds: 13.5,
    description:
      "Diş eti sınırındaki diş taşı (kalkulus) ve plak birikimlerinin ultrasonik kavitron ucu ve su spreyi ile her bir dişte sırayla temizlenmesi.",
  },
];

function classifyPlanItemAction(
  name: string,
  code: string,
  treatmentType = ""
): AnimationTimelineStage["actionType"] {
  const n = `${name} ${treatmentType}`.toLowerCase();
  const c = code.toLowerCase();

  if (
    c.includes("extract") ||
    c.includes("çekim") ||
    n.includes("çekim") ||
    n.includes("cekim") ||
    n.includes("cerrahi çekim") ||
    n.includes("extraction")
  ) {
    return "extraction";
  }
  if (c.includes("abutment") || n.includes("abutment") || n.includes("dayanak")) {
    return "abutment";
  }
  if (c.includes("implant") || n.includes("implant") || n.includes("fikstür")) {
    return "implant";
  }
  if (
    c.includes("root") ||
    c.includes("endo") ||
    c.includes("canal") ||
    n.includes("kanal") ||
    n.includes("endo") ||
    n.includes("pulpa")
  ) {
    return "root_canal";
  }
  if (
    c.includes("sealant") ||
    c.includes("fissure") ||
    n.includes("fissür") ||
    n.includes("fissur") ||
    n.includes("örtücü")
  ) {
    return "sealant";
  }
  if (
    c.includes("fill") ||
    c.includes("composite") ||
    c.includes("dolgu") ||
    n.includes("dolgu") ||
    n.includes("kompozit") ||
    n.includes("bonding") ||
    n.includes("inlay") ||
    n.includes("onlay")
  ) {
    return "filling";
  }
  if (
    c.includes("veneer") ||
    c.includes("lamina") ||
    n.includes("lamina") ||
    n.includes("veneer") ||
    n.includes("yaprak")
  ) {
    return "veneer";
  }
  if (
    c.includes("bridge") ||
    n.includes("köprü") ||
    n.includes("kopru")
  ) {
    return "permanent_bridge";
  }
  if (
    c.includes("zirconia") ||
    c.includes("crown") ||
    c.includes("kaplama") ||
    c.includes("kuron") ||
    n.includes("zirkon") ||
    n.includes("kuron") ||
    n.includes("kron") ||
    n.includes("kaplama") ||
    n.includes("emax") ||
    n.includes("e-max")
  ) {
    return "crown";
  }
  if (
    c.includes("denture") ||
    c.includes("temp") ||
    n.includes("geçici") ||
    n.includes("gecici") ||
    n.includes("protez")
  ) {
    return "temporary_denture";
  }
  if (
    c.includes("scaling") ||
    c.includes("clean") ||
    n.includes("detertraj") ||
    n.includes("diş taşı") ||
    n.includes("temiz") ||
    n.includes("küretaj") ||
    n.includes("beyazlatma")
  ) {
    return "scaling";
  }
  return "custom";
}

function getDefaultTeethForAction(
  actionType: AnimationTimelineStage["actionType"]
): string[] {
  switch (actionType) {
    case "extraction":
      return ["16"];
    case "implant":
    case "abutment":
      return ["14", "24"];
    case "root_canal":
      return ["26"];
    case "filling":
      return ["36"];
    case "sealant":
      return ["46"];
    case "crown":
      return ["11", "21"];
    case "veneer":
      return ["13", "12", "11", "21", "22", "23"];
    case "permanent_bridge":
    case "temporary_denture":
      return ["14", "13", "12", "11", "21", "22", "23", "24"];
    case "scaling":
    case "cleaning":
      return ["33", "32", "31", "41", "42", "43"];
    case "healing":
    default:
      return [];
  }
}

function computeStageDuration(
  actionType: AnimationTimelineStage["actionType"],
  toothCount: number
): number {
  if (actionType === "healing") return 6.0;
  const count = Math.max(1, toothCount);
  const base =
    actionType === "root_canal"
      ? 9.0
      : actionType === "implant"
        ? 8.5
        : actionType === "abutment"
          ? 7.5
          : 8.0;
  const extraPerTooth =
    actionType === "permanent_bridge" || actionType === "temporary_denture"
      ? 1.1
      : actionType === "scaling" || actionType === "cleaning"
        ? 1.4
        : 2.3;
  return Math.min(22.0, Number((base + (count - 1) * extraPerTooth).toFixed(1)));
}

/**
 * Dosyanın kendi tedavi planı kalemleri ve seanslarından dinamik 3D akış oluşturur
 */
export function buildTimelineStagesFromPlan(
  visits?: StudioVisit[],
  items?: StudioPlanItem[],
  conditions?: Record<string, ToothCondition>
): AnimationTimelineStage[] {
  if (!items || items.length === 0) {
    const diagnosedTeeth = conditions
      ? Object.entries(conditions)
          .filter(([, cond]) => cond && cond !== "intact")
          .map(([tooth]) => tooth)
      : [];
    if (diagnosedTeeth.length > 0) {
      return [
        {
          id: "stage-diagnosis-baseline",
          visitTitle: "Klinik Teşhis & Mevcut Durum",
          stageName: "Teşhis Edilen Ağız ve Diş Durumu",
          teeth: diagnosedTeeth,
          actionType: "healing",
          durationSeconds: 6.0,
          description:
            "Teşhis bölümünde işaretlenen eksik dişler ve mevcut klinik bulguların 3D model üzerindeki görünümü.",
        },
      ];
    }
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

      const name = item.treatmentName || "";
      const code =
        item.animationCode ||
        (item as unknown as { animation_code?: string }).animation_code ||
        item.treatmentCode ||
        "";
      const actionType = classifyPlanItemAction(
        name,
        code,
        item.treatmentType || ""
      );
      const rawTeeth = Array.isArray(item.teeth) ? item.teeth.filter(Boolean) : [];
      const teeth =
        rawTeeth.length > 0 ? rawTeeth : getDefaultTeethForAction(actionType);

      stages.push({
        id: `stage-${visit.id}-${item.id || itemIdx}-${itemIdx}`,
        visitTitle: visit.title || `${visit.orderNum}. Seans`,
        stageName: item.treatmentName || "Tedavi Uygulaması",
        teeth,
        actionType,
        durationSeconds: computeStageDuration(actionType, teeth.length),
        description: `${visit.title || `${visit.orderNum}. Seans`} seansında ${
          teeth.length > 0 ? teeth.join(", ") + " numaralı diş(ler)e sırayla " : ""
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
        durationSeconds: 6.0,
        description: `Seans sonrası doku iyileşmesi ve kontrol süreci (${visit.healingNote}).`,
        healingPeriod: visit.healingNote,
      });
    }
  });

  // Handle any items whose visitId did not match any visit in safeVisits
  const remainingItems = items.filter(
    (it, idx) => !matchedItemIds.has(it.id || `idx-${idx}`)
  );
  if (remainingItems.length > 0 && safeVisits.length > 0) {
    const fallbackVisit = safeVisits[0]!;
    remainingItems.forEach((item, itemIdx) => {
      const name = item.treatmentName || "";
      const code =
        item.animationCode ||
        (item as unknown as { animation_code?: string }).animation_code ||
        item.treatmentCode ||
        "";
      const actionType = classifyPlanItemAction(
        name,
        code,
        item.treatmentType || ""
      );
      const rawTeeth = Array.isArray(item.teeth) ? item.teeth.filter(Boolean) : [];
      const teeth =
        rawTeeth.length > 0 ? rawTeeth : getDefaultTeethForAction(actionType);

      stages.push({
        id: `stage-rem-${item.id || itemIdx}-${itemIdx}`,
        visitTitle: fallbackVisit.title || `${fallbackVisit.orderNum}. Seans`,
        stageName: item.treatmentName || "Tedavi Uygulaması",
        teeth,
        actionType,
        durationSeconds: computeStageDuration(actionType, teeth.length),
        description: `${
          teeth.length > 0 ? teeth.join(", ") + " numaralı diş(ler)e sırayla " : ""
        }${item.treatmentName} işlemi uygulanacaktır.`,
      });
    });
  }

  return stages.length > 0 ? stages : DEFAULT_ANIMATION_STAGES;
}

interface SimulationModuleProps {
  stages?: AnimationTimelineStage[];
  planItems?: StudioPlanItem[];
  visits?: StudioVisit[];
  conditions?: Record<string, ToothCondition>;
  darkMode?: boolean;
  isActive?: boolean;
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function SimulationModule({
  stages: customStages,
  planItems,
  visits,
  conditions,
  darkMode = false,
  isActive = true,
}: SimulationModuleProps) {
  const [selectedShowcaseId, setSelectedShowcaseId] = useState<string>("plan");

  const planStages = useMemo(() => {
    if (planItems && planItems.length > 0) {
      return buildTimelineStagesFromPlan(visits, planItems, conditions);
    }
    if (customStages && customStages.length > 0) return customStages;
    return buildTimelineStagesFromPlan(visits, planItems, conditions);
  }, [customStages, visits, planItems, conditions]);

  const stages = useMemo(() => {
    if (selectedShowcaseId === "plan") {
      return planStages;
    }
    if (selectedShowcaseId === "all_10") {
      return TEN_TREATMENT_SHOWCASE_STAGES;
    }
    const single = TEN_TREATMENT_SHOWCASE_STAGES.find(
      (st) => st.id === selectedShowcaseId
    );
    return single ? [single] : planStages;
  }, [selectedShowcaseId, planStages]);

  const stageTimeline = useMemo(() => {
    const items: Array<{
      stage: AnimationTimelineStage;
      start: number;
      end: number;
      duration: number;
    }> = [];
    let total = 0;
    for (const st of stages) {
      const dur = st.durationSeconds || 8.0;
      const start = total;
      const end = total + dur;
      total = end;
      items.push({ stage: st, start, end, duration: dur });
    }
    return { items, totalDuration: Math.max(total, 0.1) };
  }, [stages]);

  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [resetSignal, setResetSignal] = useState(0);

  const {
    isRecording,
    recordingProgress,
    startRecording,
    stopRecording,
    onAfterRenderFrame,
  } = useTreatmentVideoRecorder();

  const handleSelectShowcase = (id: string) => {
    if (isRecording) return;
    setSelectedShowcaseId(id);
    setCurrentTime(0);
    setResetSignal((s) => s + 1);
    setIsPlaying(id !== "plan");
  };

  const currentStageIndex = useMemo(() => {
    const found = stageTimeline.items.findIndex(
      (it) => currentTime >= it.start && currentTime < it.end
    );
    if (found !== -1) return found;
    if (currentTime >= stageTimeline.totalDuration) {
      return stageTimeline.items.length - 1;
    }
    return 0;
  }, [currentTime, stageTimeline]);

  const stageElapsedSeconds = useMemo(() => {
    const item = stageTimeline.items[currentStageIndex];
    if (!item) return 0;
    return Math.max(0, currentTime - item.start);
  }, [currentTime, currentStageIndex, stageTimeline]);

  // When active changes to true (opening the simulation tab), always start from the beginning
  useEffect(() => {
    if (isActive) {
      setCurrentTime(0);
      setIsPlaying(false);
      setResetSignal((s) => s + 1);
    }
  }, [isActive]);

  const activeStage: AnimationTimelineStage =
    stages[currentStageIndex] || stages[0] || DEFAULT_ANIMATION_STAGES[0]!;

  // Latest HUD metadata ref for post-render frame capture
  const hudMetaRef = useRef({
    visitTitle: activeStage.visitTitle,
    stageName: activeStage.stageName,
    description: activeStage.description,
    teeth: activeStage.teeth,
    stageIndex: currentStageIndex,
    totalStages: stages.length,
    currentTime,
    totalDuration: stageTimeline.totalDuration,
  });

  useEffect(() => {
    hudMetaRef.current = {
      visitTitle: activeStage.visitTitle,
      stageName: activeStage.stageName,
      description: activeStage.description,
      teeth: activeStage.teeth,
      stageIndex: currentStageIndex,
      totalStages: stages.length,
      currentTime,
      totalDuration: stageTimeline.totalDuration,
    };
  }, [
    activeStage.visitTitle,
    activeStage.stageName,
    activeStage.description,
    activeStage.teeth,
    currentStageIndex,
    stages.length,
    currentTime,
    stageTimeline.totalDuration,
  ]);

  const handleAfterRender = useCallback(
    (webglCanvas: HTMLCanvasElement) => {
      onAfterRenderFrame(webglCanvas, hudMetaRef.current, stages);
    },
    [onAfterRenderFrame, stages]
  );

  // Smooth continuous video playback ticker
  useEffect(() => {
    if (!isPlaying) return;

    let lastTime = performance.now();
    let animId: number;

    const tick = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      setCurrentTime((prev) => {
        const next = prev + delta * playbackSpeed;
        if (next >= stageTimeline.totalDuration) {
          setIsPlaying(false);
          if (isRecording) {
            stopRecording();
          }
          return stageTimeline.totalDuration;
        }
        return next;
      });

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, playbackSpeed, stageTimeline.totalDuration, isRecording, stopRecording]);

  const handleRestart = () => {
    if (isRecording) stopRecording();
    setCurrentTime(0);
    setIsPlaying(false);
    setResetSignal((s) => s + 1);
  };

  const handlePrev = () => {
    if (isRecording) return;
    if (currentStageIndex > 0) {
      setCurrentTime(stageTimeline.items[currentStageIndex - 1]!.start);
    } else {
      setCurrentTime(0);
      setResetSignal((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (isRecording) return;
    if (currentStageIndex < stageTimeline.items.length - 1) {
      setCurrentTime(stageTimeline.items[currentStageIndex + 1]!.start);
    } else {
      setCurrentTime(stageTimeline.totalDuration);
      setIsPlaying(false);
    }
  };

  const handleTogglePlay = () => {
    if (isRecording) {
      stopRecording();
      setIsPlaying(false);
      return;
    }
    if (!isPlaying) {
      if (currentTime >= stageTimeline.totalDuration - 0.1) {
        setCurrentTime(0);
        setResetSignal((s) => s + 1);
      }
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  const handleExportVideo = () => {
    if (isRecording) {
      stopRecording();
      setIsPlaying(false);
      return;
    }
    setCurrentTime(0);
    setPlaybackSpeed(1);
    setResetSignal((s) => s + 1);
    const ok = startRecording();
    if (ok) {
      setIsPlaying(true);
    }
  };

  const progressPercent = Math.min(
    100,
    Math.max(0, (currentTime / stageTimeline.totalDuration) * 100)
  );

  // Group stages by Visit Title for the timeline list
  const groupedStages: Record<string, AnimationTimelineStage[]> = {};
  stages.forEach((st) => {
    const list = groupedStages[st.visitTitle] || [];
    list.push(st);
    groupedStages[st.visitTitle] = list;
  });

  const showcaseTabs: { id: string; label: string; badge?: string }[] = [
    { id: "plan", label: "Hasta Tedavi Planı", badge: `${planStages.length} Aşama` },
    { id: "all_10", label: "Tüm 10 Tedavi (Sıralı Tur)", badge: "10 Video" },
    { id: "showcase-1-extraction", label: "1. Diş Çekimi" },
    { id: "showcase-2-implant", label: "2. İmplant" },
    { id: "showcase-3-abutment", label: "3. Abutment" },
    { id: "showcase-4-root-canal", label: "4. Kanal Tedavisi" },
    { id: "showcase-5-filling", label: "5. Kompozit Dolgu" },
    { id: "showcase-6-sealant", label: "6. Fissür Örtücü" },
    { id: "showcase-7-crown", label: "7. Zirkonyum Kuron" },
    { id: "showcase-8-veneer", label: "8. Lamina Veneer" },
    { id: "showcase-9-bridge", label: "9. Zirkonyum Köprü" },
    { id: "showcase-10-scaling", label: "10. Diş Taşı Temizliği" },
  ];

  return (
    <div className="space-y-4">
      {/* 10 Clinical Treatments 3D Video Showcase & Mode Selector Bar */}
      <div
        className={`rounded-2xl border p-3.5 shadow-xs transition-colors ${
          darkMode
            ? "border-slate-800 bg-slate-900/95 text-white"
            : "border-slate-200 bg-white text-slate-900"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <Video
              className={`size-4 ${
                darkMode ? "text-cyan-400" : "text-blue-600"
              }`}
            />
            <span className="text-xs font-bold tracking-wide uppercase">
              3D Sinematik Tedavi Kütüphanesi (10 Tedavi Türü)
            </span>
          </div>
          <span
            className={`text-[11px] font-medium ${
              darkMode ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Tek tıkla istediğiniz tedavinin 3D animasyonunu izleyebilir veya 1080p MP4 videosunu indirebilirsiniz
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {showcaseTabs.map((tab) => {
            const active = selectedShowcaseId === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                disabled={isRecording}
                onClick={() => handleSelectShowcase(tab.id)}
                className={`flex items-center gap-1.5 shrink-0 rounded-xl border px-3 py-1.5 text-xs font-semibold transition cursor-pointer disabled:opacity-45 ${
                  active
                    ? darkMode
                      ? "border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-2xs"
                      : "border-slate-900 bg-slate-900 text-white shadow-2xs"
                    : darkMode
                      ? "border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800"
                      : "border-slate-200/80 bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`rounded-md px-1.5 py-0.2 text-[10px] font-mono ${
                      active
                        ? darkMode
                          ? "bg-cyan-400/25 text-cyan-100"
                          : "bg-white/20 text-white"
                        : darkMode
                          ? "bg-slate-800 text-slate-400"
                          : "bg-slate-200/70 text-slate-600"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left 7 Columns: 3D Three.js Viewport & Bottom Media Player */}
      <div className="lg:col-span-7 flex flex-col space-y-4">
        {/* 3D Model Canvas */}
        <ThreeMouthCanvas
          currentStage={activeStage}
          allStages={stages}
          stageIndex={currentStageIndex}
          conditions={conditions}
          isPlaying={isPlaying}
          playbackSpeed={playbackSpeed}
          stageElapsedSeconds={stageElapsedSeconds}
          onStepComplete={handleNext}
          isActive={isActive}
          resetSignal={resetSignal}
          isRecording={isRecording}
          onAfterRender={handleAfterRender}
        />

        {/* Media Player Controls */}
        <div
          className={`rounded-2xl border p-4 shadow-xs transition-colors ${
            darkMode
              ? "border-slate-800 bg-slate-900 text-white"
              : "border-slate-200 bg-white text-slate-900"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Step info */}
            <div>
              <div
                className={`text-[11px] font-bold uppercase tracking-wider ${
                  darkMode ? "text-cyan-400" : "text-slate-400"
                }`}
              >
                Aşama {currentStageIndex + 1} / {stages.length}
              </div>
              <div
                className={`text-sm font-bold ${
                  darkMode ? "text-white" : "text-slate-900"
                }`}
              >
                {activeStage.stageName}
              </div>
            </div>

            {/* Playback Buttons */}
            <div className="flex items-center gap-2 self-center">
              <button
                type="button"
                onClick={handleRestart}
                disabled={currentStageIndex === 0 && !isRecording}
                className={`rounded-xl border p-2.5 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-2xs ${
                  darkMode
                    ? "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                }`}
                title="En Başa Dön (1. Aşama)"
              >
                <RotateCcw className="size-4" />
              </button>

              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStageIndex === 0 || isRecording}
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
                  <Pause
                    className={`size-5 ${
                      darkMode ? "fill-slate-950" : "fill-white"
                    }`}
                  />
                ) : (
                  <Play
                    className={`size-5 ml-0.5 ${
                      darkMode ? "fill-slate-950" : "fill-white"
                    }`}
                  />
                )}
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={currentStageIndex === stages.length - 1 || isRecording}
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

            {/* Speed & Video Export Controls */}
            <div className="flex items-center gap-2.5 self-center sm:self-auto">
              <div
                className={`flex items-center gap-1 rounded-xl p-1 text-[11px] font-semibold ${
                  darkMode
                    ? "bg-slate-800 text-slate-300"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {[0.5, 0.75, 1, 1.5, 2].map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    disabled={isRecording}
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`rounded-lg px-2 py-0.5 transition cursor-pointer disabled:opacity-40 ${
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

              <button
                type="button"
                onClick={handleExportVideo}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition cursor-pointer shadow-2xs ${
                  isRecording
                    ? "border-rose-500/60 bg-rose-500/15 text-rose-400 hover:bg-rose-500/25"
                    : darkMode
                      ? "border-cyan-500/40 bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25"
                      : "border-slate-200 bg-slate-900 text-white hover:bg-slate-800"
                }`}
                title="Tüm Tedavi Planını 1080p 60fps Sinematik Video Olarak Kaydet ve İndir"
              >
                {isRecording ? (
                  <>
                    <Square className="size-3.5 fill-current" />
                    <span>Kaydı Bitir (%{recordingProgress})</span>
                  </>
                ) : (
                  <>
                    <Video className="size-3.5" />
                    <span className="hidden xl:inline">Videoyu İndir</span>
                    <Download className="size-3 xl:hidden" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Timeline progress scrubber */}
          <div
            className={`mt-3.5 pt-3 border-t ${
              darkMode ? "border-slate-800" : "border-slate-100"
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-mono font-medium text-slate-400 mb-1.5 px-0.5">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(stageTimeline.totalDuration)}</span>
            </div>
            <div
              className={`relative w-full h-2.5 rounded-full cursor-pointer group select-none ${
                darkMode ? "bg-slate-800" : "bg-slate-100"
              }`}
              title="Aşamalara atlamak için tıklayın"
              onClick={(e) => {
                if (isRecording) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const ratio = Math.max(0, Math.min(1, clickX / rect.width));
                setCurrentTime(ratio * stageTimeline.totalDuration);
              }}
            >
              {/* Visual stage tick dividers */}
              {stageTimeline.items.map((it, idx) => {
                if (idx === 0) return null;
                const leftPercent =
                  (it.start / stageTimeline.totalDuration) * 100;
                return (
                  <div
                    key={idx}
                    className={`absolute top-0 bottom-0 w-0.5 z-10 ${
                      darkMode ? "bg-slate-900/80" : "bg-white/80"
                    }`}
                    style={{ left: `${leftPercent}%` }}
                  />
                );
              })}

              {/* Filled progress bar */}
              <div
                className={`h-full rounded-full ${
                  isRecording
                    ? "bg-rose-500"
                    : darkMode
                      ? "bg-cyan-400 group-hover:bg-cyan-300"
                      : "bg-slate-900 group-hover:bg-blue-600"
                }`}
                style={{
                  width: `${progressPercent}%`,
                }}
              />

              {/* Scrubber thumb circle */}
              <div
                className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-3.5 rounded-full border-2 shadow-sm transition-transform group-hover:scale-125 ${
                  isRecording
                    ? "bg-rose-500 border-slate-900 ring-2 ring-rose-500/40"
                    : darkMode
                      ? "bg-cyan-400 border-slate-900 ring-2 ring-cyan-400/40"
                      : "bg-white border-slate-900 ring-2 ring-slate-900/20"
                }`}
                style={{ left: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right 5 Columns: Chronological Treatment Stages Timeline */}
      <div
        className={`lg:col-span-5 rounded-2xl border p-5 shadow-xs space-y-4 ${
          darkMode
            ? "border-slate-800 bg-slate-900 text-white"
            : "border-slate-200 bg-white text-slate-900"
        }`}
      >
        <div
          className={`flex items-center justify-between border-b pb-3 ${
            darkMode ? "border-slate-800" : "border-slate-100"
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`size-2 rounded-full ${
                darkMode
                  ? "bg-cyan-400 ring-2 ring-cyan-400/20"
                  : "bg-blue-600 ring-2 ring-blue-100"
              }`}
            />
            <h3
              className={`text-sm font-bold ${
                darkMode ? "text-white" : "text-slate-900"
              }`}
            >
              Tedavi Süreç Takvimi
            </h3>
          </div>
          <span
            className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
              darkMode
                ? "bg-slate-800 text-slate-300"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {currentStageIndex + 1} / {stages.length}
          </span>
        </div>

        {/* Grouped stages list */}
        <div className="space-y-4 max-h-[560px] overflow-y-auto pr-1">
          {Object.entries(groupedStages).map(([visitTitle, vStages]) => (
            <div key={visitTitle} className="space-y-1.5">
              {/* Visit Header */}
              <div
                className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold ${
                  darkMode
                    ? "border-slate-800 bg-slate-950/60 text-cyan-300"
                    : "border-slate-200/70 bg-slate-50 text-slate-700"
                }`}
              >
                <Calendar
                  className={`size-3.5 ${
                    darkMode ? "text-cyan-400" : "text-slate-500"
                  }`}
                />
                <span>{visitTitle}</span>
              </div>

              {/* Stages under this visit */}
              <div className="space-y-1 pl-1">
                {vStages.map((st, sIdx) => {
                  const stageIndex = stages.indexOf(st);
                  const isStageActive = stageIndex === currentStageIndex;
                  const isPassed = stageIndex < currentStageIndex;

                  return (
                    <div
                      key={
                        st.id
                          ? `${st.id}-${sIdx}`
                          : `stage-${stageIndex >= 0 ? stageIndex : sIdx}`
                      }
                      onClick={() => {
                        if (isRecording) return;
                        if (stageIndex >= 0) {
                          const target = stageTimeline.items[stageIndex];
                          if (target) {
                            setCurrentTime(target.start);
                          }
                          setIsPlaying(false);
                        }
                      }}
                      title={st.description}
                      className={`group flex items-center justify-between rounded-xl px-3 py-2.5 transition cursor-pointer border ${
                        isStageActive
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
                        {isStageActive ? (
                          <div
                            className={`size-2 rounded-full ring-4 shrink-0 ${
                              darkMode
                                ? "bg-cyan-400 ring-cyan-400/25"
                                : "bg-blue-400 ring-blue-400/25"
                            }`}
                          />
                        ) : isPassed ? (
                          <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <div
                            className={`size-2 rounded-full shrink-0 ${
                              darkMode ? "bg-slate-700" : "bg-slate-300"
                            }`}
                          />
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
                                isStageActive
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
    </div>
  );
}
