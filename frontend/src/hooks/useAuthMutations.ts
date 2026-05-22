import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/auth';
import { tokenStorage } from '@/lib/token';
import { useAuth } from '@/contexts/AuthContext';
import type { LoginPayload, RegisterPayload } from '@/types/auth';

export function useLogin() {
  const { setUser } = useAuth();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (data) => {
      tokenStorage.setTokens(data.access_token, data.refresh_token);
      setUser(data.user);
    },
  });
}

export function useRegister() {
  const { setUser } = useAuth();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: (data) => {
      tokenStorage.setTokens(data.access_token, data.refresh_token);
      setUser(data.user);
    },
  });
}

export function useLogout() {
  const { logout } = useAuth();
  return useMutation({ mutationFn: logout });
}
