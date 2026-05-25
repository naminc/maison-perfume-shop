import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { accountApi } from '@/api/account';
import { QUERY_KEYS } from '@/constants/query-keys';
import { useAuth } from '@/contexts/AuthContext';
import type { ChangePasswordPayload, UpdateProfilePayload } from '@/types/account';

export function useProfile() {
  return useQuery({
    queryKey: QUERY_KEYS.account.profile,
    queryFn: accountApi.getProfile,
  });
}

export function useSessions(page: number) {
  return useQuery({
    queryKey: QUERY_KEYS.account.sessions(page),
    queryFn: () => accountApi.getSessions(page),
    placeholderData: keepPreviousData,
  });
}

function invalidateSessions(queryClient: ReturnType<typeof useQueryClient>) {
  return queryClient.invalidateQueries({
    queryKey: ['account', 'sessions'],
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: number) => accountApi.revokeSession(sessionId),
    onSuccess: () => {
      void invalidateSessions(queryClient);
    },
  });
}

export function useRevokeOtherSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: accountApi.revokeOtherSessions,
    onSuccess: () => {
      void invalidateSessions(queryClient);
    },
  });
}

export function useRevokeAllSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: accountApi.revokeAllSessions,
    onSuccess: () => {
      void invalidateSessions(queryClient);
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => accountApi.changePassword(payload),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { setUser } = useAuth();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => accountApi.updateProfile(payload),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      queryClient.setQueryData(QUERY_KEYS.account.profile, updatedUser);
    },
  });
}
