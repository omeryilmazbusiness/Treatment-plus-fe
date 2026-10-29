import type { BackendGateway } from "@/platform/http/types";
import type { ID } from "@/shared/id";

import type { CatalogReader, CatalogWriter } from "../../application/ports";
import type { Diagnosis, PriceItem, PriceList, Treatment } from "../../domain/catalog";

type RawDiagnosis = {
  id: string;
  code: string;
  name: string;
  is_active?: boolean;
};

type RawTreatment = {
  id: string;
  code: string;
  name: string;
  is_active?: boolean;
};

type RawPriceItem = {
  id: string;
  treatment_id: string;
  amount: number;
};

type RawPriceList = {
  id: string;
  name: string;
  currency: string;
  is_default?: boolean;
  is_active?: boolean;
};

export class CatalogHttpGateway implements CatalogReader, CatalogWriter {
  constructor(private readonly http: BackendGateway) {}

  async listDiagnoses(accessToken?: string): Promise<Diagnosis[]> {
    const res = await this.http.request<{ diagnoses: RawDiagnosis[] }>({
      path: "/v1/catalog/diagnoses",
      accessToken,
    });
    return (res.diagnoses ?? []).map((d) => ({
      id: d.id as ID,
      code: d.code,
      name: d.name,
      isActive: d.is_active,
    }));
  }

  async listTreatments(accessToken?: string): Promise<Treatment[]> {
    const res = await this.http.request<{ treatments: RawTreatment[] }>({
      path: "/v1/catalog/treatments",
      accessToken,
    });
    return (res.treatments ?? []).map((t) => ({
      id: t.id as ID,
      code: t.code,
      name: t.name,
      isActive: t.is_active,
    }));
  }

  async listPriceLists(accessToken?: string): Promise<PriceList[]> {
    const res = await this.http.request<{ price_lists: RawPriceList[] }>({
      path: "/v1/catalog/price-lists",
      accessToken,
    });
    return (res.price_lists ?? []).map((pl) => ({
      id: pl.id as ID,
      name: pl.name,
      currency: pl.currency,
      isDefault: pl.is_default,
      isActive: pl.is_active,
    }));
  }

  async getPriceList(
    id: ID,
    accessToken?: string
  ): Promise<{ priceList: PriceList; items: PriceItem[] }> {
    const res = await this.http.request<{
      price_list: RawPriceList;
      items: RawPriceItem[];
    }>({
      path: `/v1/catalog/price-lists/${id}`,
      accessToken,
    });
    return {
      priceList: {
        id: res.price_list.id as ID,
        name: res.price_list.name,
        currency: res.price_list.currency,
        isDefault: res.price_list.is_default,
        isActive: res.price_list.is_active,
      },
      items: (res.items ?? []).map((i) => ({
        id: i.id as ID,
        treatmentId: i.treatment_id as ID,
        amount: i.amount,
      })),
    };
  }

  async createDiagnosis(
    input: { code: string; name: string },
    accessToken?: string
  ): Promise<Diagnosis> {
    const d = await this.http.request<RawDiagnosis>({
      path: "/v1/catalog/diagnoses",
      method: "POST",
      accessToken,
      body: input,
    });
    return {
      id: d.id as ID,
      code: d.code,
      name: d.name,
      isActive: d.is_active,
    };
  }

  async createTreatment(
    input: { code: string; name: string },
    accessToken?: string
  ): Promise<Treatment> {
    const t = await this.http.request<RawTreatment>({
      path: "/v1/catalog/treatments",
      method: "POST",
      accessToken,
      body: input,
    });
    return {
      id: t.id as ID,
      code: t.code,
      name: t.name,
      isActive: t.is_active,
    };
  }

  async updateTreatment(
    id: ID,
    input: { name?: string; isActive?: boolean },
    accessToken?: string
  ): Promise<Treatment> {
    const t = await this.http.request<RawTreatment>({
      path: `/v1/catalog/treatments/${id}`,
      method: "PATCH",
      accessToken,
      body: {
        name: input.name,
        is_active: input.isActive,
      },
    });
    return {
      id: t.id as ID,
      code: t.code,
      name: t.name,
      isActive: t.is_active,
    };
  }

  async deleteTreatment(id: ID, accessToken?: string): Promise<void> {
    await this.http.request<{ status?: string }>({
      path: `/v1/catalog/treatments/${id}`,
      method: "DELETE",
      accessToken,
    });
  }

  async createPriceList(
    input: { name: string; currency: string; isDefault?: boolean },
    accessToken?: string
  ): Promise<PriceList> {
    const pl = await this.http.request<RawPriceList>({
      path: "/v1/catalog/price-lists",
      method: "POST",
      accessToken,
      body: {
        name: input.name,
        currency: input.currency,
        is_default: input.isDefault,
      },
    });
    return {
      id: pl.id as ID,
      name: pl.name,
      currency: pl.currency,
      isDefault: pl.is_default,
      isActive: pl.is_active,
    };
  }

  async setPriceItems(
    listId: ID,
    items: { treatmentId: string; amount: number }[],
    accessToken?: string
  ): Promise<PriceItem[]> {
    const res = await this.http.request<{ items: RawPriceItem[] }>({
      path: `/v1/catalog/price-lists/${listId}/items`,
      method: "PUT",
      accessToken,
      body: items.map((i) => ({
        treatment_id: i.treatmentId,
        amount: i.amount,
      })),
    });
    return (res.items ?? []).map((i) => ({
      id: i.id as ID,
      treatmentId: i.treatment_id as ID,
      amount: i.amount,
    }));
  }
}
