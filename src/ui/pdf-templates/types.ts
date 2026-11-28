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
export type PdfLocale = "tr" | "en" | "ar" | "ru";

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

export type PdfToothCondition =
  | "intact"
  | "missing"
  | "filled"
  | "caries"
  | "root_canal"
  | "implant"
  | "crown"
  | "bridge";

export interface TreatmentItem {
  name: string;
  treatmentName?: string;
  treatmentType?: string;
  session?: string;
  visitId?: string;
  amount: number;
  unitPrice?: number;
  description?: string;
  notes?: string;
  toothNumber?: string;
  quantity?: number;
  qty?: number;
  teeth?: string[];
  category?: string;
  isPackage?: boolean;
}

export interface ToothFinding {
  toothNumber: string;
  condition: string;
  treatment?: string;
  note?: string;
  status:
    | "missing"
    | "cavity"
    | "caries"
    | "filled"
    | "root_canal"
    | "implant"
    | "crown"
    | "bridge"
    | "healthy"
    | "intact";
}

export interface PlanVisit {
  id: string;
  title: string;
  phaseLabel?: string;
  duration?: string;
  healingPeriod?: string;
  chartTeeth?: string[];
  items: TreatmentItem[];
  subtotal?: number;
  note?: string;
}

export interface StatItem {
  value: string;
  label: string;
  description?: string;
}

export interface PdfDiscountItem {
  id?: string;
  label: string;
  amount: number;
}

export interface PdfPlanData {
  clinicName: string;
  slogan?: string;
  clinicSlogan?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  hours?: string;
  logoUrl?: string;
  doctorName?: string;
  doctorTitle?: string;
  doctorBio?: string;
  doctorPhotoUrl?: string | null;
  coordinatorName?: string;
  coordinatorPhotoUrl?: string | null;
  patientPhotoUrl?: string | null;
  xrayUrl?: string | null;
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
  locale: PdfLocale;
  palette: PaletteKey;
  paletteKey?: PaletteKey;
  templateId: TemplateId;
  showMotifs: boolean;
  items: TreatmentItem[];
  discounts?: PdfDiscountItem[];
  subtotal?: number;
  discountTotal?: number;
  grandTotal?: number;
  totalAmount?: number;
  clinicPhone?: string;
  clinicEmail?: string;
  clinicWebsite?: string;
  clinicAddress?: string;
  clinicLogoUrl?: string;

  // Kapsamlı Sunum Kitapçığı (Booklet) Alanları
  format?: "booklet" | "summary";
  activePage?: number; // 1-24 arası tek bir sayfayı önizlemek için (tanımsızsa tüm sayfalar)
  aboutText?: string;
  highlights?: StatItem[];
  labStats?: StatItem[];
  hotelDetails?: {
    name?: string;
    text?: string;
    imageKey?: string;
  };
  /** Diş bazlı doktor teşhisi haritası (ör. { "16": "missing", "24": "caries" }) */
  toothConditions?: Record<string, PdfToothCondition>;
  /** Genel teşhis ve klinik değerlendirme notları */
  generalDiagnoses?: string[];
  diagnoses?: ToothFinding[];
  visits?: PlanVisit[];
  /** Hasta paylaşım sayfası URL'i (ör. https://.../p/{token}) */
  shareUrl?: string;
  /** Hastanın 3D tedavi simülasyonunu doğrudan açan URL (ör. https://.../p/{token}?viz=1) */
  simulationUrl?: string;
}
