import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addressApi } from '@/api/address';
import { QUERY_KEYS } from '@/constants/query-keys';
import type { AddressPayload } from '@/types/address';

export function useAddresses() {
  return useQuery({
    queryKey: QUERY_KEYS.account.addresses,
    queryFn: addressApi.getAll,
  });
}

export function useCreateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddressPayload) => addressApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.account.addresses }),
  });
}

export function useUpdateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AddressPayload }) =>
      addressApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.account.addresses }),
  });
}

export function useDeleteAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => addressApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.account.addresses }),
  });
}

export function useSetDefaultAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => addressApi.setDefault(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.account.addresses }),
  });
}
