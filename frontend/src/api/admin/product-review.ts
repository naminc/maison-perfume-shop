import { api } from "@/lib/api";
import { unwrap } from "@/lib/unwrap";
import type {
  AdminProductReviewPayload,
  ProductReview,
  ProductReviewListParams,
  ProductReviewListResponse,
} from "@/types/product-review";

function normalizeParams(params: ProductReviewListParams = {}) {
  return {
    ...params,
    search: params.search?.trim() || undefined,
    status: params.status === "all" ? undefined : params.status,
    rating: params.rating === "all" ? undefined : params.rating,
    product_id: params.product_id === "all" || params.product_id === null ? undefined : params.product_id,
  };
}

export const adminProductReviewApi = {
  getReviews: (params: ProductReviewListParams = {}) =>
    api
      .get<{ data: ProductReviewListResponse }>("/v1/admin/product-reviews", {
        params: normalizeParams(params),
      })
      .then(unwrap),

  getReview: (id: number) =>
    api.get<{ data: ProductReview }>(`/v1/admin/product-reviews/${id}`).then(unwrap),

  approveReview: (id: number) =>
    api.patch<{ data: ProductReview }>(`/v1/admin/product-reviews/${id}/approve`).then(unwrap),

  rejectReview: (id: number, admin_note?: string | null) =>
    api.patch<{ data: ProductReview }>(`/v1/admin/product-reviews/${id}/reject`, { admin_note }).then(unwrap),

  updateReview: (id: number, payload: AdminProductReviewPayload) =>
    api.patch<{ data: ProductReview }>(`/v1/admin/product-reviews/${id}`, payload).then(unwrap),

  deleteReview: (id: number) =>
    api.delete<{ data: null }>(`/v1/admin/product-reviews/${id}`).then(unwrap),
};
