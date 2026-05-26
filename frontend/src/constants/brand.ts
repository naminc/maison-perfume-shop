import type { BrandListStatusFilter, BrandStatus } from "@/types/brand";

export const BRAND_STATUS_LABELS: Record<BrandStatus, string> = {
  active: "Đang hiển thị",
  inactive: "Tạm ẩn",
};

export const BRAND_STATUS_OPTIONS: Array<{ value: BrandStatus; label: string }> = [
  { value: "active", label: BRAND_STATUS_LABELS.active },
  { value: "inactive", label: BRAND_STATUS_LABELS.inactive },
];

export const BRAND_STATUS_FILTER_OPTIONS: Array<{ value: BrandListStatusFilter; label: string }> = [
  { value: "all", label: "Tất cả trạng thái" },
  ...BRAND_STATUS_OPTIONS,
];

export const BRAND_PAGE_SIZE = 10;
