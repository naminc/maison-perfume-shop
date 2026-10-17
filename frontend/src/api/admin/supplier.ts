import { api } from "@/lib/api";
import { unwrap } from "@/lib/unwrap";
import type { Supplier, SupplierListParams, SupplierListResponse, SupplierPayload } from "@/types/supplier";
const params = (value: SupplierListParams) => ({ ...value, search: value.search?.trim() || undefined, status: value.status === "all" ? undefined : value.status });
export const adminSupplierApi = {
  list: (query: SupplierListParams = {}) => api.get<{ data: SupplierListResponse }>("/v1/admin/suppliers", { params: params(query) }).then(unwrap),
  create: (payload: SupplierPayload) => api.post<{ data: Supplier }>("/v1/admin/suppliers", payload).then(unwrap),
  update: (id: number, payload: SupplierPayload) => api.put<{ data: Supplier }>(`/v1/admin/suppliers/${id}`, payload).then(unwrap),
  delete: (id: number) => api.delete(`/v1/admin/suppliers/${id}`).then(unwrap),
};
