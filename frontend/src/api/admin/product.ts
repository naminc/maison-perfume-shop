import { api } from "@/lib/api";
import { unwrap } from "@/lib/unwrap";
import type { Product, ProductListParams, ProductListResponse, ProductPayload } from "@/types/product";

function normalizeParams(params: ProductListParams = {}) {
  return {
    ...params,
    search: params.search?.trim() || undefined,
    status: params.status === "all" ? undefined : params.status,
    gender: params.gender === "all" ? undefined : params.gender,
    brand_id: params.brand_id === "all" || params.brand_id === null ? undefined : params.brand_id,
    category_id: params.category_id === "all" || params.category_id === null ? undefined : params.category_id,
    is_featured: params.is_featured === "all" ? undefined : params.is_featured,
  };
}

export const adminProductApi = {
  getProducts: (params: ProductListParams = {}) =>
    api
      .get<{ data: ProductListResponse }>("/v1/admin/products", {
        params: normalizeParams(params),
      })
      .then(unwrap),

  getProduct: (id: number) =>
    api.get<{ data: Product }>(`/v1/admin/products/${id}`).then(unwrap),

  createProduct: (payload: ProductPayload) =>
    api.post<{ data: Product }>("/v1/admin/products", payload).then(unwrap),

  updateProduct: (id: number, payload: ProductPayload) =>
    api.put<{ data: Product }>(`/v1/admin/products/${id}`, payload).then(unwrap),

  deleteProduct: (id: number) =>
    api.delete<{ data: null }>(`/v1/admin/products/${id}`).then(unwrap),
};
