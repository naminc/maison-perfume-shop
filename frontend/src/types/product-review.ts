import type { Product } from "@/types/product";
import type { AuthUser } from "@/types/auth";
import type { Order, OrderItem } from "@/types/order";

export type ProductReviewStatus = "pending" | "approved" | "rejected";
export type ProductReviewStatusFilter = ProductReviewStatus | "all";
export type ProductReviewRatingFilter = 1 | 2 | 3 | 4 | 5 | "all";

export interface ProductReview {
  id: number;
  user_id: number;
  product_id: number;
  order_id: number | null;
  order_item_id: number | null;
  rating: number;
  title: string | null;
  content: string | null;
  status: ProductReviewStatus;
  admin_note: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  user?: Pick<AuthUser, "id" | "full_name" | "email"> | null;
  product?: Pick<Product, "id" | "name" | "slug" | "image"> | null;
  order?: Pick<Order, "id" | "order_code"> | null;
  order_item?: Pick<OrderItem, "id" | "product_name"> | null;
}

export interface ProductReviewPayload {
  product_id: number;
  order_item_id: number;
  rating: number;
  title?: string | null;
  content?: string | null;
}

export interface AdminProductReviewPayload {
  rating: number;
  title?: string | null;
  content?: string | null;
  status: ProductReviewStatus;
  admin_note?: string | null;
}

export interface ProductReviewSummary {
  product_id: number;
  rating_average: number;
  rating_count: number;
}

export interface ReviewableItem {
  order_item_id: number;
  order_id: number;
  order_code: string;
  product_id: number;
  product_name: string;
  product_slug: string | null;
  product_image: string | null;
  brand_name: string | null;
  quantity: number;
  completed_at: string | null;
}

export interface ProductReviewListParams {
  search?: string;
  status?: ProductReviewStatusFilter;
  rating?: ProductReviewRatingFilter;
  product_id?: number | "all" | null;
  page?: number;
  per_page?: number;
}

export interface ProductReviewListResponse {
  data: ProductReview[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}
