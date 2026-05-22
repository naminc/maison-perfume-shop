const KEYS = {
  ACCESS:  'maison_access_token',
  REFRESH: 'maison_refresh_token',
  USER_CACHE: 'maison_user_cache',
} as const;

export const tokenStorage = {
  getAccess:      () => localStorage.getItem(KEYS.ACCESS),
  getRefresh:     () => localStorage.getItem(KEYS.REFRESH),
  setAccess:      (t: string) => localStorage.setItem(KEYS.ACCESS, t),
  setRefresh:     (t: string) => localStorage.setItem(KEYS.REFRESH, t),
  setTokens:      (access: string, refresh: string) => {
    localStorage.setItem(KEYS.ACCESS, access);
    localStorage.setItem(KEYS.REFRESH, refresh);
  },
  clearTokens:    () => {
    localStorage.removeItem(KEYS.ACCESS);
    localStorage.removeItem(KEYS.REFRESH);
    sessionStorage.removeItem(KEYS.USER_CACHE);
  },

  getUserCache:  () => {
    try {
      const raw = sessionStorage.getItem(KEYS.USER_CACHE);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },
  setUserCache:  (user: unknown) => {
    try { sessionStorage.setItem(KEYS.USER_CACHE, JSON.stringify(user)); }
    catch { /* quota exceeded — non-critical */ }
  },
  clearUserCache: () => sessionStorage.removeItem(KEYS.USER_CACHE),
};
