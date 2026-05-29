import type {
  ProductFeaturedFilter,
  ProductGender,
  ProductGenderFilter,
  ProductListStatusFilter,
  ProductStatus,
} from "@/types/product";

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  active: "Đang hiển thị",
  inactive: "Tạm ẩn",
};

export const PRODUCT_GENDER_LABELS: Record<ProductGender, string> = {
  male: "Nam",
  female: "Nữ",
  unisex: "Unisex",
};

export const PRODUCT_STATUS_OPTIONS: Array<{ value: ProductStatus; label: string }> = [
  { value: "active", label: PRODUCT_STATUS_LABELS.active },
  { value: "inactive", label: PRODUCT_STATUS_LABELS.inactive },
];

export const PRODUCT_STATUS_FILTER_OPTIONS: Array<{ value: ProductListStatusFilter; label: string }> = [
  { value: "all", label: "Tất cả trạng thái" },
  ...PRODUCT_STATUS_OPTIONS,
];

export const PRODUCT_GENDER_OPTIONS: Array<{ value: ProductGender; label: string }> = [
  { value: "male", label: PRODUCT_GENDER_LABELS.male },
  { value: "female", label: PRODUCT_GENDER_LABELS.female },
  { value: "unisex", label: PRODUCT_GENDER_LABELS.unisex },
];

export const PRODUCT_GENDER_FILTER_OPTIONS: Array<{ value: ProductGenderFilter; label: string }> = [
  { value: "all", label: "Tất cả giới tính" },
  ...PRODUCT_GENDER_OPTIONS,
];

export const PRODUCT_FEATURED_FILTER_OPTIONS: Array<{ value: ProductFeaturedFilter; label: string }> = [
  { value: "all", label: "Tất cả nổi bật" },
  { value: "true", label: "Sản phẩm nổi bật" },
  { value: "false", label: "Không nổi bật" },
];

export const PRODUCT_PAGE_SIZE = 10;
