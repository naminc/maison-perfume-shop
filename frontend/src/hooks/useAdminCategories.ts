import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminCategoryApi } from "@/api/admin/category";
import { QUERY_KEYS } from "@/constants/query-keys";
import { STALE_TIME } from "@/constants/query-config";
import type { CategoryListParams, CategoryPayload } from "@/types/category";

export function useAdminCategories(params: CategoryListParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.categories.list(params as Record<string, unknown>),
    queryFn: () => adminCategoryApi.getCategories(params),
    staleTime: STALE_TIME.DEFAULT,
  });
}

export function useAdminCategory(id?: number) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.categories.detail(id ?? "new"),
    queryFn: () => adminCategoryApi.getCategory(id as number),
    enabled: Boolean(id),
    staleTime: STALE_TIME.DEFAULT,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CategoryPayload) => adminCategoryApi.createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.categories.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories.publicTree });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CategoryPayload }) =>
      adminCategoryApi.updateCategory(id, payload),
    onSuccess: (category) => {
      queryClient.setQueryData(QUERY_KEYS.admin.categories.detail(category.id), category);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.categories.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories.publicTree });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminCategoryApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.categories.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories.publicTree });
    },
  });
}
