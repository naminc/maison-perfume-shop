import { api } from "@/lib/api";
import { unwrap } from "@/lib/unwrap";
import type {
  AdminUser,
  AdminUserListParams,
  AdminUserListResponse,
  AdminUserPayload,
} from "@/types/admin/user";

function normalizeParams(params: AdminUserListParams = {}) {
  return {
    ...params,
    search: params.search?.trim() || undefined,
    role: params.role === "all" ? undefined : params.role,
    status: params.status === "all" ? undefined : params.status,
  };
}

export const adminUserApi = {
  getUsers: (params: AdminUserListParams = {}) =>
    api
      .get<{ data: AdminUserListResponse }>("/v1/admin/users", {
        params: normalizeParams(params),
      })
      .then(unwrap),

  getUser: (id: number) =>
    api.get<{ data: AdminUser }>(`/v1/admin/users/${id}`).then(unwrap),

  updateUser: (id: number, payload: AdminUserPayload) =>
    api.put<{ data: AdminUser }>(`/v1/admin/users/${id}`, payload).then(unwrap),

  deleteUser: (id: number) =>
    api.delete<{ data: null }>(`/v1/admin/users/${id}`).then(unwrap),
};
