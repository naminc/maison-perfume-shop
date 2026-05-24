import { api } from '@/lib/api';
import { unwrap } from '@/lib/unwrap';
import type { VnProvince, VnWard } from '@/types/address';

export const geoApi = {
  getProvinces: () =>
    api.get<{ data: VnProvince[] }>('/v1/geo/provinces').then(unwrap),

  getWards: (provinceCode: string) =>
    api.get<{ data: VnWard[] }>(`/v1/geo/provinces/${provinceCode}/wards`).then(unwrap),
};
