import type { ID } from "@/shared/id";

export type Diagnosis = {
  id: ID;
  code: string;
  name: string;
  isActive?: boolean;
};

export type Treatment = {
  id: ID;
  code: string;
  name: string;
  isActive?: boolean;
};

export type PriceItem = {
  id?: ID;
  treatmentId: ID;
  amount: number; // minor units (kuruş)
};

export type PriceList = {
  id: ID;
  name: string;
  currency: string;
  isDefault?: boolean;
  isActive?: boolean;
  items?: PriceItem[];
};
