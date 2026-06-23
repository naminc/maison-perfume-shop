export type CouponType = "fixed" | "percent" | "free_shipping";
export type CouponStatus = "active" | "inactive";
export type CouponListStatusFilter = CouponStatus | "all";
export type CouponListTypeFilter = CouponType | "all";

export interface Coupon {
  id: number;
  code: string;
  name: string;
  description: string | null;
  type: CouponType;
  value: string | null;
  min_order_amount: string;
  max_discount_amount: string | null;
  usage_limit: number | null;
  used_count: number;
  per_user_limit: number | null;
  starts_at: string | null;
  expires_at: string | null;
  status: CouponStatus;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CouponPayload {
  code: string;
  name: string;
  description?: string | null;
  type: CouponType;
  value?: number | null;
  min_order_amount?: number | null;
  max_discount_amount?: number | null;
  usage_limit?: number | null;
  per_user_limit?: number | null;
  starts_at?: string | null;
  expires_at?: string | null;
  status: CouponStatus;
}

export interface CouponListParams {
  search?: string;
  status?: CouponListStatusFilter;
  type?: CouponListTypeFilter;
  page?: number;
  per_page?: number;
}

export interface CouponListResponse {
  data: Coupon[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface CouponCheckoutItem {
  product_id: number;
  quantity: number;
}

export interface ValidateCouponPayload {
  code: string;
  shipping_method: "standard" | "express";
  items: CouponCheckoutItem[];
}

export interface CouponPreview {
  id: number;
  code: string;
  name: string;
  description: string | null;
  type: CouponType;
  value: string | null;
  min_order_amount: string;
  max_discount_amount: string | null;
}

export interface ValidateCouponResponse {
  coupon: CouponPreview;
  subtotal: number;
  shipping_fee: number;
  discount_total: number;
  total: number;
}
