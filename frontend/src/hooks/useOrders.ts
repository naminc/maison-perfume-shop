import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orderApi } from "@/api/order";
import { QUERY_KEYS } from "@/constants/query-keys";
import type { OrderListParams, OrderPayload } from "@/types/order";

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: OrderPayload) => orderApi.createOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.account.orders.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products.all });
    },
  });
}

export function useMyOrders(params: OrderListParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.account.orders.list(params as Record<string, unknown>),
    queryFn: () => orderApi.getMyOrders(params),
    placeholderData: keepPreviousData,
  });
}

export function useMyOrder(order?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.account.orders.detail(order ?? "missing"),
    queryFn: () => orderApi.getMyOrder(order as string),
    enabled: Boolean(order),
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (order: string) => orderApi.cancelMyOrder(order),
    onSuccess: (order) => {
      queryClient.setQueryData(QUERY_KEYS.account.orders.detail(order.order_code), order);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.account.orders.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products.all });
    },
  });
}
