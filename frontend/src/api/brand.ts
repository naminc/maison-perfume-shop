import { api } from "@/lib/api";
import { unwrap } from "@/lib/unwrap";
import type { Brand } from "@/types/brand";

export const brandApi = {
  getPublicBrands: () =>
    api.get<{ data: Brand[] }>("/v1/brands").then(unwrap),
};
