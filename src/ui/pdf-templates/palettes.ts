import type { PaletteKey, PdfPalette } from "./types";

export const PDF_PALETTES: Record<PaletteKey, PdfPalette> = {
  navy: {
    key: "navy",
    name: "navy",
    label: "Derin Lacivert",
    primary: "#0f2137",
    primaryHover: "#0a1726",
    accent: "#1e40af",
    light: "#f0f4f8",
    border: "#cbd5e1",
    ribbonDark: "#0b1f3a",
    ribbonLight: "#829ab1",
    ribbonPastel: "#e2e8f0",
    textMain: "#0f172a",
    textMuted: "#64748b",
    headingFont: "'Plus Jakarta Sans', sans-serif",
    bodyFont: "'Plus Jakarta Sans', sans-serif",
    cardBg: "#FFFFFF",
    coverBg: "#0F172A",
  },
  forest: {
    key: "forest",
    name: "forest",
    label: "Zümrüt Orman",
    primary: "#1b4332",
    primaryHover: "#143326",
    accent: "#2d6a4f",
    light: "#eaf2ec",
    border: "#b7d5c4",
    ribbonDark: "#1b4332",
    ribbonLight: "#74a892",
    ribbonPastel: "#d8e8df",
    textMain: "#1b2e24",
    textMuted: "#52796f",
    headingFont: "'Playfair Display', serif",
    bodyFont: "'Plus Jakarta Sans', sans-serif",
    cardBg: "#F7F6F2",
    coverBg: "#1b4332",
  },
  rose: {
    key: "rose",
    name: "rose",
    label: "Zarif Gül",
    primary: "#7a2432",
    primaryHover: "#5c1b26",
    accent: "#c99a78",
    light: "#fbf3f2",
    border: "#f4d3d7",
    ribbonDark: "#7a2432",
    ribbonLight: "#c4848e",
    ribbonPastel: "#f5e1e4",
    textMain: "#2e1418",
    textMuted: "#7d535a",
    headingFont: "'Plus Jakarta Sans', sans-serif",
    bodyFont: "'Plus Jakarta Sans', sans-serif",
    cardBg: "#FFFFFF",
    coverBg: "#7a2432",
  },
  slate: {
    key: "slate",
    name: "slate",
    label: "Arduvaz Taş",
    primary: "#2b4c6f",
    primaryHover: "#1e354d",
    accent: "#527eaa",
    light: "#f1f5f9",
    border: "#cbd5e1",
    ribbonDark: "#2b4c6f",
    ribbonLight: "#7d9bb8",
    ribbonPastel: "#e2e8f0",
    textMain: "#1e293b",
    textMuted: "#64748b",
    headingFont: "'Plus Jakarta Sans', sans-serif",
    bodyFont: "'Plus Jakarta Sans', sans-serif",
    cardBg: "#FFFFFF",
    coverBg: "#0A0A0A",
  },
};

export const PALETTES = PDF_PALETTES;

export const TEMPLATE_META = [
  {
    id: "modern-geometric",
    name: "MODERN",
    subtitle: "Lacivert Altıgen Geometrik Bloklar & Altın Çizgiler",
    tag: "Modern / Kurumsal",
    badge: "Yeni",
  },
  {
    id: "royal-gold",
    name: "TEKNO",
    subtitle: "Siber Lacivert Zemin & Parlayan Neon Devre Hatları",
    tag: "Dijital / Tekno",
    badge: "Yeni",
  },
  {
    id: "noir-gold",
    name: "PREMİUM",
    subtitle: "Siyah & Altın V-Kalkan Bordür, Klasik Lüks Çerçeve",
    tag: "VIP / Lüks",
    badge: "Premium",
  },
  {
    id: "liquid-art",
    name: "SOFT",
    subtitle: "Pastel Renk Dalgaları, Bulut & Yıldız Motifleri",
    tag: "Yumuşak / Ferah",
    badge: "Yeni",
  },
  {
    id: "botanical-serenity",
    name: "NATURE",
    subtitle: "Suluboya Botanik Yapraklar, Çiçekler & Çift Çerçeve",
    tag: "Doğal / Botanik",
    badge: "Zarif",
  },
  {
    id: "klinik-minimal",
    name: "KLASİK (Orijinal)",
    subtitle: "24 Sayfalık Orijinal Diyagonal Klinik Şablonu",
    tag: "Klasik",
    badge: "Varsayılan",
  },
] as const;

export function formatCurrency(amount: number, currency: string = "TRY", locale?: string): string {
  const sym = currency === "EUR" ? "€" : currency === "USD" ? "$" : "₺";
  const numLocale =
    locale === "en"
      ? "en-US"
      : locale === "ar"
      ? "ar-SA"
      : locale === "ru"
      ? "ru-RU"
      : "tr-TR";
  return `${sym} ${Math.round(amount).toLocaleString(numLocale)}`;
}

export function formatNumber(amount: number, locale?: string): string {
  const numLocale =
    locale === "en"
      ? "en-US"
      : locale === "ar"
      ? "ar-SA"
      : locale === "ru"
      ? "ru-RU"
      : "tr-TR";
  return Math.round(amount).toLocaleString(numLocale);
}
