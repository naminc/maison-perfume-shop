import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminProductApi } from "@/api/admin/product";
import { QUERY_KEYS } from "@/constants/query-keys";
import { STALE_TIME } from "@/constants/query-config";
import type { ProductListParams, ProductPayload } from "@/types/product";

export function useAdminProducts(params: ProductListParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.products.list(params as Record<string, unknown>),
    queryFn: () => adminProductApi.getProducts(params),
    staleTime: STALE_TIME.DEFAULT,
  });
}

export function useAdminProduct(id?: number) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.products.detail(id ?? "new"),
    queryFn: () => adminProductApi.getProduct(id as number),
    enabled: Boolean(id),
    staleTime: STALE_TIME.DEFAULT,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProductPayload) => adminProductApi.createProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.products.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products.all });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ProductPayload }) =>
      adminProductApi.updateProduct(id, payload),
    onSuccess: (product) => {
      queryClient.setQueryData(QUERY_KEYS.admin.products.detail(product.id), product);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.products.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products.all });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminProductApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.products.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products.all });
    },
  });
}

export function useAdminProductMutations() {
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  return {
    createProduct,
    updateProduct,
    deleteProduct,
  };
}
