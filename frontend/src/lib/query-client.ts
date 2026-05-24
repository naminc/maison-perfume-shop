import { QueryClient } from '@tanstack/react-query';
import { STALE_TIME } from '@/constants/query-config';
import { QUERY_KEYS } from '@/constants/query-keys';
import { accountApi } from '@/api/account';
import { tokenStorage } from '@/lib/token';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: STALE_TIME.DEFAULT,
    },
  },
});

/**
 * Prefetch dữ liệu cần thiết trước khi React render.
 * Gọi 1 lần duy nhất ở entry point — tách ra để main.tsx gọn.
 */
export function prefetchCriticalData() {
  if (tokenStorage.getAccess()) {
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.account.profile,
      queryFn: accountApi.getProfile,
      staleTime: STALE_TIME.LONG,
    });
  }
}

