import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminOrderApi } from "@/api/admin/order";
import { QUERY_KEYS } from "@/constants/query-keys";
import type { OrderListParams, OrderStatus } from "@/types/order";

export function useAdminOrders(params: OrderListParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.orders.list(params as Record<string, unknown>),
    queryFn: () => adminOrderApi.getOrders(params),
    placeholderData: keepPreviousData,
  });
}

export function useAdminOrder(order?: string | number) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.orders.detail(order ?? "missing"),
    queryFn: () => adminOrderApi.getOrder(order as string | number),
    enabled: Boolean(order),
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ order, status }: { order: string | number; status: OrderStatus }) =>
      adminOrderApi.updateOrderStatus(order, status),
    onSuccess: (order) => {
      queryClient.setQueryData(QUERY_KEYS.admin.orders.detail(order.id), order);
      queryClient.setQueryData(QUERY_KEYS.admin.orders.detail(order.order_code), order);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.orders.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.account.orders.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products.all });
    },
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (order: string | number) => adminOrderApi.deleteOrder(order),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.orders.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.account.orders.all });
    },
  });
}

export function useAdminOrderMutations() {
  const updateOrderStatus = useUpdateOrderStatus();
  const deleteOrder = useDeleteOrder();

  return {
    updateOrderStatus,
    deleteOrder,
  };
}
