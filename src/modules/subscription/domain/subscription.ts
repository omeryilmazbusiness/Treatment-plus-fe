export const Tier = {
  CLASSIC: "classic",
  ULTIMATE: "ultimate",
  ENTERPRISE: "enterprise",
} as const;

export type Tier = (typeof Tier)[keyof typeof Tier];

export type BillingInterval = "month" | "year";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "paused";

/** -1 = sınırsız (backend sözleşmesi). */
export const UNLIMITED = -1;

/** Yükseltme kampanyası: Classic → Ultimate indirim yüzdesi. */
export const UPGRADE_DISCOUNT_PERCENT = 45;

/** Ek PDF paketleri: her ay satın alınır, tüm paketlerde geçerlidir (USD, cent). */
export type ExtraPdfPack = {
  pdfs: number;
  /** Liste fiyatı (cent). */
  listPriceMinor: number;
  /** Kampanya indirim yüzdesi. */
  discountPercent: number;
  currency: string;
};

export const EXTRA_PDF_PACKS: readonly ExtraPdfPack[] = [
  // %25 → $10 (liste $13,33); %50 → $20 (liste $40)
  { pdfs: 10, listPriceMinor: 1333, discountPercent: 25, currency: "USD" },
  { pdfs: 25, listPriceMinor: 4000, discountPercent: 50, currency: "USD" },
];

export function extraPackPriceMinor(pack: ExtraPdfPack): number {
  return Math.round((pack.listPriceMinor * (100 - pack.discountPercent)) / 100);
}

export function findExtraPdfPack(pdfs: number): ExtraPdfPack | undefined {
  return EXTRA_PDF_PACKS.find((p) => p.pdfs === pdfs);
}

export type PlanCatalogItem = {
  id: string;
  tier: Tier;
  name: string;
  interval: BillingInterval;
  /** Küçük para birimi (cent). */
  priceMinor: number;
  currency: string;
  quota: number;
  has3dViz: boolean;
  hasPatientPortal: boolean;
  hasDigitalSignature: boolean;
};

export type Subscription = {
  planId: string;
  tier: Tier;
  status: SubscriptionStatus;
  interval: BillingInterval;
  periodEnd: string;
  daysRemaining: number;
  cancelAtPeriodEnd: boolean;
  plansUsed: number;
  quota: number;
  remaining: number;
  /** Aylık PDF hakkı penceresinin bitişi (ISO). */
  usagePeriodEnd: string;
  usageDaysRemaining: number;
  priceMinor: number;
  currency: string;
};

export type UpgradeOffer = {
  target: PlanCatalogItem;
  discountPercent: number;
  /** İndirimli tutar (cent). */
  discountedMinor: number;
};

export function isUnlimited(quota: number): boolean {
  return quota < 0;
}

/** Communication (classic) dışındaki katmanlar "profesyonel" sayılır. */
export function isProfessionalTier(tier: Tier): boolean {
  return tier !== Tier.CLASSIC;
}

export function tierLabel(tier: Tier): string {
  switch (tier) {
    case Tier.CLASSIC:
      return "Communication";
    case Tier.ULTIMATE:
      return "Professional";
    case Tier.ENTERPRISE:
      return "Enterprise";
  }
}

/** Paket vitrin metni: Communication 40+ / Professional 80+ PDF aylık. */
export function tierPdfAllowanceLabel(tier: Tier): string {
  switch (tier) {
    case Tier.CLASSIC:
      return "40+ PDF / ay";
    case Tier.ULTIMATE:
    case Tier.ENTERPRISE:
      return "80+ PDF / ay";
  }
}

/** Yükseltme kartı / katalog için kısa vitrin (kota yerine). */
export function catalogPdfAllowanceLabel(tier: Tier): string {
  return tierPdfAllowanceLabel(tier);
}

export function intervalLabel(interval: BillingInterval): string {
  return interval === "year" ? "Yıllık" : "Aylık";
}

export function statusLabel(status: SubscriptionStatus): string {
  switch (status) {
    case "active":
      return "Aktif";
    case "trialing":
      return "Deneme";
    case "past_due":
      return "Ödeme Gecikti";
    case "canceled":
      return "İptal Edildi";
    case "paused":
      return "Duraklatıldı";
  }
}

export type UsageLevel = "ok" | "warn" | "full";

export type Usage = {
  used: number;
  quota: number;
  remaining: number;
  unlimited: boolean;
  /** 0..1; sınırsızda 0. */
  ratio: number;
  level: UsageLevel;
};

export function usageOf(sub: Pick<Subscription, "plansUsed" | "quota">): Usage {
  const unlimited = isUnlimited(sub.quota);
  if (unlimited) {
    return {
      used: sub.plansUsed,
      quota: UNLIMITED,
      remaining: UNLIMITED,
      unlimited: true,
      ratio: 0,
      level: "ok",
    };
  }
  const remaining = Math.max(0, sub.quota - sub.plansUsed);
  const ratio = sub.quota > 0 ? Math.min(1, sub.plansUsed / sub.quota) : 1;
  const level: UsageLevel = remaining === 0 ? "full" : ratio >= 0.8 ? "warn" : "ok";
  return { used: sub.plansUsed, quota: sub.quota, remaining, unlimited: false, ratio, level };
}

export function discountedPrice(priceMinor: number, percent: number): number {
  const p = Math.min(100, Math.max(0, percent));
  return Math.round((priceMinor * (100 - p)) / 100);
}

/** Yükseltme için en uygun hedef: yıllık Ultimate, yoksa en ucuz Ultimate+. */
export function pickUpgradeTarget(plans: PlanCatalogItem[]): PlanCatalogItem | null {
  const pro = plans.filter((p) => isProfessionalTier(p.tier));
  return (
    pro.find((p) => p.tier === Tier.ULTIMATE && p.interval === "year") ??
    [...pro].sort((a, b) => a.priceMinor - b.priceMinor)[0] ??
    null
  );
}
