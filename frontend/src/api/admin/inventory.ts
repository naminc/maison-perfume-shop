import { api } from "@/lib/api";
import { unwrap } from "@/lib/unwrap";
import type {
  ProductStockMovementsResponse,
  StockAdjustmentPayload,
  StockMovement,
  StockMovementListParams,
  StockMovementListResponse,
} from "@/types/inventory";

function normalizeParams(params: StockMovementListParams = {}) {
  return {
    ...params,
    search: params.search?.trim() || undefined,
    type: params.type === "all" ? undefined : params.type,
    date_from: params.date_from || undefined,
    date_to: params.date_to || undefined,
  };
}

export const adminInventoryApi = {
  getMovements: (params: StockMovementListParams = {}) =>
    api.get<{ data: StockMovementListResponse }>("/v1/admin/inventory/movements", { params: normalizeParams(params) }).then(unwrap),

  getProductMovements: (productId: number, params: StockMovementListParams = {}) =>
    api.get<{ data: ProductStockMovementsResponse }>(`/v1/admin/products/${productId}/stock-movements`, { params: normalizeParams(params) }).then(unwrap),

  adjustStock: (productId: number, payload: StockAdjustmentPayload) =>
    api.post<{ data: StockMovement }>(`/v1/admin/products/${productId}/stock-adjustments`, payload).then(unwrap),
};
