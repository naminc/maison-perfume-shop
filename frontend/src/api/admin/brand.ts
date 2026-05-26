import { api } from "@/lib/api";
import { unwrap } from "@/lib/unwrap";
import type { Brand, BrandListParams, BrandListResponse, BrandPayload } from "@/types/brand";

function normalizeParams(params: BrandListParams = {}) {
  return {
    ...params,
    search: params.search?.trim() || undefined,
    status: params.status === "all" ? undefined : params.status,
  };
}

export const adminBrandApi = {
  getBrands: (params: BrandListParams = {}) =>
    api
      .get<{ data: BrandListResponse }>("/v1/admin/brands", {
        params: normalizeParams(params),
      })
      .then(unwrap),

  getBrand: (id: number) =>
    api.get<{ data: Brand }>(`/v1/admin/brands/${id}`).then(unwrap),

  createBrand: (payload: BrandPayload) =>
    api.post<{ data: Brand }>("/v1/admin/brands", payload).then(unwrap),

  updateBrand: (id: number, payload: BrandPayload) =>
    api.put<{ data: Brand }>(`/v1/admin/brands/${id}`, payload).then(unwrap),

  deleteBrand: (id: number) =>
    api.delete<{ data: null }>(`/v1/admin/brands/${id}`).then(unwrap),
};
