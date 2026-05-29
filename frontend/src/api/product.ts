import { api } from "@/lib/api";
import { unwrap } from "@/lib/unwrap";
import type { Product, ProductListParams, ProductListResponse } from "@/types/product";

function normalizeParams(params: ProductListParams = {}) {
  return {
    ...params,
    search: params.search?.trim() || undefined,
    gender: params.gender === "all" ? undefined : params.gender,
    brand_id: params.brand_id === "all" || params.brand_id === null ? undefined : params.brand_id,
    category_id: params.category_id === "all" || params.category_id === null ? undefined : params.category_id,
    is_featured: params.is_featured === "all" ? undefined : params.is_featured,
  };
}

export const productApi = {
  getProducts: (params: ProductListParams = {}) =>
    api
      .get<{ data: ProductListResponse }>("/v1/products", {
        params: normalizeParams(params),
      })
      .then(unwrap),

  getProductBySlug: (slug: string) =>
    api.get<{ data: Product }>(`/v1/products/${slug}`).then(unwrap),
};
