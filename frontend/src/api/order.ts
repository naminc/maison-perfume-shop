import { api } from "@/lib/api";
import { unwrap } from "@/lib/unwrap";
import type { Order, OrderListParams, OrderListResponse, OrderPayload } from "@/types/order";

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

export const orderApi = {
  createOrder: (payload: OrderPayload) =>
    api.post<{ data: Order }>("/v1/orders", payload).then(unwrap),

  getMyOrders: (params: OrderListParams = {}) =>
    api
      .get<{ data: OrderListResponse }>("/v1/orders/my", {
        params: normalizeParams(params),
      })
      .then(unwrap),

  getMyOrder: (order: string) =>
    api.get<{ data: Order }>(`/v1/orders/${order}`).then(unwrap),
};
