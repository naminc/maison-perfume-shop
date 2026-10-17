import type { OrderStatus, PaymentStatus } from "@/types/order";

export type DashboardPeriod = "today" | "7d" | "30d" | "custom";

export interface DashboardStatsParams {
  period?: DashboardPeriod;
  from?: string;
  to?: string;
}

export interface DashboardSummary {
  revenue: number;
  orders_count: number;
  new_customers: number;
  pending_reviews: number;
}

export interface DashboardRevenuePoint {
  date: string;
  revenue: number;
  orders_count: number;
}

export interface DashboardTopProduct {
  product_id: number | null;
  product_name: string;
  product_slug: string | null;
  product_image: string | null;
  total_quantity: number;
  total_revenue: number;
}

export interface DashboardRecentOrder {
  id: number;
  order_code: string;
  customer_name: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  total: number;
  created_at: string;
}

export interface DashboardLowStockProduct {
  id: number;
  product_id: number;
  name: string;
  variant_name: string | null;
  slug: string;
  sku: string;
  image: string | null;
  stock: number;
}

export interface DashboardStats {
  range: { from: string; to: string };
  summary: DashboardSummary;
  orders_by_status: Record<OrderStatus, number>;
  revenue_by_day: DashboardRevenuePoint[];
  top_products: DashboardTopProduct[];
  recent_orders: DashboardRecentOrder[];
  low_stock_products: DashboardLowStockProduct[];
}
