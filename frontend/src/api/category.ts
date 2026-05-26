import { api } from "@/lib/api";
import { unwrap } from "@/lib/unwrap";
import type { Category } from "@/types/category";

export const categoryApi = {
  getPublicCategories: () =>
    api.get<{ data: Category[] }>("/v1/categories").then(unwrap),
};
