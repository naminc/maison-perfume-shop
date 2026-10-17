export type ProductStatus = "active" | "inactive";
export type ProductGender = "male" | "female" | "unisex";
export type ProductVariantStatus = "active" | "inactive";
export type ProductListStatusFilter = ProductStatus | "all";
export type ProductGenderFilter = ProductGender | "all";
export type ProductFeaturedFilter = "all" | "true" | "false";
export type ProductSort = "popular" | "price-asc" | "price-desc" | "newest";

export interface ProductRelation {
  id: number;
  name: string;
  slug?: string;
}

export interface Product {
  id: number;
  brand_id: number | null;
  category_id: number | null;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  image: string | null;
  gender: ProductGender;
  status: ProductStatus;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  rating_average?: number | string | null;
  rating_count?: number;
  brand?: ProductRelation | null;
  category?: ProductRelation | null;
  variants: ProductVariant[];
  default_variant?: ProductVariant | null;
  min_price: string | null;
  min_sale_price: string | null;
  total_stock: number;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  sku: string;
  name: string | null;
  concentration: string | null;
  volume_ml: number | null;
  price: string;
  sale_price: string | null;
  stock: number;
  status: ProductVariantStatus;
  is_default: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProductVariantPayload {
  id?: number;
  sku: string;
  name?: string | null;
  concentration?: string | null;
  volume_ml?: number | null;
  price: number;
  sale_price?: number | null;
  stock?: number;
  status: ProductVariantStatus;
  is_default?: boolean;
  sort_order?: number;
}

export interface ProductPayload {
  brand_id?: number | null;
  category_id?: number | null;
  name: string;
  slug?: string | null;
  short_description?: string | null;
  description?: string | null;
  image?: string | null;
  gender: ProductGender;
  status: ProductStatus;
  is_featured?: boolean;
  sort_order?: number;
  variants: ProductVariantPayload[];
}

export interface ProductListParams {
  search?: string;
  status?: ProductListStatusFilter;
  gender?: ProductGenderFilter;
  brand_id?: number | "all" | null;
  category_id?: number | "all" | null;
  is_featured?: ProductFeaturedFilter;
  in_stock?: boolean;
  sort?: ProductSort;
  page?: number;
  per_page?: number;
}

export interface ProductListResponse {
  data: Product[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}
