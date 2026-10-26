import type { BackendGateway } from "@/platform/http/types";
import { AppError } from "@/shared/errx";

import type { CatalogReader, CatalogWriter } from "../../application/ports";
import type { CatalogPackage, Diagnosis, PriceList, Treatment } from "../../domain/catalog";

/** Phase 3: /v1/catalog/{diagnoses,treatments,price-lists} */
export class CatalogHttpGateway implements CatalogReader, CatalogWriter {
  constructor(private readonly http: BackendGateway) {}

  listDiagnoses(): Promise<Diagnosis[]> {
    return this.notReady("catalog.listDiagnoses");
  }

  listTreatments(): Promise<Treatment[]> {
    return this.notReady("catalog.listTreatments");
  }

  listPriceLists(): Promise<PriceList[]> {
    return this.notReady("catalog.listPriceLists");
  }

  listPackages(): Promise<CatalogPackage[]> {
    return this.notReady("catalog.listPackages");
  }

  saveDiagnosis(): Promise<Diagnosis> {
    return this.notReady("catalog.saveDiagnosis");
  }

  saveTreatment(): Promise<Treatment> {
    return this.notReady("catalog.saveTreatment");
  }

  savePriceList(): Promise<PriceList> {
    return this.notReady("catalog.savePriceList");
  }

  private notReady(name: string): never {
    void this.http;
    throw AppError.notImplemented(name);
  }
}
