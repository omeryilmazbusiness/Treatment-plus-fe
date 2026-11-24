import type { PlanCatalogItem, Subscription } from "../domain/subscription";

export interface SubscriptionReader {
  getCurrent(accessToken?: string): Promise<Subscription | null>;
  listPlans(accessToken?: string): Promise<PlanCatalogItem[]>;
}

export type UpgradeRequestInput = {
  clinicName: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  notes: string;
};

export interface SubscriptionWriter {
  requestUpgrade(input: UpgradeRequestInput): Promise<void>;
}
