import type { AuthUser } from "@/types/auth";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipping"
  | "completed"
  | "cancelled";

export type PaymentMethod = "cod" | "bank" | "card";
export type PaymentStatus = "unpaid" | "paid" | "failed" | "refunded";
export type ShippingMethod = "standard" | "express";

export type OrderStatusFilter = OrderStatus | "all";
export type PaymentMethodFilter = PaymentMethod | "all";
export type PaymentStatusFilter = PaymentStatus | "all";

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number | null;
  product_name: string;
  product_slug: string | null;
  product_sku: string | null;
  product_image: string | null;
  brand_name: string | null;
  category_name: string | null;
  volume_ml: number | null;
  concentration: string | null;
  unit_price: string;
  original_price: string;
  quantity: number;
  line_total: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  user_id: number | null;
  order_code: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  province_code: string | null;
  province_name: string | null;
  ward_code: string | null;
  ward_name: string | null;
  shipping_address: string;
  note: string | null;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  status: OrderStatus;
  subtotal: string;
  discount_total: string;
  shipping_fee: string;
  total: string;
  coupon_code: string | null;
  cancelled_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  items?: OrderItem[];
  items_count?: number;
  user?: Pick<AuthUser, "id" | "full_name" | "email" | "phone"> | null;
}

export interface OrderPayload {
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  province_code: string;
  province_name: string;
  ward_code: string;
  ward_name: string;
  shipping_address: string;
  note?: string | null;
  payment_method: PaymentMethod;
  shipping_method: ShippingMethod;
  coupon_code?: string | null;
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
}

export interface OrderListParams {
  search?: string;
  status?: OrderStatusFilter;
  payment_status?: PaymentStatusFilter;
  payment_method?: PaymentMethodFilter;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}

export interface OrderListResponse {
  data: Order[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}
