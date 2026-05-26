import type { CategoryListStatusFilter, CategoryStatus } from "@/types/category";

export const CATEGORY_STATUS_LABELS: Record<CategoryStatus, string> = {
  active: "Đang hiển thị",
  inactive: "Tạm ẩn",
};

export const CATEGORY_STATUS_OPTIONS: Array<{ value: CategoryStatus; label: string }> = [
  { value: "active", label: CATEGORY_STATUS_LABELS.active },
  { value: "inactive", label: CATEGORY_STATUS_LABELS.inactive },
];

export const CATEGORY_STATUS_FILTER_OPTIONS: Array<{ value: CategoryListStatusFilter; label: string }> = [
  { value: "all", label: "Tất cả trạng thái" },
  ...CATEGORY_STATUS_OPTIONS,
];

export const CATEGORY_PAGE_SIZE = 10;
