import { api } from "@/lib/api";
import { unwrap } from "@/lib/unwrap";
import type { DashboardStats, DashboardStatsParams } from "@/types/admin/dashboard";

function normalizeParams(params: DashboardStatsParams = {}) {
  return {
    period: params.period ?? "7d",
    from: params.period === "custom" ? params.from || undefined : undefined,
    to: params.period === "custom" ? params.to || undefined : undefined,
  };
}

export const adminDashboardApi = {
  getStats: (params: DashboardStatsParams = {}) =>
    api
      .get<{ data: DashboardStats }>("/v1/admin/dashboard/stats", {
        params: normalizeParams(params),
      })
      .then(unwrap),
};
