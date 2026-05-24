import { useQuery } from '@tanstack/react-query';
import { geoApi } from '@/api/geo';
import { STALE_TIME } from '@/constants/query-config';
import { QUERY_KEYS } from '@/constants/query-keys';

export function useProvinces() {
  return useQuery({
    queryKey: QUERY_KEYS.geo.provinces,
    queryFn: geoApi.getProvinces,
    staleTime: STALE_TIME.LONG,
  });
}

export function useWards(provinceCode: string) {
  return useQuery({
    queryKey: QUERY_KEYS.geo.wards(provinceCode),
    queryFn: () => geoApi.getWards(provinceCode),
    enabled: provinceCode.length > 0,
    staleTime: STALE_TIME.LONG,
  });
}
