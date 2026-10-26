import type { ID } from "@/shared/id";
import type { Money } from "@/shared/money";

export type Diagnosis = {
  id: ID;
  code: string;
  name: string;
};

export type Treatment = {
  id: ID;
  code: string;
  name: string;
  needsTooth: boolean;
  draftCopy: string;
};

export type PriceItem = {
  treatmentId: ID;
  unitPrice: Money;
};

export type PriceList = {
  id: ID;
  name: string;
  items: PriceItem[];
};

export type CatalogPackage = {
  id: ID;
  name: string;
  itemIds: ID[];
};
