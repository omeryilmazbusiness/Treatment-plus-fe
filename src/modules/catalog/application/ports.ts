import type { ID } from "@/shared/id";

import type { Diagnosis, PriceItem, PriceList, Treatment } from "../domain/catalog";

export interface CatalogReader {
  listDiagnoses(accessToken?: string): Promise<Diagnosis[]>;
  listTreatments(accessToken?: string): Promise<Treatment[]>;
  listPriceLists(accessToken?: string): Promise<PriceList[]>;
  getPriceList(
    id: ID,
    accessToken?: string
  ): Promise<{ priceList: PriceList; items: PriceItem[] }>;
}

export interface CatalogWriter {
  createDiagnosis(
    input: { code: string; name: string },
    accessToken?: string
  ): Promise<Diagnosis>;
  createTreatment(
    input: { code: string; name: string },
    accessToken?: string
  ): Promise<Treatment>;
  createPriceList(
    input: { name: string; currency: string; isDefault?: boolean },
    accessToken?: string
  ): Promise<PriceList>;
  setPriceItems(
    listId: ID,
    items: { treatmentId: string; amount: number }[],
    accessToken?: string
  ): Promise<PriceItem[]>;
}
