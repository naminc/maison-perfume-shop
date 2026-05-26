import axios, { type AxiosError } from "axios";
import { toast } from "sonner";

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

export function notifyApiConnectionError(error: unknown) {
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
