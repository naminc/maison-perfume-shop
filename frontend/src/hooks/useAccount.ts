import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { accountApi } from '@/api/account';
import { QUERY_KEYS } from '@/constants/query-keys';
import { useAuth } from '@/contexts/AuthContext';
import type { UpdateProfilePayload } from '@/types/account';

export function useProfile() {
  return useQuery({
    queryKey: QUERY_KEYS.account.profile,
    queryFn: accountApi.getProfile,
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
