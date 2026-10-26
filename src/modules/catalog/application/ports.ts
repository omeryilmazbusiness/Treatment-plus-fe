import type { CatalogPackage, Diagnosis, PriceList, Treatment } from "../domain/catalog";

export interface CatalogReader {
  listDiagnoses(): Promise<Diagnosis[]>;
  listTreatments(): Promise<Treatment[]>;
  listPriceLists(): Promise<PriceList[]>;
  listPackages(): Promise<CatalogPackage[]>;
}

export interface CatalogWriter {
  saveDiagnosis(input: Diagnosis): Promise<Diagnosis>;
  saveTreatment(input: Treatment): Promise<Treatment>;
  savePriceList(input: PriceList): Promise<PriceList>;
}
