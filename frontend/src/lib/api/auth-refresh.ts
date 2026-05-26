import axios, { type AxiosInstance } from "axios";
import { notifyApiConnectionError } from "@/lib/api/connection-error";
import {
  acquireRefreshLock,
  createRefreshLockOwner,
  REFRESH_WAIT_INTERVAL_MS,
  releaseRefreshLock,
  sleep,
  waitForRefreshFromAnotherContext,
} from "@/lib/api/refresh-lock";
import { tokenStorage } from "@/lib/token";

function isAuthEndpoint(url?: string) {
  if (!url) return false;
  return /\/v1\/auth\/(login|register|refresh|forgot-password|reset-password|logout)(\?|$)/.test(url);
}

function redirectToLogin() {
  window.location.href = window.location.pathname.startsWith("/admin")
    ? "/admin/login"
    : "/auth/login";
}

export function installAuthRefreshInterceptors(api: AxiosInstance) {
  api.interceptors.request.use((config) => {
    const token = tokenStorage.getAccess();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const sessionId = tokenStorage.getSessionId();
    if (sessionId) {
      config.headers["X-Session-Id"] = sessionId;
    }

    return config;
  });

  let isRefreshing = false;
  let queue: Array<{
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
  }> = [];

  const processQueue = (error: unknown, token: string | null) => {
    queue.forEach((pending) => (token ? pending.resolve(token) : pending.reject(error)));
    queue = [];
  };

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      notifyApiConnectionError(error);

      const original = error.config;

      if (!original || error.response?.status !== 401 || original._retry || isAuthEndpoint(original.url)) {
        return Promise.reject(error);
      }

      const refreshToken = tokenStorage.getRefresh();
      if (!refreshToken) {
        tokenStorage.clearTokens();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({
            resolve: (token) => {
              original.headers.Authorization = `Bearer ${token}`;
              resolve(api(original));
            },
            reject,
          });
        });
      }

      original._retry = true;
      isRefreshing = true;

      const lockOwner = createRefreshLockOwner();
      let lockAcquired = false;
      let attemptedRefreshToken = refreshToken;

      try {
        while (!acquireRefreshLock(lockOwner)) {
          const refreshedAccessToken = await waitForRefreshFromAnotherContext(refreshToken);

          if (refreshedAccessToken) {
            processQueue(null, refreshedAccessToken);
            original.headers.Authorization = `Bearer ${refreshedAccessToken}`;
            return api(original);
          }

          await sleep(REFRESH_WAIT_INTERVAL_MS);
        }

        lockAcquired = true;

        const refreshTokenForRequest = tokenStorage.getRefresh();
        if (!refreshTokenForRequest) {
          tokenStorage.clearTokens();
          processQueue(error, null);
          return Promise.reject(error);
        }

        if (refreshTokenForRequest !== refreshToken) {
          const latestAccessToken = tokenStorage.getAccess();

          if (latestAccessToken) {
            processQueue(null, latestAccessToken);
            original.headers.Authorization = `Bearer ${latestAccessToken}`;
            return api(original);
          }
        }

        attemptedRefreshToken = refreshTokenForRequest;

        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/v1/auth/refresh`,
          { refresh_token: refreshTokenForRequest },
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              ...(tokenStorage.getSessionId() ? { "X-Session-Id": tokenStorage.getSessionId() } : {}),
            },
          },
        );

        const { access_token, refresh_token, session_id } = data.data;
        tokenStorage.setTokens(access_token, refresh_token);
        if (session_id) tokenStorage.setSessionId(session_id);
        processQueue(null, access_token);

        original.headers.Authorization = `Bearer ${access_token}`;
        return api(original);
      } catch (refreshError) {
        notifyApiConnectionError(refreshError);

        const latestAccessToken = tokenStorage.getAccess();
        const latestRefreshToken = tokenStorage.getRefresh();

        if (latestAccessToken && latestRefreshToken && latestRefreshToken !== attemptedRefreshToken) {
          processQueue(null, latestAccessToken);
          original.headers.Authorization = `Bearer ${latestAccessToken}`;
          return api(original);
        }

        processQueue(refreshError, null);
        tokenStorage.clearTokens();
        redirectToLogin();
        return Promise.reject(refreshError);
      } finally {
        if (lockAcquired) {
          releaseRefreshLock(lockOwner);
        }
        isRefreshing = false;
      }
    },
  );
}
