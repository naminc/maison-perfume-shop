import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminBrandApi } from "@/api/admin/brand";
import { QUERY_KEYS } from "@/constants/query-keys";
import { STALE_TIME } from "@/constants/query-config";
import type { BrandListParams, BrandPayload } from "@/types/brand";

export function useAdminBrands(params: BrandListParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.brands.list(params as Record<string, unknown>),
    queryFn: () => adminBrandApi.getBrands(params),
    staleTime: STALE_TIME.DEFAULT,
  });
}

export function useAdminBrand(id?: number) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.brands.detail(id ?? "new"),
    queryFn: () => adminBrandApi.getBrand(id as number),
    enabled: Boolean(id),
    staleTime: STALE_TIME.DEFAULT,
  });
}

export function useCreateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BrandPayload) => adminBrandApi.createBrand(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.brands.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.brands.publicList });
    },
  });
}

export function useUpdateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: BrandPayload }) =>
      adminBrandApi.updateBrand(id, payload),
    onSuccess: (brand) => {
      queryClient.setQueryData(QUERY_KEYS.admin.brands.detail(brand.id), brand);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.brands.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.brands.publicList });
    },
  });
}

export function useDeleteBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminBrandApi.deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.brands.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.brands.publicList });
    },
  });
}
