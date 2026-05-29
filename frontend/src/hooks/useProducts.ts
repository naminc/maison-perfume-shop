import { useQuery } from "@tanstack/react-query";
import { productApi } from "@/api/product";
import { QUERY_KEYS } from "@/constants/query-keys";
import { STALE_TIME } from "@/constants/query-config";
import type { ProductListParams } from "@/types/product";

export function useProducts(params: ProductListParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.products.list(params as Record<string, unknown>),
    queryFn: () => productApi.getProducts(params),
    staleTime: STALE_TIME.DEFAULT,
  });
}

export function useProductBySlug(slug?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.products.detail(slug ?? "missing"),
    queryFn: () => productApi.getProductBySlug(slug as string),
    enabled: Boolean(slug),
    staleTime: STALE_TIME.DEFAULT,
  });
}
