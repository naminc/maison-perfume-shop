import { z } from "zod";
export const supplierSchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập tên nhà cung cấp."), code: z.string().trim().optional(),
  contact_name: z.string().trim().optional(), phone: z.string().trim().optional(),
  email: z.union([z.literal(""), z.string().email("Email không hợp lệ.")]).optional(), address: z.string().trim().optional(),
  tax_code: z.string().trim().optional(), note: z.string().trim().optional(), status: z.enum(["active", "inactive"]),
});
