import axios, { type AxiosError } from "axios";
import { toast } from "sonner";
import { tokenStorage } from "@/lib/token";

const API_CONNECTION_ERROR_MESSAGE =
  "Không thể kết nối đến API. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.";

let lastConnectionToastAt = 0;

type ApiConnectionError = AxiosError & {
  __apiConnectionNotified?: boolean;
};

const REFRESH_LOCK_KEY = "maison_refresh_lock";
const REFRESH_LOCK_TTL_MS = 10_000;
const REFRESH_WAIT_TIMEOUT_MS = 12_000;
const REFRESH_WAIT_INTERVAL_MS = 120;

type RefreshLock = {
  owner: string;
  expiresAt: number;
};

function isAuthEndpoint(url?: string) {
  if (!url) return false;
  return /\/v1\/auth\/(login|register|refresh|forgot-password|reset-password|logout)(\?|$)/.test(url);
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function createRefreshLockOwner() {
  const randomId = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

  return `${Date.now()}:${randomId}`;
}

function readRefreshLock(): RefreshLock | null {
  try {
    const raw = localStorage.getItem(REFRESH_LOCK_KEY);
    if (!raw) return null;

    const lock = JSON.parse(raw) as Partial<RefreshLock>;
    if (!lock.owner || typeof lock.expiresAt !== "number") return null;

    return lock as RefreshLock;
  } catch {
    return null;
  }
}

function acquireRefreshLock(owner: string) {
  const now = Date.now();
  const existing = readRefreshLock();

  if (existing && existing.expiresAt > now && existing.owner !== owner) {
    return false;
  }

  localStorage.setItem(REFRESH_LOCK_KEY, JSON.stringify({
    owner,
    expiresAt: now + REFRESH_LOCK_TTL_MS,
  }));

  return readRefreshLock()?.owner === owner;
}

function releaseRefreshLock(owner: string) {
  if (readRefreshLock()?.owner === owner) {
    localStorage.removeItem(REFRESH_LOCK_KEY);
  }
}

async function waitForRefreshFromAnotherContext(previousRefreshToken: string) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < REFRESH_WAIT_TIMEOUT_MS) {
    const latestAccessToken = tokenStorage.getAccess();
    const latestRefreshToken = tokenStorage.getRefresh();

    if (latestAccessToken && latestRefreshToken && latestRefreshToken !== previousRefreshToken) {
      return latestAccessToken;
    }

    const lock = readRefreshLock();
    if (!lock || lock.expiresAt <= Date.now()) {
      return null;
    }

    await sleep(REFRESH_WAIT_INTERVAL_MS);
  }

  return null;
}

function isLikelyHtmlResponse(data: unknown) {
  return typeof data === "string" && /<!doctype|<html/i.test(data);
}

function isUnexpectedApiEndpointResponse(error: AxiosError) {
  const status = error.response?.status;
  const contentType = String(error.response?.headers?.["content-type"] ?? "");

  return (
    (status === 404 || status === 405) &&
    (!contentType.includes("application/json") || isLikelyHtmlResponse(error.response?.data))
  );
}

export function isApiConnectionError(error: unknown) {
  if (!axios.isAxiosError(error)) return false;

  return (
    (!error.response &&
      (error.code === "ERR_NETWORK" ||
        error.code === "ECONNABORTED" ||
        error.message === "Network Error" ||
        !!error.request)) ||
    isUnexpectedApiEndpointResponse(error)
  );
}

export function wasApiConnectionNotified(error: unknown) {
  return axios.isAxiosError(error) && !!(error as ApiConnectionError).__apiConnectionNotified;
}

function notifyApiConnectionError(error: unknown) {
  if (!axios.isAxiosError(error)) return;
  if (!isApiConnectionError(error)) return;

  error.message = API_CONNECTION_ERROR_MESSAGE;
  (error as ApiConnectionError).__apiConnectionNotified = true;

  const now = Date.now();
  if (now - lastConnectionToastAt < 4000) return;

  lastConnectionToastAt = now;
  toast.error(API_CONNECTION_ERROR_MESSAGE, {
    id: "api-connection-error",
    duration: 5000,
  });
}

// Khởi tạo API client
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Gắn access token vào mọi request
api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const sessionId = tokenStorage.getSessionId();
  if (sessionId) {
    config.headers['X-Session-Id'] = sessionId;
  }
  return config;
});

// Tự động refresh khi 401
let isRefreshing = false;
let queue: Array<{
  resolve: (t: string) => void;
  reject: (e: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
  queue.forEach((p) => (token ? p.resolve(token) : p.reject(error)));
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
      window.location.href = "/auth/login";
      return Promise.reject(refreshError);
    } finally {
      if (lockAcquired) {
        releaseRefreshLock(lockOwner);
      }
      isRefreshing = false;
    }
  },
);
