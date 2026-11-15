export type ToothCondition =
  | "intact"
  | "missing"
  | "filled"
  | "caries"
  | "root_canal"
  | "implant"
  | "crown"
  | "bridge";

export type TreatmentType =
  | "extraction"
  | "prosthesis_removal"
  | "filling"
  | "fissure"
  | "dentures"
  | "root_canal"
  | "implant"
  | "abutment"
  | "crown"
  | "veneer"
  | "bridge"
  | "scaling"
  | "general"
  | "other";

export function inferTreatmentType(name: string, code?: string): TreatmentType {
  const s = `${code || ""} ${name || ""}`.toLowerCase();
  if (s.includes("abutment") || s.includes("multi-unit") || s.includes("iyileşme başlığı") || s.includes("dayanak")) {
    return "abutment";
  }
  if (s.includes("implant")) return "implant";
  if (s.includes("fissür") || s.includes("fissur") || s.includes("sealant")) {
    return "fissure";
  }
  if (s.includes("lamina") || s.includes("veneer") || s.includes("yaprak")) {
    return "veneer";
  }
  if (s.includes("detertraj") || s.includes("scaling") || s.includes("diş taşı") || s.includes("dis tasi") || s.includes("polisaj")) {
    return "scaling";
  }
  if (
    s.includes("dolgu") ||
    s.includes("kompozit") ||
    s.includes("filling") ||
    s.includes("bonding") ||
    s.includes("inley") ||
    s.includes("onley")
  ) {
    return "filling";
  }
  if (s.includes("kanal") || s.includes("endo") || s.includes("root")) {
    return "root_canal";
  }
  if (s.includes("çekim") || s.includes("cekim") || s.includes("extraction")) {
    return "extraction";
  }
  if (s.includes("köprü") || s.includes("kopru") || s.includes("bridge") || s.includes("pontic")) {
    return "bridge";
  }
  if (
    s.includes("kuron") ||
    s.includes("kron") ||
    s.includes("crown") ||
    s.includes("zirkon") ||
    s.includes("kaplama") ||
    s.includes("e-max") ||
    s.includes("emax")
  ) {
    return "crown";
  }
  if (s.includes("söküm") || s.includes("sokum") || s.includes("removal")) {
    return "prosthesis_removal";
  }
  if (s.includes("protez") || s.includes("denture") || s.includes("total") || s.includes("hareketli")) {
    return "dentures";
  }
  if (
    s.includes("röntgen") ||
    s.includes("rontgen") ||
    s.includes("xray") ||
    s.includes("bakım") ||
    s.includes("profilaksi") ||
    s.includes("muayene") ||
    s.includes("beyazlatma") ||
    s.includes("plak")
  ) {
    return "general";
  }
  return "other";
}

export interface ToothDiagnosisData {
  condition: ToothCondition;
  cariesSeverity?: "mild" | "moderate" | "severe";
  notes?: string;
}

export interface StudioPlanItem {
  id: string;
  treatmentId?: string;
  treatmentCode?: string;
  treatmentType: TreatmentType | string;
  treatmentName: string;
  teeth: string[];
  quantity: number;
  unitPrice: number; // in EUR or major currency units
  isPackage?: boolean;
  visitId: string;
  description?: string;
  animationCode?: string;
}

export interface PlanDiscount {
  id?: string;
  label: string;
  amount: number; // minor units (kuruş)
  order_num?: number;
}

export interface StudioVisit {
  id: string;
  orderNum: number;
  title: string;
  phaseLabel: string;
  healingNote?: string;
  healingMonths?: number;
  chartTeeth: string[];
}

export interface SavedDraftTemplate {
  id: string;
  title: string;
  tag: "full" | "upper" | "lower" | "other";
  category: "all" | "full_mouth" | "upper_jaw" | "lower_jaw" | "other";
  isStarred?: boolean;
  packageUpperPrice?: number;
  packageLowerPrice?: number;
  items: Array<{
    type: string;
    label: string;
    teeth: string[];
    price?: number;
  }>;
  notice?: string;
}

export interface XRaySettings {
  zoom: number; // percentage 100-300
  brightness: number; // percentage 50-200
  contrast: number; // percentage 50-200
  isInverted: boolean;
  rotation: number; // degrees 0, 90, 180, 270
}

export type AnimationActionType =
  | "extraction"
  | "implant"
  | "abutment"
  | "temporary_denture"
  | "healing"
  | "permanent_bridge"
  | "filling"
  | "sealant"
  | "root_canal"
  | "crown"
  | "veneer"
  | "scaling"
  | "cleaning"
  | "whitening"
  | "xray"
  | "sinus_graft"
  | "custom";

export interface AnimationTimelineStage {
  id: string;
  visitTitle: string;
  stageName: string;
  teeth: string[];
  actionType: AnimationActionType;
  durationSeconds: number;
  description: string;
  healingPeriod?: string;
}

export interface PatientInfo {
  name: string;
  id: string;
  dob: string; // YYYY-MM-DD
  phone?: string;
  email?: string;
  avatarUrl?: string;
}

export interface ClinicBrandInfo {
  name: string;
  doctorName: string;
  phone: string;
  whatsapp: string;
  address: string;
  stats: {
    satisfactionRate: string;
    yearsExperience: string;
    happySmiles: string;
  };
}

