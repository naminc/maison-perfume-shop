import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập tên danh mục.").max(255, "Tên danh mục không được vượt quá 255 ký tự."),
  slug: z.string().trim().max(255, "Slug không được vượt quá 255 ký tự.").nullable().optional(),
  description: z.string().trim().nullable().optional(),
  parent_id: z.number().int().positive().nullable().optional(),
  status: z.enum(["active", "inactive"]),
  sort_order: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.coerce.number().int("Thứ tự phải là số nguyên.").min(1, "Thứ tự phải lớn hơn hoặc bằng 1.").optional(),
  ),
});

export type CategoryFormInput = z.input<typeof categorySchema>;
export type CategoryFormValues = z.output<typeof categorySchema>;
