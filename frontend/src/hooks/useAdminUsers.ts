import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminUserApi } from "@/api/admin/user";
import { QUERY_KEYS } from "@/constants/query-keys";
import { STALE_TIME } from "@/constants/query-config";
import type { AdminUserListParams, AdminUserPayload } from "@/types/admin/user";

export function useAdminUsers(params: AdminUserListParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.users.list(params as Record<string, unknown>),
    queryFn: () => adminUserApi.getUsers(params),
    staleTime: STALE_TIME.DEFAULT,
  });
}

export function useAdminUser(id?: number) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.users.detail(id ?? "new"),
    queryFn: () => adminUserApi.getUser(id as number),
    enabled: Boolean(id),
    staleTime: STALE_TIME.DEFAULT,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AdminUserPayload }) =>
      adminUserApi.updateUser(id, payload),
    onSuccess: (user) => {
      queryClient.setQueryData(QUERY_KEYS.admin.users.detail(user.id), user);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.users.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.account.profile });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminUserApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.users.all });
    },
  });
}
