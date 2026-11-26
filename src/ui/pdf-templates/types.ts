export type TemplateId =
  | "klinik-minimal"
  | "modern-geometric"
  | "botanical-serenity"
  | "liquid-art"
  | "noir-gold"
  | "royal-gold"
  | "classic-ribbon"
  | "executive-split"
  | "botanical-aesthetic"
  | "pediatric-joy"
  | "prestige-minimal";

export type PaletteKey = "navy" | "forest" | "rose" | "slate";

export interface PdfPalette {
  key: PaletteKey;
  name: string;
  label: string;
  primary: string;
  primaryHover: string;
  accent: string;
  light: string;
  border: string;
  ribbonDark: string;
  ribbonLight: string;
  ribbonPastel: string;
  textMain: string;
  textMuted: string;
  headingFont?: string;
  bodyFont?: string;
  cardBg?: string;
  coverBg?: string;
}

export interface TreatmentItem {
  name: string;
  treatmentName?: string;
  session?: string;
  amount: number;
  unitPrice?: number;
  description?: string;
  notes?: string;
  toothNumber?: string;
  quantity?: number;
  qty?: number;
  teeth?: string[];
  category?: string;
}

export interface ToothFinding {
  toothNumber: string;
  condition: string;
  treatment: string;
  status: "missing" | "cavity" | "implant" | "crown" | "healthy";
}

export interface PlanVisit {
  id: string;
  title: string;
  phaseLabel?: string;
  duration?: string;
  healingPeriod?: string;
  items: TreatmentItem[];
  subtotal?: number;
  note?: string;
}

export interface StatItem {
  value: string;
  label: string;
  description?: string;
}

export interface PdfPlanData {
  clinicName: string;
  slogan?: string;
  clinicSlogan?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  logoUrl?: string;
  doctorName?: string;
  doctorTitle?: string;
  doctorBio?: string;
  doctorPhotoUrl?: string | null;
  coordinatorName?: string;
  coordinatorPhotoUrl?: string | null;
  patientPhotoUrl?: string | null;
  planTitle?: string;
  proposalNo?: string;
  doctorStats?: StatItem[];
  welcomeBody?: string;
  welcomeText?: string;
  legalText?: string;
  kvkkText?: string;
  patientName?: string;
  patientId?: string;
  planNo?: string;
  dateStr?: string;
  date?: string;
  currency: "TRY" | "EUR" | "USD";
  locale: "tr" | "en";
  palette: PaletteKey;
  paletteKey?: PaletteKey;
  templateId: TemplateId;
  showMotifs: boolean;
  items: TreatmentItem[];
  grandTotal?: number;
  totalAmount?: number;
  clinicPhone?: string;
  clinicEmail?: string;
  clinicWebsite?: string;
  clinicAddress?: string;
  clinicLogoUrl?: string;

  // Kapsamlı Sunum Kitapçığı (Booklet) Alanları
  format?: "booklet" | "summary";
  activePage?: number; // 1-12 arası tek bir sayfayı önizlemek için (tanımsızsa tüm sayfalar)
  aboutText?: string;
  highlights?: StatItem[];
  labStats?: StatItem[];
  hotelDetails?: {
    name?: string;
    text?: string;
    imageKey?: string;
  };
  diagnoses?: ToothFinding[];
  visits?: PlanVisit[];
}
