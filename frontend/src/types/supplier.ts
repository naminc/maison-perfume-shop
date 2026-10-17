export type SupplierStatus = "active" | "inactive";
export interface Supplier {
  id: number; name: string; code: string; contact_name: string | null; phone: string | null;
  email: string | null; address: string | null; tax_code: string | null; note: string | null;
  status: SupplierStatus; purchase_orders_count?: number; created_at: string; updated_at: string;
}
export interface SupplierPayload { name: string; code?: string | null; contact_name?: string | null; phone?: string | null; email?: string | null; address?: string | null; tax_code?: string | null; note?: string | null; status: SupplierStatus; }
export interface SupplierListParams { search?: string; status?: SupplierStatus | "all"; page?: number; per_page?: number; }
export interface SupplierListResponse { data: Supplier[]; current_page: number; last_page: number; per_page: number; total: number; from: number | null; to: number | null; }
