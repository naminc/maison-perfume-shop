import type { CouponStatus, CouponType } from "@/types/coupon";

export const COUPON_PAGE_SIZE = 10;

export const COUPON_STATUS_LABELS: Record<CouponStatus, string> = {
  active: "Đang bật",
  inactive: "Tạm tắt",
};

export const COUPON_TYPE_LABELS: Record<CouponType, string> = {
  fixed: "Giảm tiền",
  percent: "Giảm %",
  free_shipping: "Miễn phí ship",
};

export const COUPON_STATUS_OPTIONS = [
  { value: "active", label: COUPON_STATUS_LABELS.active },
  { value: "inactive", label: COUPON_STATUS_LABELS.inactive },
] as const;

export const COUPON_TYPE_OPTIONS = [
  { value: "fixed", label: COUPON_TYPE_LABELS.fixed },
  { value: "percent", label: COUPON_TYPE_LABELS.percent },
  { value: "free_shipping", label: COUPON_TYPE_LABELS.free_shipping },
] as const;
