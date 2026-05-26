import { api } from "@/lib/api";
import { unwrap } from "@/lib/unwrap";
import type { Category, CategoryListParams, CategoryListResponse, CategoryPayload } from "@/types/category";

function normalizeParams(params: CategoryListParams = {}) {
  return {
    ...params,
    search: params.search?.trim() || undefined,
    status: params.status === "all" ? undefined : params.status,
    parent_id: params.parent_id ?? undefined,
  };
}

export const adminCategoryApi = {
  getCategories: (params: CategoryListParams = {}) =>
    api
      .get<{ data: CategoryListResponse }>("/v1/admin/categories", {
        params: normalizeParams(params),
      })
      .then(unwrap),

  getCategory: (id: number) =>
    api.get<{ data: Category }>(`/v1/admin/categories/${id}`).then(unwrap),

  createCategory: (payload: CategoryPayload) =>
    api.post<{ data: Category }>("/v1/admin/categories", payload).then(unwrap),

  updateCategory: (id: number, payload: CategoryPayload) =>
    api.put<{ data: Category }>(`/v1/admin/categories/${id}`, payload).then(unwrap),

  deleteCategory: (id: number) =>
    api.delete<{ data: null }>(`/v1/admin/categories/${id}`).then(unwrap),
};
