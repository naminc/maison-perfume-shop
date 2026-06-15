import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productReviewApi } from "@/api/product-review";
import { accountProductReviewApi } from "@/api/account/product-review";
import { adminProductReviewApi } from "@/api/admin/product-review";
import { QUERY_KEYS } from "@/constants/query-keys";
import { STALE_TIME } from "@/constants/query-config";
import type { AdminProductReviewPayload, ProductReviewListParams, ProductReviewPayload } from "@/types/product-review";

export function useProductReviews(slug?: string, params: ProductReviewListParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.productReviews.list(slug ?? "missing", params as Record<string, unknown>),
    queryFn: () => productReviewApi.getProductReviews(slug as string, params),
    enabled: Boolean(slug),
    placeholderData: keepPreviousData,
    staleTime: STALE_TIME.DEFAULT,
  });
}

export function useProductReviewSummary(slug?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.productReviews.summary(slug ?? "missing"),
    queryFn: () => productReviewApi.getProductReviewSummary(slug as string),
    enabled: Boolean(slug),
    staleTime: STALE_TIME.DEFAULT,
  });
}

export function useMyReviews(params: ProductReviewListParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.account.productReviews.list(params as Record<string, unknown>),
    queryFn: () => accountProductReviewApi.getMyReviews(params),
    placeholderData: keepPreviousData,
  });
}

export function useReviewableItems() {
  return useQuery({
    queryKey: QUERY_KEYS.account.productReviews.reviewableItems,
    queryFn: () => accountProductReviewApi.getReviewableItems(),
    staleTime: STALE_TIME.DEFAULT,
  });
}

export function useCreateProductReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProductReviewPayload) => accountProductReviewApi.createReview(payload),
    onSuccess: (review) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.account.productReviews.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.account.productReviews.reviewableItems });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.productReviews.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products.detail(review.product?.slug ?? "") });
    },
  });
}

export function useAdminProductReviews(params: ProductReviewListParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.productReviews.list(params as Record<string, unknown>),
    queryFn: () => adminProductReviewApi.getReviews(params),
    placeholderData: keepPreviousData,
  });
}

export function useAdminProductReview(id?: number) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.productReviews.detail(id ?? "missing"),
    queryFn: () => adminProductReviewApi.getReview(id as number),
    enabled: Boolean(id),
  });
}

export function useApproveProductReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminProductReviewApi.approveReview(id),
    onSuccess: (review) => {
      queryClient.setQueryData(QUERY_KEYS.admin.productReviews.detail(review.id), review);
      invalidateReviewQueries(queryClient);
    },
  });
}

export function useRejectProductReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, admin_note }: { id: number; admin_note?: string | null }) =>
      adminProductReviewApi.rejectReview(id, admin_note),
    onSuccess: (review) => {
      queryClient.setQueryData(QUERY_KEYS.admin.productReviews.detail(review.id), review);
      invalidateReviewQueries(queryClient);
    },
  });
}

export function useUpdateProductReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AdminProductReviewPayload }) =>
      adminProductReviewApi.updateReview(id, payload),
    onSuccess: (review) => {
      queryClient.setQueryData(QUERY_KEYS.admin.productReviews.detail(review.id), review);
      invalidateReviewQueries(queryClient);
    },
  });
}

export function useDeleteProductReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminProductReviewApi.deleteReview(id),
    onSuccess: () => {
      invalidateReviewQueries(queryClient);
    },
  });
}

function invalidateReviewQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.productReviews.all });
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.account.productReviews.all });
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.productReviews.all });
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products.all });
}
