import { api } from "@/lib/api";
import { unwrap } from "@/lib/unwrap";
import type { Order, OrderListParams, OrderListResponse, OrderStatus } from "@/types/order";

function normalizeParams(params: OrderListParams = {}) {
  return {
    ...params,
    search: params.search?.trim() || undefined,
    status: params.status === "all" ? undefined : params.status,
    payment_status: params.payment_status === "all" ? undefined : params.payment_status,
    payment_method: params.payment_method === "all" ? undefined : params.payment_method,
    date_from: params.date_from || undefined,
    date_to: params.date_to || undefined,
  };
}

export const adminOrderApi = {
  getOrders: (params: OrderListParams = {}) =>
    api
      .get<{ data: OrderListResponse }>("/v1/admin/orders", {
        params: normalizeParams(params),
      })
      .then(unwrap),

  getOrder: (order: string | number) =>
    api.get<{ data: Order }>(`/v1/admin/orders/${order}`).then(unwrap),

  updateOrderStatus: (order: string | number, status: OrderStatus) =>
    api.patch<{ data: Order }>(`/v1/admin/orders/${order}/status`, { status }).then(unwrap),

  deleteOrder: (order: string | number) =>
    api.delete<{ data: null }>(`/v1/admin/orders/${order}`).then(unwrap),
};
