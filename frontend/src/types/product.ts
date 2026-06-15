export type ProductStatus = "active" | "inactive";
export type ProductGender = "male" | "female" | "unisex";
export type ProductListStatusFilter = ProductStatus | "all";
export type ProductGenderFilter = ProductGender | "all";
export type ProductFeaturedFilter = "all" | "true" | "false";

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
  sku: string | null;
  short_description: string | null;
  description: string | null;
  image: string | null;
  gender: ProductGender;
  concentration: string | null;
  volume_ml: number | null;
  price: string;
  sale_price: string | null;
  stock: number;
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
}

export interface ProductPayload {
  brand_id?: number | null;
  category_id?: number | null;
  name: string;
  slug?: string | null;
  sku?: string | null;
  short_description?: string | null;
  description?: string | null;
  image?: string | null;
  gender: ProductGender;
  concentration?: string | null;
  volume_ml?: number | null;
  price: number;
  sale_price?: number | null;
  stock: number;
  status: ProductStatus;
  is_featured?: boolean;
  sort_order?: number;
}

export interface ProductListParams {
  search?: string;
  status?: ProductListStatusFilter;
  gender?: ProductGenderFilter;
  brand_id?: number | "all" | null;
  category_id?: number | "all" | null;
  is_featured?: ProductFeaturedFilter;
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
