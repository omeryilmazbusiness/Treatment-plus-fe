export type FeatureIconKey = "odontogram" | "animation" | "mobile";

export interface NavItem {
  readonly label: string;
  readonly href: string;
}

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

export interface FeatureCardData {
  readonly id: string;
  readonly stepIndex: string;
  readonly icon: FeatureIconKey;
  readonly badge: string;
  readonly title: string;
  readonly description: string;
  readonly previewTag: string;
  readonly highlights: readonly string[];
}

export interface StatMetric {
  readonly id: string;
  readonly value: string;
  readonly label: string;
  readonly detail: string;
}

export interface WorkflowStep {
  readonly step: string;
  readonly badge: string;
  readonly title: string;
  readonly description: string;
}

export interface PricingPlan {
  readonly id: "classic" | "ultimate";
  readonly name: string;
  readonly tagLabel: string;
  readonly subtitle: string;
  readonly featured?: boolean;
  readonly perks: readonly string[];
  readonly ctaLabel: string;
  readonly ctaHref: string;
}

export interface ContactInfo {
  readonly email: string;
  readonly phone: string;
  readonly address: string;
}

export const DEFAULT_NAV_ITEMS: readonly NavItem[] = [
  { label: "Özellikler", href: "#ozellikler" },
  { label: "Nasıl Çalışır", href: "#nasil-calisir" },
  { label: "Paketler", href: "#fiyatlandirma" },
] as const;

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

export const DEFAULT_FEATURES: readonly FeatureCardData[] = [
  {
    id: "interactive-odontogram",
    stepIndex: "01",
    icon: "odontogram",
    badge: "3D Görselleştirme",
    title: "İnteraktif 3D Odontogramlar",
    description:
      "Hastanın ağız yapısını 360° döndürülebilir 3D çene modeli üzerinde işaretleyin. Mevcut bulguları ve planlanan restorasyonları katmanlı olarak sunun.",
    previewTag: "Diş #11 · #14 · #36 Aktif Katman",
    highlights: [
      "Diş numarasına göre renk ve durum kodlaması",
      "Mevcut durum / Tedavi sonrası karşılaştırma modu",
      ".GLB ve .STL ağız içi tarayıcı modelleriyle tam uyum",
    ],
  },
  {
    id: "animated-procedures",
    stepIndex: "02",
    icon: "animation",
    badge: "Klinik Sunum",
    title: "Animasyonlu Tedavi Prosedürleri",
    description:
      "Kanal tedavisi, implant, sinüs lifting veya protez aşamalarını tıbbi doğruluğa sahip anlaşılır 3D simülasyonlarla adım adım gösterin.",
    previewTag: "Cerrahi Faz → İyileşme → Protetik Üst Yapı",
    highlights: [
      "İmplant, kanal ve kuron prosedür görselleştirmeleri",
      "Hasta kaygısını ve belirsizliği azaltan görsel anlatım",
      "Hekim konsültasyon süresinde %50'ye varan tasarruf",
    ],
  },
  {
    id: "shareable-reports",
    stepIndex: "03",
    icon: "mobile",
    badge: "PDF'e Son",
    title: "Mobil Uyumlu & Paylaşılabilir Raporlar",
    description:
      "Statik kağıt çıktılar ve unutulan PDF dosyaları yerine hastanıza özel güvenli bir bağlantı gönderin; planını mobil cihazından interaktif incelesin.",
    previewTag: "Anlık Mobil Bağlantı & Dijital Onay",
    highlights: [
      "SMS, WhatsApp veya QR kod ile anında hasta paylaşımı",
      "Faz bazlı şeffaf maliyet ve randevu takvimi",
      "Tek tıkla dijital hasta onayı ve geri bildirim",
    ],
  },
] as const;

export const DEFAULT_STATS: readonly StatMetric[] = [
  {
    id: "acceptance-rate",
    value: "%42",
    label: "Daha Yüksek Vaka Kabul Oranı",
    detail: "Çok aşamalı implant ve estetik protetik tedavi planlarında",
  },
  {
    id: "decision-speed",
    value: "2.4x",
    label: "Daha Hızlı Hasta Karar Süreci",
    detail: "Mobil paylaşılabilir interaktif 3D hasta sunumu ile",
  },
  {
    id: "time-saved",
    value: "%50",
    label: "Daha Kısa Konsültasyon Süresi",
    detail: "Karmaşık röntgen anlatımı yerine doğrudan 3D simülasyon",
  },
] as const;

export const DEFAULT_STEPS: readonly WorkflowStep[] = [
  {
    step: "01",
    badge: "Katalog & Planlama",
    title: "Teşhis ve Tedaviyi İşaretleyin",
    description:
      "Klinik kataloğunuzdan diş numaralarını ve prosedürleri seçin; çok fazlı tedavi planını saniyeler içinde oluşturun.",
  },
  {
    step: "02",
    badge: "3D Görsel Sunum",
    title: "3D Odontogramda Anlatın",
    description:
      "Muayene koltuğunda veya konsültasyon ekranında hastanıza uygulanacak işlemi 3 boyutlu model üzerinde döndürerek gösterin.",
  },
  {
    step: "03",
    badge: "Mobil Paylaşım",
    title: "Dijital Paylaşın ve Onay Alın",
    description:
      "PDF çıktısına gerek kalmadan güvenli hasta bağlantısını paylaşın; hastanız mobil cihazından planı inceleyip onaylasın.",
  },
] as const;

export const DEFAULT_PRICING: readonly PricingPlan[] = [
  {
    id: "classic",
    name: "Classic Paket",
    tagLabel: "Kurumsal Plan Sunumu",
    subtitle:
      "Hızlı, düzenli ve kurumsal kimliğe uygun tedavi planı sunumu yapmak isteyen klinikler için.",
    perks: [
      "Faz bazlı yapılandırılmış tedavi ve işlem planı",
      "Klinik logosu, hekim profili ve karşılama mektubu",
      "Mobil uyumlu paylaşılabilir hasta planı bağlantısı",
      "Standart klinik teşhis ve tedavi kataloğu",
    ],
    ctaLabel: "Örnekleri Gör",
    ctaHref: "/ornekler/classic",
  },
  {
    id: "ultimate",
    name: "Ultimate Paket",
    tagLabel: "3D İnteraktif Deneyim",
    subtitle:
      "Hastalarına 3 boyutlu odontogram ve görsel prosedür simülasyonu sunmak isteyen klinikler için.",
    featured: true,
    perks: [
      "İnteraktif 3D Odontogram ve diş bazlı görselleştirme",
      "Animasyonlu tedavi prosedürleri (.glb model desteği)",
      "Klinik tanıtımı, laboratuvar, ödüller ve konaklama modülleri",
      "Çoklu dil, özel renk paleti ve gelişmiş hasta onay ekranı",
    ],
    ctaLabel: "Örnekleri Gör",
    ctaHref: "/ornekler/ultimate",
  },
] as const;

export const DEFAULT_CONTACT_INFO: ContactInfo = {
  email: "iletisim@treatment.health",
  phone: "+90 (212) 900 30 30",
  address: "Büyükdere Cad. No: 199, Levent / İstanbul",
};
