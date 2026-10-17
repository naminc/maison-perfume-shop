export type ContactStatus = "pending" | "replied" | "closed";

export type ContactStatusFilter = ContactStatus | "all";

export interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: ContactStatus;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactListParams {
  search?: string;
  status?: ContactStatusFilter;
  page?: number;
  per_page?: number;
}

export interface ContactListResponse {
  data: Contact[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface StoreContactPayload {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export interface UpdateContactPayload {
  status?: ContactStatus;
  admin_note?: string | null;
}
