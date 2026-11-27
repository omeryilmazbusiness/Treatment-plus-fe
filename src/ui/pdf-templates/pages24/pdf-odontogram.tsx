import React from "react";
import {
  AnatomicalToothSvg,
  LOWER_TEETH_FDI,
  TOOTH_METADATA,
  UPPER_TEETH_FDI,
} from "@/ui/treatment-studio/anatomical-tooth-svg";
import type { ToothCondition } from "@/ui/treatment-studio/types";
import type {
  PdfPlanData,
  PdfToothCondition,
  PlanVisit,
  TreatmentItem,
} from "../types";

export const ALL_FDI_TEETH: readonly string[] = [...UPPER_TEETH_FDI, ...LOWER_TEETH_FDI];
const UPPER_TEETH_LIST: readonly string[] = UPPER_TEETH_FDI;
const LOWER_TEETH_LIST: readonly string[] = LOWER_TEETH_FDI;

const VALID_CONDITIONS = new Set<string>([
  "intact",
  "missing",
  "filled",
  "caries",
  "root_canal",
  "implant",
  "crown",
  "bridge",
]);

export function normalizeToothCondition(raw?: string | null): PdfToothCondition {
  if (!raw) return "intact";
  const s = raw.trim().toLowerCase();
  if (VALID_CONDITIONS.has(s)) return s as PdfToothCondition;
  if (s === "cavity" || s.includes("çürük") || s.includes("curuk") || s.includes("caries")) {
    return "caries";
  }
  if (s === "healthy" || s.includes("sağlam") || s.includes("saglam") || s.includes("intact")) {
    return "intact";
  }
  if (s.includes("missing") || s.includes("eksik")) {
    return "missing";
  }
  if (s.includes("filled") || s.includes("dolgu") || s.includes("amalgam") || s.includes("kompozit")) {
    return "filled";
  }
  if (s.includes("root_canal") || s.includes("kanal") || s.includes("endo")) {
    return "root_canal";
  }
  if (s.includes("implant")) {
    return "implant";
  }
  if (s.includes("bridge") || s.includes("köprü") || s.includes("kopru")) {
    return "bridge";
  }
  if (s.includes("crown") || s.includes("kuron") || s.includes("kron") || s.includes("kaplama") || s.includes("zirkon")) {
    return "crown";
  }
  return "intact";
}

export function getConditionLabel(
  cond: PdfToothCondition,
  locale: "tr" | "en" = "tr",
  customNote?: string
): string {
  const isEn = locale === "en";
  let base = "";
  switch (cond) {
    case "missing":
      base = isEn ? "Missing" : "Eksik Diş";
      break;
    case "filled":
      base = isEn ? "Filled" : "Dolgulu";
      break;
    case "caries":
      base = isEn ? "Caries / Decay" : "Çürük";
      break;
    case "root_canal":
      base = isEn ? "Root Canal Treated" : "Kanal Tedavili";
      break;
    case "implant":
      base = isEn ? "Implant" : "İmplant";
      break;
    case "crown":
      base = isEn ? "Crown" : "Kuron Kaplama";
      break;
    case "bridge":
      base = isEn ? "Bridge" : "Köprü";
      break;
    case "intact":
    default:
      base = isEn ? "Intact" : "Sağlam";
      break;
  }
  if (customNote && customNote.trim() && customNote.trim().toLowerCase() !== base.toLowerCase()) {
    // Eğer customNote zaten durum kodunun kendisi değilse göster
    if (!VALID_CONDITIONS.has(customNote.trim().toLowerCase())) {
      return customNote.trim();
    }
  }
  return base;
}

/**
 * PdfPlanData içindeki toothConditions ve diagnoses alanlarından
 * 32 dişin tamamı için kesin teşhis haritasını (Record<tooth, { condition, label, note }>) üretir.
 */
export function resolvePatientDiagnosisMap(data: PdfPlanData): Record<
  string,
  {
    condition: PdfToothCondition;
    label: string;
    note?: string;
  }
> {
  const isEn = data.locale === "en";
  const result: Record<
    string,
    { condition: PdfToothCondition; label: string; note?: string }
  > = {};

  // 1. Önce tüm 32 dişi Sağlam (Intact) olarak başlat
  for (const tooth of ALL_FDI_TEETH) {
    result[tooth] = {
      condition: "intact",
      label: isEn ? "Intact" : "Sağlam",
    };
  }

  // 2. data.diagnoses dizisi varsa uygula
  if (Array.isArray(data.diagnoses)) {
    for (const d of data.diagnoses) {
      const tooth = String(d.toothNumber || "").trim();
      if (!tooth || !result[tooth]) continue;
      const cond = normalizeToothCondition(d.status || d.condition);
      const rawNote = d.note || ( !VALID_CONDITIONS.has((d.condition || "").trim().toLowerCase()) ? d.condition : undefined );
      result[tooth] = {
        condition: cond,
        label: getConditionLabel(cond, data.locale, rawNote),
        note: rawNote,
      };
    }
  }

  // 3. data.toothConditions doğrudan doktor teşhis haritası varsa (en yüksek öncelik) uygula
  if (data.toothConditions && typeof data.toothConditions === "object") {
    for (const [toothRaw, rawCond] of Object.entries(data.toothConditions)) {
      const tooth = toothRaw.trim();
      if (!tooth || !result[tooth]) continue;
      const cond = normalizeToothCondition(rawCond);
      const existingNote = result[tooth]?.note;
      result[tooth] = {
        condition: cond,
        label: getConditionLabel(cond, data.locale, existingNote),
        note: existingNote,
      };
    }
  }

  return result;
}

export function extractTeethFromItem(item: TreatmentItem): string[] {
  const set = new Set<string>();
  const addRaw = (raw?: string) => {
    if (!raw) return;
    // Handle range like "16-26" or "36-46"
    const rangeMatch = raw.trim().match(/^(\d{2})\s*-\s*(\d{2})$/);
    if (rangeMatch) {
      const start = rangeMatch[1] || "";
      const end = rangeMatch[2] || "";
      const upperIdx1 = UPPER_TEETH_LIST.indexOf(start);
      const upperIdx2 = UPPER_TEETH_LIST.indexOf(end);
      if (upperIdx1 !== -1 && upperIdx2 !== -1) {
        const min = Math.min(upperIdx1, upperIdx2);
        const max = Math.max(upperIdx1, upperIdx2);
        for (let i = min; i <= max; i++) {
          const t = UPPER_TEETH_FDI[i];
          if (t) set.add(t);
        }
        return;
      }
      const lowerIdx1 = LOWER_TEETH_LIST.indexOf(start);
      const lowerIdx2 = LOWER_TEETH_LIST.indexOf(end);
      if (lowerIdx1 !== -1 && lowerIdx2 !== -1) {
        const min = Math.min(lowerIdx1, lowerIdx2);
        const max = Math.max(lowerIdx1, lowerIdx2);
        for (let i = min; i <= max; i++) {
          const t = LOWER_TEETH_FDI[i];
          if (t) set.add(t);
        }
        return;
      }
    }

    for (const part of raw.split(/[,;\s]+/)) {
      const clean = part.replace(/[^0-9]/g, "").trim();
      if (clean && ALL_FDI_TEETH.includes(clean)) {
        set.add(clean);
      }
    }
  };

  if (Array.isArray(item.teeth)) {
    item.teeth.forEach((t) => addRaw(t));
  }
  if (item.toothNumber) {
    addRaw(item.toothNumber);
  }
  // Check parentheses in item name e.g. "Diş Çekimi (11, 13, 14)"
  const parenMatch = (item.treatmentName || item.name || "").match(/\(([^)]+)\)/g);
  if (parenMatch) {
    for (const m of parenMatch) {
      addRaw(m.slice(1, -1));
    }
  }
  return Array.from(set);
}

export type PlannedToothAction =
  | "extraction"
  | "implant"
  | "crown"
  | "bridge"
  | "filling"
  | "root_canal"
  | "veneer"
  | "other";

export function inferActionFromItem(item: TreatmentItem): PlannedToothAction {
  const s = `${item.treatmentType || ""} ${item.category || ""} ${item.treatmentName || ""} ${item.name || ""}`.toLowerCase();
  if (s.includes("çekim") || s.includes("cekim") || s.includes("extraction")) {
    return "extraction";
  }
  if (s.includes("implant") || s.includes("all-on-4") || s.includes("all-on-6") || s.includes("allon4")) {
    return "implant";
  }
  if (s.includes("köprü") || s.includes("kopru") || s.includes("bridge")) {
    return "bridge";
  }
  if (s.includes("lamina") || s.includes("veneer") || s.includes("yaprak")) {
    return "veneer";
  }
  if (
    s.includes("kuron") ||
    s.includes("kron") ||
    s.includes("crown") ||
    s.includes("zirkon") ||
    s.includes("kaplama") ||
    s.includes("protez")
  ) {
    return "crown";
  }
  if (s.includes("kanal") || s.includes("endo") || s.includes("root")) {
    return "root_canal";
  }
  if (s.includes("dolgu") || s.includes("filling") || s.includes("kompozit") || s.includes("inley")) {
    return "filling";
  }
  return "other";
}

/**
 * Sayfa 8: Doktorun girdiği Mevcut Ağız Durumu (Teşhis) Odontogramı.
 * Hastanın 32 dişini anatomik vektörel çizimle ve doktorun seçtiği teşhislerle (Eksik, Çürük, Dolgulu, Kanal, Kuron, İmplant, Köprü, Sağlam) gösterir.
 */
export function PdfCurrentSituationOdontogram({
  data,
}: {
  data: PdfPlanData;
}) {
  const isEn = data.locale === "en";
  const diagMap = resolvePatientDiagnosisMap(data);

  const conditionCounts = ALL_FDI_TEETH.reduce(
    (acc, t) => {
      const c = diagMap[t]?.condition || "intact";
      acc[c] = (acc[c] || 0) + 1;
      return acc;
    },
    {} as Record<PdfToothCondition, number>
  );

  const legendItems: { key: PdfToothCondition; label: string; dot: string }[] = [
    { key: "intact", label: isEn ? "Intact" : "Sağlam", dot: "bg-emerald-500" },
    { key: "missing", label: isEn ? "Missing" : "Eksik", dot: "bg-rose-500" },
    { key: "caries", label: isEn ? "Caries" : "Çürük", dot: "bg-amber-600" },
    { key: "filled", label: isEn ? "Filled" : "Dolgulu", dot: "bg-sky-500" },
    { key: "root_canal", label: isEn ? "Root Canal" : "Kanal", dot: "bg-purple-500" },
    { key: "crown", label: isEn ? "Crown" : "Kuron", dot: "bg-amber-400" },
    { key: "bridge", label: isEn ? "Bridge" : "Köprü", dot: "bg-indigo-500" },
    { key: "implant", label: isEn ? "Implant" : "İmplant", dot: "bg-teal-500" },
  ];

  const renderArchRow = (teeth: readonly string[], jaw: "upper" | "lower") => {
    const isUpper = jaw === "upper";
    return (
      <div
        className="grid grid-cols-16 gap-0.5 items-center justify-items-center w-full"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(16, minmax(0, 1fr))",
        }}
      >
        {teeth.map((tooth, idx) => {
          const entry = diagMap[tooth];
          const cond = (entry?.condition || "intact") as ToothCondition;
          const isAbnormal = cond !== "intact";
          const meta = TOOTH_METADATA[tooth];
          const prevTooth = idx > 0 ? teeth[idx - 1] : undefined;
          const nextTooth = idx < teeth.length - 1 ? teeth[idx + 1] : undefined;
          const prevCond = prevTooth ? diagMap[prevTooth]?.condition : undefined;
          const nextCond = nextTooth ? diagMap[nextTooth]?.condition : undefined;

          const connectLeft =
            cond === "bridge" &&
            (prevCond === "bridge" || prevCond === "crown" || prevCond === "implant");
          const connectRight =
            cond === "bridge" &&
            (nextCond === "bridge" || nextCond === "crown" || nextCond === "implant");

          const numberBadge = (
            <span
              className={`inline-flex items-center justify-center w-[20px] h-[20px] size-[20px] rounded-full text-[10px] font-bold leading-none ${
                cond === "missing"
                  ? "text-slate-400 line-through"
                  : isAbnormal
                  ? "border-[1.5px] border-slate-700 text-slate-900 bg-slate-100"
                  : "text-slate-500"
              }`}
            >
              {tooth}
            </span>
          );

          const toothGraphic = (
            <div className="h-[58px] w-full max-w-[34px] flex items-center justify-center">
              <AnatomicalToothSvg
                fdi={`p8-${tooth}`}
                jaw={jaw}
                type={meta?.type || "molar"}
                condition={cond}
                isSelected={false}
                connectLeft={connectLeft}
                connectRight={connectRight}
              />
            </div>
          );

          return (
            <div
              key={tooth}
              className="flex flex-col items-center justify-center w-full"
            >
              {isUpper ? (
                <>
                  {toothGraphic}
                  <div className="mt-1">{numberBadge}</div>
                </>
              ) : (
                <>
                  <div className="mb-1">{numberBadge}</div>
                  {toothGraphic}
                </>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full bg-white rounded-2xl px-4 py-3 border border-slate-200/80 shadow-2xs">
      {/* Üst Başlık ve Durum Lejantı */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
          {isEn ? "Clinical FDI Dental Chart (Diagnosis)" : "Klinik FDI Diş Şeması (Hekim Teşhisi)"}
        </span>
        <div className="flex flex-wrap items-center gap-2.5">
          {legendItems
            .filter((item) => item.key === "intact" || item.key === "missing" || (conditionCounts[item.key] || 0) > 0)
            .map((item) => (
              <span key={item.key} className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600">
                <span className={`w-2 h-2 size-2 rounded-full ${item.dot}`} />
                <span>{item.label}</span>
                {conditionCounts[item.key] ? (
                  <span className="text-slate-400 font-mono">({conditionCounts[item.key]})</span>
                ) : null}
              </span>
            ))}
        </div>
      </div>

      {/* Üst Çene (18 - 28) */}
      <div className="relative">
        {renderArchRow(UPPER_TEETH_FDI, "upper")}

        {/* Oklüzal Yatay & Orta Hat Çizgisi */}
        <div className="my-1.5 border-t border-slate-300/80 relative flex items-center justify-between px-1">
          <span className="text-[8.5px] font-bold uppercase tracking-widest text-slate-400 bg-white pr-2">
            {isEn ? "RIGHT (R)" : "SAĞ (R)"}
          </span>
          <span className="text-[8.5px] font-bold uppercase tracking-widest text-slate-400 bg-white pl-2">
            {isEn ? "LEFT (L)" : "SOL (L)"}
          </span>
        </div>

        {/* Alt Çene (48 - 38) */}
        {renderArchRow(LOWER_TEETH_FDI, "lower")}
      </div>
    </div>
  );
}

/**
 * Sayfa 10 (1. Seans) ve Sayfa 12 (2. Seans):
 * Doktorun teşhisine (existing diagnosis) ve ilgili seansta yapılacak işlemlere göre
 * doğru şekillenen dinamik diş haritası.
 */
export function PdfVisitOdontogram({
  data,
  visitIndex,
  visitItems,
  visit,
}: {
  data: PdfPlanData;
  visitIndex: number;
  visitItems: TreatmentItem[];
  visit?: PlanVisit;
}) {
  const isEn = data.locale === "en";
  const diagMap = resolvePatientDiagnosisMap(data);

  // Bu seansta hangi dişlere hangi işlem uygulanıyor?
  const visitActionsByTooth = new Map<string, PlannedToothAction[]>();
  const highlightedTeeth = new Set<string>(visit?.chartTeeth || []);

  for (const item of visitItems) {
    const teeth = extractTeethFromItem(item);
    const action = inferActionFromItem(item);
    for (const t of teeth) {
      highlightedTeeth.add(t);
      const list = visitActionsByTooth.get(t) || [];
      if (!list.includes(action)) {
        list.push(action);
      }
      visitActionsByTooth.set(t, list);
    }
  }

  // Eğer 2. seans (veya sonraki seans) ise, 1. seansta yapılan çekim/implantları da baz al
  const priorVisitActionsByTooth = new Map<string, PlannedToothAction[]>();
  if (visitIndex > 0 && Array.isArray(data.visits) && data.visits[0]?.items) {
    for (const item of data.visits[0].items) {
      const teeth = extractTeethFromItem(item);
      const action = inferActionFromItem(item);
      for (const t of teeth) {
        const list = priorVisitActionsByTooth.get(t) || [];
        if (!list.includes(action)) list.push(action);
        priorVisitActionsByTooth.set(t, list);
      }
    }
  }

  // Her bir diş için bu seanstaki efektif görsel durumu hesapla
  const computeToothVisual = (tooth: string): {
    condition: ToothCondition;
    isTreatedInVisit: boolean;
    isExtractedInVisit: boolean;
    actionBadge?: string;
  } => {
    const baseDiag = diagMap[tooth]?.condition || "intact";
    const actions = visitActionsByTooth.get(tooth) || [];
    const priorActions = priorVisitActionsByTooth.get(tooth) || [];
    const isHighlighted = highlightedTeeth.has(tooth);

    // Bu seansta doğrudan işlem gören dişler:
    if (actions.length > 0) {
      if (actions.includes("implant")) {
        return {
          condition: "implant",
          isTreatedInVisit: true,
          isExtractedInVisit: actions.includes("extraction"),
          actionBadge: isEn ? "Implant" : "İmplant",
        };
      }
      if (actions.includes("bridge")) {
        return {
          condition: "bridge",
          isTreatedInVisit: true,
          isExtractedInVisit: false,
          actionBadge: isEn ? "Bridge" : "Köprü",
        };
      }
      if (actions.includes("crown") || actions.includes("veneer")) {
        return {
          condition: "crown",
          isTreatedInVisit: true,
          isExtractedInVisit: false,
          actionBadge: isEn ? "Crown" : "Kuron",
        };
      }
      if (actions.includes("root_canal")) {
        return {
          condition: "root_canal",
          isTreatedInVisit: true,
          isExtractedInVisit: false,
          actionBadge: isEn ? "Endo" : "Kanal",
        };
      }
      if (actions.includes("filling")) {
        return {
          condition: "filled",
          isTreatedInVisit: true,
          isExtractedInVisit: false,
          actionBadge: isEn ? "Filling" : "Dolgu",
        };
      }
      if (actions.includes("extraction")) {
        return {
          condition: "missing",
          isTreatedInVisit: true,
          isExtractedInVisit: true,
          actionBadge: isEn ? "Extract" : "Çekim",
        };
      }
      // Diğer işlemler (beyazlatma, temizlik vb.) veya chartTeeth ile seçilenler
      return {
        condition: baseDiag === "missing" ? "implant" : (baseDiag as ToothCondition),
        isTreatedInVisit: true,
        isExtractedInVisit: false,
      };
    }

    // Eğer seansın chartTeeth listesinde işaretlenmiş ama kalemlerde özel eşleşmemişse:
    if (isHighlighted) {
      return {
        condition: baseDiag === "missing" ? "implant" : baseDiag === "caries" ? "filled" : (baseDiag as ToothCondition),
        isTreatedInVisit: true,
        isExtractedInVisit: false,
      };
    }

    // Önceki seansta (1. seans) bu dişe ne yapıldı?
    if (priorActions.includes("implant")) {
      return {
        condition: "implant",
        isTreatedInVisit: false,
        isExtractedInVisit: false,
      };
    }
    if (priorActions.includes("extraction")) {
      return {
        condition: "missing",
        isTreatedInVisit: false,
        isExtractedInVisit: false,
      };
    }
    if (priorActions.includes("bridge")) {
      return {
        condition: "bridge",
        isTreatedInVisit: false,
        isExtractedInVisit: false,
      };
    }
    if (priorActions.includes("crown") || priorActions.includes("veneer")) {
      return {
        condition: "crown",
        isTreatedInVisit: false,
        isExtractedInVisit: false,
      };
    }
    if (priorActions.includes("root_canal")) {
      return {
        condition: "root_canal",
        isTreatedInVisit: false,
        isExtractedInVisit: false,
      };
    }
    if (priorActions.includes("filling")) {
      return {
        condition: "filled",
        isTreatedInVisit: false,
        isExtractedInVisit: false,
      };
    }

    // Hiçbir seans işlemi yoksa doktorun teşhisindeki mevcut durumu koru!
    return {
      condition: baseDiag as ToothCondition,
      isTreatedInVisit: false,
      isExtractedInVisit: false,
    };
  };

  const visualMap: Record<string, ReturnType<typeof computeToothVisual>> = {};
  for (const t of ALL_FDI_TEETH) {
    visualMap[t] = computeToothVisual(t);
  }

  const renderVisitArchRow = (teeth: readonly string[], jaw: "upper" | "lower") => {
    const isUpper = jaw === "upper";
    return (
      <div
        className="grid grid-cols-16 gap-0.5 items-center justify-items-center w-full"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(16, minmax(0, 1fr))",
        }}
      >
        {teeth.map((tooth, idx) => {
          const vis = visualMap[tooth]!;
          const cond = vis.condition;
          const meta = TOOTH_METADATA[tooth];
          const prevTooth = idx > 0 ? teeth[idx - 1] : undefined;
          const nextTooth = idx < teeth.length - 1 ? teeth[idx + 1] : undefined;
          const prevCond = prevTooth ? visualMap[prevTooth]?.condition : undefined;
          const nextCond = nextTooth ? visualMap[nextTooth]?.condition : undefined;

          const connectLeft =
            cond === "bridge" &&
            (prevCond === "bridge" || prevCond === "crown" || prevCond === "implant");
          const connectRight =
            cond === "bridge" &&
            (nextCond === "bridge" || nextCond === "crown" || nextCond === "implant");

          const numberBadge = (
            <span
              className={`inline-flex items-center justify-center w-[20px] h-[20px] size-[20px] rounded-full text-[10px] font-bold leading-none transition-all ${
                vis.isExtractedInVisit
                  ? "bg-rose-100 text-rose-700 border-[1.5px] border-rose-500"
                  : vis.isTreatedInVisit
                  ? "bg-[#70B66B]/20 text-[#2d6a29] border-[1.5px] border-[#70B66B]"
                  : cond === "missing"
                  ? "text-slate-300"
                  : "text-slate-500"
              }`}
            >
              {tooth}
            </span>
          );

          const toothGraphic = (
            <div className="relative h-[56px] w-full max-w-[34px] flex items-center justify-center">
              <AnatomicalToothSvg
                fdi={`v${visitIndex}-${tooth}`}
                jaw={jaw}
                type={meta?.type || "molar"}
                condition={cond}
                isSelected={vis.isTreatedInVisit && !vis.isExtractedInVisit}
                hasTreatments={vis.isTreatedInVisit && !vis.isExtractedInVisit}
                connectLeft={connectLeft}
                connectRight={connectRight}
              />
            </div>
          );

          return (
            <div
              key={tooth}
              className="flex flex-col items-center justify-center w-full"
            >
              {isUpper ? (
                <>
                  {toothGraphic}
                  <div className="mt-1">{numberBadge}</div>
                </>
              ) : (
                <>
                  <div className="mb-1">{numberBadge}</div>
                  {toothGraphic}
                </>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full bg-white rounded-2xl px-4 py-2.5 border border-slate-200/80 shadow-2xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-1.5">
        <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-700">
          {isEn
            ? `Visit ${visitIndex + 1} Dental Map (Based on Diagnosis & Plan)`
            : `${visitIndex + 1}. Seans Diş Haritası (Teşhis & Tedavi Planı)`}
        </span>
        <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-600">
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 size-2 rounded-full bg-[#10b981]" />
            <span>{isEn ? "Planned in this visit" : "Bu seansta işlem gören"}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 size-2 rounded-full bg-rose-500" />
            <span>{isEn ? "Missing / Extraction" : "Eksik / Çekim"}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 size-2 rounded-full bg-slate-300" />
            <span>{isEn ? "Existing tooth" : "Mevcut diş durumu"}</span>
          </span>
        </div>
      </div>

      {/* Üst Çene */}
      {renderVisitArchRow(UPPER_TEETH_FDI, "upper")}

      {/* Orta Hat */}
      <div className="my-1 border-t border-slate-300/80 relative flex items-center justify-between px-1">
        <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 bg-white pr-2">
          {isEn ? "RIGHT (R)" : "SAĞ (R)"}
        </span>
        <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 bg-white pl-2">
          {isEn ? "LEFT (L)" : "SOL (L)"}
        </span>
      </div>

      {/* Alt Çene */}
      {renderVisitArchRow(LOWER_TEETH_FDI, "lower")}
    </div>
  );
}
