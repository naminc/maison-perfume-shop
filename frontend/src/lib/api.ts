import axios, { type AxiosError } from "axios";
import { toast } from "sonner";
import { tokenStorage } from "@/lib/token";

const API_CONNECTION_ERROR_MESSAGE =
  "Không thể kết nối đến API. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.";

let lastConnectionToastAt = 0;

type ApiConnectionError = AxiosError & {
  __apiConnectionNotified?: boolean;
};

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

    if (error.response?.status !== 401 || original._retry) {
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

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/v1/auth/refresh`,
        { refresh_token: refreshToken },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
      );

      const { access_token, refresh_token } = data.data;
      tokenStorage.setTokens(access_token, refresh_token);
      processQueue(null, access_token);

      original.headers.Authorization = `Bearer ${access_token}`;
      return api(original);
    } catch (refreshError) {
      notifyApiConnectionError(refreshError);
      processQueue(refreshError, null);
      tokenStorage.clearTokens();
      window.location.href = "/auth/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
