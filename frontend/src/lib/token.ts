const KEYS = {
  ACCESS:  'maison_access_token',
  REFRESH: 'maison_refresh_token',
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
  },
};
