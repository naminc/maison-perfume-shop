import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { tokenStorage } from '@/lib/token';
import { authApi } from '@/api/auth';
import { accountApi } from '@/api/account';
import { QUERY_KEYS } from '@/constants/query-keys';
import { STALE_TIME } from '@/constants/query-config';
import type { AuthUser } from '@/types/auth';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const { data: user = null, isLoading } = useQuery({
    queryKey: QUERY_KEYS.account.profile,
    queryFn: accountApi.getProfile,
    enabled: !!tokenStorage.getAccess(),
    retry: false,
    staleTime: STALE_TIME.LONG,
    initialData: tokenStorage.getUserCache() as AuthUser | undefined,
    initialDataUpdatedAt: 0,
  });

  // Persist user cache mỗi khi data thay đổi
  useEffect(() => {
    if (user) {
      tokenStorage.setUserCache(user);
    }
  }, [user]);

  const setUser = (updated: AuthUser | null) => {
    queryClient.setQueryData(QUERY_KEYS.account.profile, updated);
    if (updated) tokenStorage.setUserCache(updated);
    else tokenStorage.clearUserCache();
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Local logout should still complete if the server session is already gone.
    } finally {
      tokenStorage.clearTokens();
      queryClient.setQueryData(QUERY_KEYS.account.profile, null);
      queryClient.clear();
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
