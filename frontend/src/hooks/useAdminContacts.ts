import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminContactApi } from "@/api/admin/contact";
import { QUERY_KEYS } from "@/constants/query-keys";
import type { ContactListParams, UpdateContactPayload } from "@/types/contact";

export function useAdminContacts(params: ContactListParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.contacts.list(params as Record<string, unknown>),
    queryFn: () => adminContactApi.getContacts(params),
    placeholderData: keepPreviousData,
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateContactPayload }) =>
      adminContactApi.updateContact(id, payload),
    onSuccess: (contact) => {
      queryClient.setQueryData(QUERY_KEYS.admin.contacts.detail(contact.id), contact);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.contacts.all });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminContactApi.deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.contacts.all });
    },
  });
}
