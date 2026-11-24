export interface ProcedurePreset {
  readonly id: string;
  readonly code: string;
  readonly label: string;
  readonly toothNumber: string;
  readonly duration: string;
  readonly accentHex: string;
  readonly ringHex: string;
  readonly description: string;
  readonly clinicalMetricLabel: string;
  readonly clinicalMetricValue: string;
}

export interface ClientLogoData {
  readonly id: string;
  readonly name: string;
  readonly href: string;
  readonly logoSrc: string;
  readonly logoWidth: number;
  readonly logoHeight: number;
}

export const DEFAULT_CLIENTS: readonly ClientLogoData[] = [
  {
    id: "novo-clinic",
    name: "Novo Clinic",
    href: "https://novogrouphealth.com/en/",
    logoSrc: "/novo-clinic-logo.png",
    logoWidth: 960,
    logoHeight: 402,
  },
] as const;

export interface ContactInfo {
  readonly email: string;
  readonly phone: string;
  readonly address: string;
}

export const DEFAULT_PROCEDURES: readonly ProcedurePreset[] = [
  {
    id: "implant",
    code: "IMP-36",
    label: "İmplant Cerrahisi",
    toothNumber: "#36",
    duration: "45 dk · 2 Faz",
    accentHex: "#2563eb",
    ringHex: "#38bdf8",
    description: "Titanyum fikstür + zirkonyum üst yapı katman simülasyonu",
    clinicalMetricLabel: "Kemik Uyumu",
    clinicalMetricValue: "D2 · %99.2 Stabilite",
  },
  {
    id: "endodontics",
    code: "END-14",
    label: "Kanal Tedavisi",
    toothNumber: "#14",
    duration: "35 dk · Tek Seans",
    accentHex: "#0284c7",
    ringHex: "#22d3ee",
    description: "Kök kanal anatomisi ve apikal lezyon iyileşme önizlemesi",
    clinicalMetricLabel: "Kanal Boyu",
    clinicalMetricValue: "21.5 mm · 3 Kök",
  },
  {
    id: "prosthetics",
    code: "ZIR-21",
    label: "Estetik Zirkonyum",
    toothNumber: "#11–#21",
    duration: "5 Gün · Dijital Ölçü",
    accentHex: "#4f46e5",
    ringHex: "#818cf8",
    description: "Gülüş hattı uyumu ve oklüzal temas noktası analizi",
    clinicalMetricLabel: "Estetik Uyum",
    clinicalMetricValue: "Vita B1 · Doğal Işık",
  },
] as const;

export const DEFAULT_CONTACT_INFO: ContactInfo = {
  email: "iletisim@treatment.health",
  phone: "+90 (212) 900 30 30",
  address: "Büyükdere Cad. No: 199, Levent / İstanbul",
};
