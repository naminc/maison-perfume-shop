import { api } from "@/lib/api";
import { unwrap } from "@/lib/unwrap";
import type {
  ProductReview,
  ProductReviewListParams,
  ProductReviewListResponse,
  ProductReviewPayload,
  ReviewableItem,
} from "@/types/product-review";

function normalizeParams(params: ProductReviewListParams = {}) {
  return {
    ...params,
    search: params.search?.trim() || undefined,
    status: params.status === "all" ? undefined : params.status,
    rating: params.rating === "all" ? undefined : params.rating,
  };
}

export const accountProductReviewApi = {
  getMyReviews: (params: ProductReviewListParams = {}) =>
    api
      .get<{ data: ProductReviewListResponse }>("/v1/account/reviews", {
        params: normalizeParams(params),
      })
      .then(unwrap),

  getReviewableItems: () =>
    api.get<{ data: ReviewableItem[] }>("/v1/account/reviewable-items").then(unwrap),

  createReview: (payload: ProductReviewPayload) =>
    api.post<{ data: ProductReview }>("/v1/account/reviews", payload).then(unwrap),
};
