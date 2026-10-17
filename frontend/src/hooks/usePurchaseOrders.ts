import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminPurchaseOrderApi } from "@/api/admin/purchase-order";
import { QUERY_KEYS } from "@/constants/query-keys";
import type { PurchaseOrderListParams, PurchaseOrderPayload, PurchaseOrderStatus } from "@/types/purchase-order";

function useInvalidatePurchaseOrders() {
  const client = useQueryClient();
  return () => {
    client.invalidateQueries({ queryKey: QUERY_KEYS.admin.purchaseOrders.all });
    client.invalidateQueries({ queryKey: QUERY_KEYS.admin.inventory.all });
    client.invalidateQueries({ queryKey: QUERY_KEYS.admin.products.all });
    client.invalidateQueries({ queryKey: QUERY_KEYS.products.all });
  };
}
export function usePurchaseOrders(params: PurchaseOrderListParams = {}) { return useQuery({ queryKey: QUERY_KEYS.admin.purchaseOrders.list(params as Record<string, unknown>), queryFn: () => adminPurchaseOrderApi.list(params), placeholderData: keepPreviousData }); }
export function usePurchaseOrderSummary() { return useQuery({ queryKey: QUERY_KEYS.admin.purchaseOrders.summary, queryFn: adminPurchaseOrderApi.summary }); }
export function useCreatePurchaseOrder() { const invalidate = useInvalidatePurchaseOrders(); return useMutation({ mutationFn: adminPurchaseOrderApi.create, onSuccess: invalidate }); }
export function useUpdatePurchaseOrder() { const invalidate = useInvalidatePurchaseOrders(); return useMutation({ mutationFn: ({ id, payload }: { id: number; payload: PurchaseOrderPayload }) => adminPurchaseOrderApi.update(id, payload), onSuccess: invalidate }); }
export function useUpdatePurchaseOrderStatus() { const invalidate = useInvalidatePurchaseOrders(); return useMutation({ mutationFn: ({ id, status }: { id: number; status: PurchaseOrderStatus }) => adminPurchaseOrderApi.updateStatus(id, status), onSuccess: invalidate }); }
export function useDeletePurchaseOrder() { const invalidate = useInvalidatePurchaseOrders(); return useMutation({ mutationFn: adminPurchaseOrderApi.delete, onSuccess: invalidate }); }
