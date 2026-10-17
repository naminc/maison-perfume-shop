import { api } from "@/lib/api";
import { unwrap } from "@/lib/unwrap";
import type {
  Contact,
  ContactListParams,
  ContactListResponse,
  UpdateContactPayload,
} from "@/types/contact";

function normalizeParams(params: ContactListParams = {}) {
  return {
    ...params,
    search: params.search?.trim() || undefined,
    status: params.status === "all" ? undefined : params.status,
  };
}

export const adminContactApi = {
  getContacts: (params: ContactListParams = {}) =>
    api
      .get<{ data: ContactListResponse }>("/v1/admin/contacts", {
        params: normalizeParams(params),
      })
      .then(unwrap),

  getContact: (id: number) =>
    api.get<{ data: Contact }>(`/v1/admin/contacts/${id}`).then(unwrap),

  updateContact: (id: number, payload: UpdateContactPayload) =>
    api.patch<{ data: Contact }>(`/v1/admin/contacts/${id}`, payload).then(unwrap),

  deleteContact: (id: number) =>
    api.delete<{ data: null }>(`/v1/admin/contacts/${id}`).then(unwrap),
};
