export type CategoryStatus = "active" | "inactive";
export type CategoryListStatusFilter = CategoryStatus | "all";

export interface CategorySummary {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parent_id: number | null;
  status: CategoryStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  parent?: CategorySummary | null;
  children?: Category[];
}

export interface CategoryPayload {
  name: string;
  slug?: string | null;
  description?: string | null;
  parent_id?: number | null;
  status: CategoryStatus;
  sort_order?: number;
}

export interface CategoryListParams {
  search?: string;
  status?: CategoryListStatusFilter;
  parent_id?: number | null;
  page?: number;
  per_page?: number;
}

export interface CategoryListResponse {
  data: Category[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}
