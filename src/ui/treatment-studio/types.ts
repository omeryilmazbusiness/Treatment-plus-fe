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
  | "dentures"
  | "root_canal"
  | "implant"
  | "crown"
  | "bridge"
  | "general"
  | "other";

export interface ToothDiagnosisData {
  condition: ToothCondition;
  cariesSeverity?: "mild" | "moderate" | "severe";
  notes?: string;
}

export interface StudioPlanItem {
  id: string;
  treatmentType: TreatmentType;
  treatmentName: string;
  teeth: string[];
  quantity: number;
  unitPrice: number; // in EUR or major currency units
  isPackage?: boolean;
  visitId: string;
  description?: string;
  animationCode?: string;
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

export interface AnimationTimelineStage {
  id: string;
  visitTitle: string;
  stageName: string;
  teeth: string[];
  actionType: "extraction" | "implant" | "abutment" | "temporary_denture" | "healing" | "permanent_bridge" | "custom";
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

