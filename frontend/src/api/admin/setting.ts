import { api } from "@/lib/api";
import { unwrap } from "@/lib/unwrap";
import type { AdminSettingsGrouped, UpdateAdminSettingsPayload } from "@/types/admin/setting";

export const adminSettingApi = {
  getAll: () =>
    api.get<{ data: AdminSettingsGrouped }>("/v1/admin/settings").then(unwrap),

  update: (payload: UpdateAdminSettingsPayload) =>
    api.put<{ data: AdminSettingsGrouped }>("/v1/admin/settings", payload).then(unwrap),
};
