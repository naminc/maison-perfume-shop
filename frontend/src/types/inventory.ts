import type { Product } from "@/types/product";

export type StockMovementType = "import" | "export" | "adjustment" | "order" | "order_cancelled";
export type AdminStockAdjustmentType = "import" | "export" | "adjustment";

export interface StockMovementOrder {
  id: number;
  order_code: string;
}

export interface StockMovementUser {
  id: number;
  full_name: string;
  email: string;
}

export interface StockMovement {
  id: number;
  product_id: number;
  order_id: number | null;
  user_id: number | null;
  type: StockMovementType;
  quantity: number;
  stock_before: number;
  stock_after: number;
  reference: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
  product?: Product | null;
  order?: StockMovementOrder | null;
  user?: StockMovementUser | null;
}

export interface StockMovementListParams {
  search?: string;
  product_id?: number;
  type?: StockMovementType | "all";
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}

export interface StockMovementListResponse {
  data: StockMovement[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface ProductStockMovementsResponse {
  found: boolean;
  product: Product;
  movements: StockMovementListResponse;
}

export interface StockAdjustmentPayload {
  type: AdminStockAdjustmentType;
  quantity: number;
  reference?: string | null;
  note?: string | null;
}
