import { api } from "@/lib/api";
import type { StoreContactPayload } from "@/types/contact";

export const contactApi = {
  submit: (payload: StoreContactPayload) =>
    api.post<{ message: string }>("/v1/contacts", payload).then((res) => res.data),
};
