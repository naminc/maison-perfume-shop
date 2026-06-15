import { api } from "@/lib/api";
import { unwrap } from "@/lib/unwrap";
import type { ProductReviewListParams, ProductReviewListResponse, ProductReviewSummary } from "@/types/product-review";

function normalizeParams(params: ProductReviewListParams = {}) {
  return {
    ...params,
    search: params.search?.trim() || undefined,
    status: params.status === "all" ? undefined : params.status,
    rating: params.rating === "all" ? undefined : params.rating,
    product_id: params.product_id === "all" || params.product_id === null ? undefined : params.product_id,
  };
}

export const productReviewApi = {
  getProductReviews: (slug: string, params: ProductReviewListParams = {}) =>
    api
      .get<{ data: ProductReviewListResponse }>(`/v1/products/${slug}/reviews`, {
        params: normalizeParams(params),
      })
      .then(unwrap),

  getProductReviewSummary: (slug: string) =>
    api.get<{ data: ProductReviewSummary }>(`/v1/products/${slug}/reviews/summary`).then(unwrap),
};
