import type { BackendGateway } from "@/platform/http/types";

import type {
  SubscriptionReader,
  SubscriptionWriter,
  UpgradeRequestInput,
} from "../../application/ports";
import {
  Tier,
  type BillingInterval,
  type PlanCatalogItem,
  type Subscription,
  type SubscriptionStatus,
} from "../../domain/subscription";

type RawPlan = {
  id: string;
  tier: string;
  name?: string;
  billing_interval?: string;
  price_cents?: number;
  currency?: string;
  plan_quota?: number;
  has_3d_viz?: boolean;
  has_patient_portal?: boolean;
  has_digital_signature?: boolean;
};

type RawSubscription = {
  plan_id: string;
  tier: string;
  status: string;
  billing_interval?: string;
  current_period_end: string;
  days_remaining?: number;
  cancel_at_period_end?: boolean;
  plans_created_count?: number;
  plan_quota?: number;
  quota_remaining?: number;
  usage_period_end?: string;
  usage_days_remaining?: number;
  plan?: RawPlan;
};

const STATUSES: readonly SubscriptionStatus[] = [
  "trialing",
  "active",
  "past_due",
  "canceled",
  "paused",
];

function toTier(raw: string): Tier {
  return raw === Tier.ULTIMATE || raw === Tier.ENTERPRISE ? raw : Tier.CLASSIC;
}

function toInterval(raw?: string): BillingInterval {
  return raw === "year" ? "year" : "month";
}

function toStatus(raw: string): SubscriptionStatus {
  return (STATUSES as readonly string[]).includes(raw) ? (raw as SubscriptionStatus) : "active";
}

function toPlan(raw: RawPlan): PlanCatalogItem {
  return {
    id: raw.id,
    tier: toTier(raw.tier),
    name: raw.name ?? raw.id,
    interval: toInterval(raw.billing_interval),
    priceMinor: raw.price_cents ?? 0,
    currency: raw.currency ?? "USD",
    quota: raw.plan_quota ?? -1,
    has3dViz: Boolean(raw.has_3d_viz),
    hasPatientPortal: Boolean(raw.has_patient_portal),
    hasDigitalSignature: Boolean(raw.has_digital_signature),
  };
}

export class SubscriptionHttpGateway implements SubscriptionReader, SubscriptionWriter {
  constructor(private readonly http: BackendGateway) {}

  async getCurrent(accessToken?: string): Promise<Subscription | null> {
    const raw = await this.http.request<RawSubscription | null>({
      path: "/v1/subscriptions/current",
      accessToken,
    });
    if (!raw?.plan_id) return null;
    return {
      planId: raw.plan_id,
      tier: toTier(raw.tier),
      status: toStatus(raw.status),
      interval: toInterval(raw.billing_interval),
      periodEnd: raw.current_period_end,
      daysRemaining: raw.days_remaining ?? 0,
      cancelAtPeriodEnd: Boolean(raw.cancel_at_period_end),
      plansUsed: raw.plans_created_count ?? 0,
      quota: raw.plan_quota ?? -1,
      remaining: raw.quota_remaining ?? -1,
      usagePeriodEnd: raw.usage_period_end ?? raw.current_period_end,
      usageDaysRemaining: raw.usage_days_remaining ?? raw.days_remaining ?? 0,
      priceMinor: raw.plan?.price_cents ?? 0,
      currency: raw.plan?.currency ?? "USD",
    };
  }

  async listPlans(accessToken?: string): Promise<PlanCatalogItem[]> {
    const res = await this.http.request<{ plans: RawPlan[] }>({
      path: "/v1/subscriptions/plans",
      accessToken,
    });
    return (res.plans ?? []).map(toPlan);
  }

  /** Mevcut satış talebi kuyruğunu (demo-requests) kullanır; fatura/ödeme tetiklemez. */
  async requestUpgrade(input: UpgradeRequestInput): Promise<void> {
    await this.http.request({
      path: "/v1/public/demo-requests",
      method: "POST",
      body: {
        website_url: input.website,
        clinic_name: input.clinicName,
        contact_name: input.contactName,
        email: input.email,
        phone: input.phone,
        notes: input.notes,
      },
    });
  }
}
