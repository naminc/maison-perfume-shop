import type { ProductReviewRatingFilter, ProductReviewStatus, ProductReviewStatusFilter } from "@/types/product-review";

export const PRODUCT_REVIEW_PAGE_SIZE = 10;
export const PUBLIC_PRODUCT_REVIEW_PAGE_SIZE = 6;

export const PRODUCT_REVIEW_STATUS_LABELS: Record<ProductReviewStatus, string> = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối",
};

export const PRODUCT_REVIEW_STATUS_BADGE_CLASS: Record<ProductReviewStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
};

export const PRODUCT_REVIEW_STATUS_FILTER_OPTIONS: Array<{ value: ProductReviewStatusFilter; label: string }> = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "pending", label: PRODUCT_REVIEW_STATUS_LABELS.pending },
  { value: "approved", label: PRODUCT_REVIEW_STATUS_LABELS.approved },
  { value: "rejected", label: PRODUCT_REVIEW_STATUS_LABELS.rejected },
];

export const PRODUCT_REVIEW_RATING_OPTIONS: Array<{ value: ProductReviewRatingFilter; label: string }> = [
  { value: "all", label: "Tất cả số sao" },
  { value: 5, label: "5 sao" },
  { value: 4, label: "4 sao" },
  { value: 3, label: "3 sao" },
  { value: 2, label: "2 sao" },
  { value: 1, label: "1 sao" },
];
