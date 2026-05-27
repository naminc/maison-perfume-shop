import type {
  AdminUserRole,
  AdminUserRoleFilter,
  AdminUserStatus,
  AdminUserStatusFilter,
} from "@/types/admin/user";

export const USER_ROLE_LABELS: Record<AdminUserRole, string> = {
  admin: "Quản trị viên",
  user: "Khách hàng",
};

export const USER_ROLE_OPTIONS: Array<{ value: AdminUserRole; label: string }> = [
  { value: "admin", label: USER_ROLE_LABELS.admin },
  { value: "user", label: USER_ROLE_LABELS.user },
];

export const USER_ROLE_FILTER_OPTIONS: Array<{ value: AdminUserRoleFilter; label: string }> = [
  { value: "all", label: "Tất cả vai trò" },
  ...USER_ROLE_OPTIONS,
];

export const USER_STATUS_LABELS: Record<AdminUserStatus, string> = {
  active: "Đang hoạt động",
  inactive: "Tạm khóa",
  banned: "Bị cấm",
};

export const USER_STATUS_OPTIONS: Array<{ value: AdminUserStatus; label: string }> = [
  { value: "active", label: USER_STATUS_LABELS.active },
  { value: "inactive", label: USER_STATUS_LABELS.inactive },
  { value: "banned", label: USER_STATUS_LABELS.banned },
];

export const USER_STATUS_FILTER_OPTIONS: Array<{ value: AdminUserStatusFilter; label: string }> = [
  { value: "all", label: "Tất cả trạng thái" },
  ...USER_STATUS_OPTIONS,
];

export const USER_PAGE_SIZE = 10;
