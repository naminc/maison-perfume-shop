import { api } from '@/lib/api';
import { unwrap } from '@/lib/unwrap';
import type { AddressPayload, UserAddress } from '@/types/address';

export const addressApi = {
  getAll: () =>
    api.get<{ data: UserAddress[] }>('/v1/account/addresses').then(unwrap),

  create: (payload: AddressPayload) =>
    api.post<{ data: UserAddress }>('/v1/account/addresses', payload).then(unwrap),

  update: (id: number, payload: AddressPayload) =>
    api.put<{ data: UserAddress }>(`/v1/account/addresses/${id}`, payload).then(unwrap),

  remove: (id: number) =>
    api.delete<{ data: null }>(`/v1/account/addresses/${id}`).then(unwrap),

  setDefault: (id: number) =>
    api.patch<{ data: null }>(`/v1/account/addresses/${id}/default`).then(unwrap),
};
