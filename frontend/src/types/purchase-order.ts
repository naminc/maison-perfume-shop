import type { Product } from "@/types/product";
import type { Supplier } from "@/types/supplier";

export type PurchaseOrderStatus = "draft" | "ordered" | "received" | "cancelled";
export interface PurchaseOrderUser { id: number; full_name: string; email: string; }
export interface PurchaseOrderItem { id: number; product_id: number; product_variant_id: number; product_name: string; variant_name: string | null; sku: string | null; concentration: string | null; volume_ml: number | null; quantity: number; unit_cost: string; line_total: string; product?: Product | null; variant?: Product["variants"][number] | null; }
export interface PurchaseOrder {
  id: number; supplier_id: number; created_by: number | null; received_by: number | null; code: string;
  status: PurchaseOrderStatus; ordered_at: string | null; received_at: string | null; subtotal: string;
  discount: string; shipping_fee: string; total: string; reference: string | null; note: string | null;
  items: PurchaseOrderItem[]; items_count?: number; total_quantity?: number; supplier: Supplier;
  creator?: PurchaseOrderUser | null; receiver?: PurchaseOrderUser | null; created_at: string; updated_at: string;
}
export interface PurchaseOrderPayload { supplier_id: number; discount?: number; shipping_fee?: number; reference?: string | null; note?: string | null; items: Array<{ product_id: number; product_variant_id: number; quantity: number; unit_cost: number }>; }
export interface PurchaseOrderListParams { search?: string; supplier_id?: number | "all"; status?: PurchaseOrderStatus | "all"; date_from?: string; date_to?: string; page?: number; per_page?: number; }
export interface PurchaseOrderListResponse { data: PurchaseOrder[]; current_page: number; last_page: number; per_page: number; total: number; from: number | null; to: number | null; }
export interface PurchaseOrderSummary { total: number; draft: number; ordered: number; received: number; received_value: number; }
