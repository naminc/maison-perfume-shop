import { z } from "zod";
import { optionalUrlSchema } from "@/schemas/shared";

export const brandSchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập tên thương hiệu.").max(255, "Tên thương hiệu không được vượt quá 255 ký tự."),
  slug: z.string().trim().max(255, "Slug không được vượt quá 255 ký tự.").nullable().optional(),
  description: z.string().trim().nullable().optional(),
  logo: optionalUrlSchema.nullable().optional(),
  website: optionalUrlSchema.nullable().optional(),
  status: z.enum(["active", "inactive"]),
  sort_order: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.coerce.number().int("Thứ tự phải là số nguyên.").min(1, "Thứ tự phải lớn hơn hoặc bằng 1.").optional(),
  ),
});

export type BrandFormInput = z.input<typeof brandSchema>;
export type BrandFormValues = z.output<typeof brandSchema>;
