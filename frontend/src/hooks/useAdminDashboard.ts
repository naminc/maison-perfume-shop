import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { adminDashboardApi } from "@/api/admin/dashboard";
import { QUERY_KEYS } from "@/constants/query-keys";
import type { DashboardStatsParams } from "@/types/admin/dashboard";

export function useAdminDashboard(params: DashboardStatsParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.dashboard.stats(params as Record<string, unknown>),
    queryFn: () => adminDashboardApi.getStats(params),
    placeholderData: keepPreviousData,
  });
}
