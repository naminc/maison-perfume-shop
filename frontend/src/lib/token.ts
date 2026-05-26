import { STORAGE_KEYS } from "@/constants/storage-keys";

export const tokenStorage = {
  getAccess:      () => localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
  getRefresh:     () => localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
  setAccess:      (t: string) => localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, t),
  setRefresh:     (t: string) => localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, t),
  getSessionId:   () => localStorage.getItem(STORAGE_KEYS.SESSION_ID),
  setSessionId:   (id: string | number) => localStorage.setItem(STORAGE_KEYS.SESSION_ID, String(id)),
  setTokens:      (access: string, refresh: string) => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh);
  },
  clearTokens:    () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.SESSION_ID);
    sessionStorage.removeItem(STORAGE_KEYS.USER_CACHE);
  },

  getUserCache:  () => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEYS.USER_CACHE);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },
  setUserCache:  (user: unknown) => {
    try { sessionStorage.setItem(STORAGE_KEYS.USER_CACHE, JSON.stringify(user)); }
    catch { /* quota exceeded - non-critical */ }
  },
  clearUserCache: () => sessionStorage.removeItem(STORAGE_KEYS.USER_CACHE),
};
