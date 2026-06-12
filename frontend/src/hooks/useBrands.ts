import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { brandApi } from "@/api/brand";
import { GC_TIME, STALE_TIME } from "@/constants/query-config";
import { QUERY_KEYS } from "@/constants/query-keys";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { readStoredQueryData, writeStoredQueryData } from "@/lib/query-cache";
import type { Brand } from "@/types/brand";

function isBrandList(value: unknown): value is Brand[] {
  return Array.isArray(value) && value.every((item) => {
    if (!item || typeof item !== "object") return false;
    const brand = item as Partial<Brand>;

    return (
      typeof brand.id === "number" &&
      typeof brand.name === "string" &&
      typeof brand.slug === "string"
    );
  });
}

export function useBrands() {
  const cached = readStoredQueryData(STORAGE_KEYS.PUBLIC_BRANDS, isBrandList);

  const query = useQuery({
    queryKey: QUERY_KEYS.brands.publicList,
    queryFn: brandApi.getPublicBrands,
    staleTime: STALE_TIME.LONG,
    gcTime: GC_TIME.DEFAULT,
    initialData: cached?.data,
    initialDataUpdatedAt: cached?.updatedAt,
  });

  useEffect(() => {
    if (query.data) {
      writeStoredQueryData(STORAGE_KEYS.PUBLIC_BRANDS, query.data, query.dataUpdatedAt);
    }
  }, [query.data, query.dataUpdatedAt]);

  return query;
}
