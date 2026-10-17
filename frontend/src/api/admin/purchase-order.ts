import { api } from "@/lib/api";
import { unwrap } from "@/lib/unwrap";
import type { PurchaseOrder, PurchaseOrderListParams, PurchaseOrderListResponse, PurchaseOrderPayload, PurchaseOrderStatus, PurchaseOrderSummary } from "@/types/purchase-order";
const params = (value: PurchaseOrderListParams) => ({ ...value, search: value.search?.trim() || undefined, supplier_id: value.supplier_id === "all" ? undefined : value.supplier_id, status: value.status === "all" ? undefined : value.status });
export const adminPurchaseOrderApi = {
  list: (query: PurchaseOrderListParams = {}) => api.get<{ data: PurchaseOrderListResponse }>("/v1/admin/purchase-orders", { params: params(query) }).then(unwrap),
  summary: () => api.get<{ data: PurchaseOrderSummary }>("/v1/admin/purchase-orders/summary").then(unwrap),
  get: (id: number) => api.get<{ data: PurchaseOrder }>(`/v1/admin/purchase-orders/${id}`).then(unwrap),
  create: (payload: PurchaseOrderPayload) => api.post<{ data: PurchaseOrder }>("/v1/admin/purchase-orders", payload).then(unwrap),
  update: (id: number, payload: PurchaseOrderPayload) => api.put<{ data: PurchaseOrder }>(`/v1/admin/purchase-orders/${id}`, payload).then(unwrap),
  updateStatus: (id: number, status: PurchaseOrderStatus) => api.patch<{ data: PurchaseOrder }>(`/v1/admin/purchase-orders/${id}/status`, { status }).then(unwrap),
  delete: (id: number) => api.delete(`/v1/admin/purchase-orders/${id}`).then(unwrap),
};
