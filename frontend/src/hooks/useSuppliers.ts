import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminSupplierApi } from "@/api/admin/supplier";
import { QUERY_KEYS } from "@/constants/query-keys";
import type { SupplierListParams, SupplierPayload } from "@/types/supplier";
export function useSuppliers(params: SupplierListParams = {}) { return useQuery({ queryKey: QUERY_KEYS.admin.suppliers.list(params as Record<string, unknown>), queryFn: () => adminSupplierApi.list(params), placeholderData: keepPreviousData }); }
export function useCreateSupplier() { const q = useQueryClient(); return useMutation({ mutationFn: adminSupplierApi.create, onSuccess: () => q.invalidateQueries({ queryKey: QUERY_KEYS.admin.suppliers.all }) }); }
export function useUpdateSupplier() { const q = useQueryClient(); return useMutation({ mutationFn: ({ id, payload }: { id: number; payload: SupplierPayload }) => adminSupplierApi.update(id, payload), onSuccess: () => q.invalidateQueries({ queryKey: QUERY_KEYS.admin.suppliers.all }) }); }
export function useDeleteSupplier() { const q = useQueryClient(); return useMutation({ mutationFn: adminSupplierApi.delete, onSuccess: () => q.invalidateQueries({ queryKey: QUERY_KEYS.admin.suppliers.all }) }); }
