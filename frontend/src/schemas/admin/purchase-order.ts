import { z } from "zod";
export const purchaseOrderSchema = z.object({
  supplier_id: z.coerce.number().int().positive("Vui lòng chọn nhà cung cấp."),
  discount: z.coerce.number().min(0), shipping_fee: z.coerce.number().min(0), reference: z.string().trim().optional(), note: z.string().trim().optional(),
  items: z.array(z.object({ product_id: z.coerce.number().int().positive(), product_variant_id: z.coerce.number().int().positive(), quantity: z.coerce.number().int().min(1), unit_cost: z.coerce.number().min(0) })).min(1, "Vui lòng thêm sản phẩm."),
}).refine((value) => new Set(value.items.map((item) => item.product_variant_id)).size === value.items.length, { message: "Không được chọn trùng phiên bản.", path: ["items"] });
