export type BrandStatus = "active" | "inactive";
export type BrandListStatusFilter = BrandStatus | "all";

export interface Brand {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  website: string | null;
  status: BrandStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface BrandPayload {
  name: string;
  slug?: string | null;
  description?: string | null;
  logo?: string | null;
  website?: string | null;
  status: BrandStatus;
  sort_order?: number;
}

export interface BrandListParams {
  search?: string;
  status?: BrandListStatusFilter;
  page?: number;
  per_page?: number;
}

export interface BrandListResponse {
  data: Brand[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}
