export type AdminUserRole = "admin" | "user";
export type AdminUserStatus = "active" | "inactive" | "banned";
export type AdminUserRoleFilter = AdminUserRole | "all";
export type AdminUserStatusFilter = AdminUserStatus | "all";

export interface AdminUser {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  role: AdminUserRole;
  status: AdminUserStatus;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminUserPayload {
  full_name: string;
  email: string;
  phone?: string | null;
  role: AdminUserRole;
  status: AdminUserStatus;
}

export interface AdminUserListParams {
  search?: string;
  role?: AdminUserRoleFilter;
  status?: AdminUserStatusFilter;
  page?: number;
  per_page?: number;
}

export interface AdminUserListResponse {
  data: AdminUser[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}
