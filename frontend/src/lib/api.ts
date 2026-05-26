import axios from "axios";
import { installAuthRefreshInterceptors } from "@/lib/api/auth-refresh";

export { isApiConnectionError, wasApiConnectionNotified } from "@/lib/api/connection-error";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

installAuthRefreshInterceptors(api);
