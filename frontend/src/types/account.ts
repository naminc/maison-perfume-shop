export interface UpdateProfilePayload {
  full_name: string;
  email: string;
  phone?: string | null;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface LoginSessionItem {
  id: number;
  device: string;
  platform: string;
  browser: string;
  ip_address: string | null;
  location: string | null;
  is_current: boolean;
  last_active_at: string;
  created_at: string;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PaginatedSessions {
  items: LoginSessionItem[];
  meta: PaginationMeta;
}

export interface RevokeSessionResponse {
  revoked_current: boolean;
}

export interface RevokeSessionsResponse {
  revoked_count: number;
}
