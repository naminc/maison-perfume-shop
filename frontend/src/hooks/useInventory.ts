import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminInventoryApi } from "@/api/admin/inventory";
import { QUERY_KEYS } from "@/constants/query-keys";
import type { StockAdjustmentPayload, StockMovementListParams } from "@/types/inventory";

export function useStockMovements(params: StockMovementListParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.inventory.movements(params as Record<string, unknown>),
    queryFn: () => adminInventoryApi.getMovements(params),
    placeholderData: keepPreviousData,
  });
}

export function useProductStockMovements(productId?: number, params: StockMovementListParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.inventory.product(productId ?? "missing", params as Record<string, unknown>),
    queryFn: () => adminInventoryApi.getProductMovements(productId as number, params),
    enabled: Boolean(productId),
    placeholderData: keepPreviousData,
  });
}

export function useAdjustProductStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ variantId, payload }: { variantId: number; payload: StockAdjustmentPayload }) =>
      adminInventoryApi.adjustStock(variantId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.inventory.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.products.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products.all });
    },
  });
}
