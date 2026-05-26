import { api } from "@/lib/api";
import { unwrap } from "@/lib/unwrap";
import type { PublicSettings } from "@/types/setting";

export const settingApi = {
  getPublic: () =>
    api.get<{ data: PublicSettings }>("/v1/settings/public").then(unwrap),
};
