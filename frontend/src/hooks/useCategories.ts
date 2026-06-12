import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { categoryApi } from "@/api/category";
import { GC_TIME, STALE_TIME } from "@/constants/query-config";
import { QUERY_KEYS } from "@/constants/query-keys";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { readStoredQueryData, writeStoredQueryData } from "@/lib/query-cache";
import type { Category } from "@/types/category";

function isCategoryList(value: unknown): value is Category[] {
  return Array.isArray(value) && value.every((item) => {
    if (!item || typeof item !== "object") return false;
    const category = item as Partial<Category>;

    return (
      typeof category.id === "number" &&
      typeof category.name === "string" &&
      typeof category.slug === "string"
    );
  });
}

export function useCategories() {
  const cached = readStoredQueryData(STORAGE_KEYS.PUBLIC_CATEGORIES, isCategoryList);

  const query = useQuery({
    queryKey: QUERY_KEYS.categories.publicTree,
    queryFn: categoryApi.getPublicCategories,
    staleTime: STALE_TIME.LONG,
    gcTime: GC_TIME.DEFAULT,
    initialData: cached?.data,
    initialDataUpdatedAt: cached?.updatedAt,
  });

  useEffect(() => {
    if (query.data) {
      writeStoredQueryData(STORAGE_KEYS.PUBLIC_CATEGORIES, query.data, query.dataUpdatedAt);
    }
  }, [query.data, query.dataUpdatedAt]);

  return query;
}
