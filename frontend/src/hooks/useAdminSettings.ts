import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminSettingApi } from "@/api/admin/setting";
import { QUERY_KEYS } from "@/constants/query-keys";
import { STALE_TIME } from "@/constants/query-config";
import type { UpdateAdminSettingsPayload } from "@/types/admin/setting";

export function useAdminSettings() {
  return useQuery({
    queryKey: QUERY_KEYS.admin.settings,
    queryFn: adminSettingApi.getAll,
    staleTime: STALE_TIME.LONG,
  });
}

export function useUpdateAdminSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateAdminSettingsPayload) => adminSettingApi.update(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.admin.settings, data);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.settings.public });
    },
  });
}
