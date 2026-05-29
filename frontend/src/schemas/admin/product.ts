import { z } from "zod";
import { optionalUrlSchema } from "@/schemas/shared";

const optionalString = z.string().trim().nullable().optional();

const optionalInteger = (message: string) =>
  z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.coerce.number().int(message).min(1, message).optional(),
  );

const optionalMoney = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? undefined : value),
  z.coerce.number().min(0, "Giá khuyến mãi phải lớn hơn hoặc bằng 0.").optional(),
);

export const productSchema = z
  .object({
    brand_id: optionalInteger("Vui lòng chọn thương hiệu hợp lệ.").nullable().optional(),
    category_id: optionalInteger("Vui lòng chọn danh mục hợp lệ.").nullable().optional(),
    name: z.string().trim().min(1, "Vui lòng nhập tên sản phẩm.").max(255, "Tên sản phẩm không được vượt quá 255 ký tự."),
    slug: z.string().trim().max(255, "Slug không được vượt quá 255 ký tự.").nullable().optional(),
    sku: z.string().trim().max(100, "SKU không được vượt quá 100 ký tự.").nullable().optional(),
    short_description: z.string().trim().max(500, "Mô tả ngắn không được vượt quá 500 ký tự.").nullable().optional(),
    description: optionalString,
    image: optionalUrlSchema.nullable().optional(),
    gender: z.enum(["male", "female", "unisex"]),
    concentration: z.string().trim().max(100, "Nồng độ không được vượt quá 100 ký tự.").nullable().optional(),
    volume_ml: optionalInteger("Dung tích phải là số nguyên lớn hơn hoặc bằng 1."),
    price: z.coerce.number().min(0, "Giá bán phải lớn hơn hoặc bằng 0."),
    sale_price: optionalMoney,
    stock: z.coerce.number().int("Tồn kho phải là số nguyên.").min(0, "Tồn kho phải lớn hơn hoặc bằng 0."),
    status: z.enum(["active", "inactive"]),
    is_featured: z.boolean().optional(),
    sort_order: optionalInteger("Thứ tự phải là số nguyên lớn hơn hoặc bằng 1."),
  })
  .refine((value) => value.sale_price === undefined || value.sale_price <= value.price, {
    message: "Giá khuyến mãi không được lớn hơn giá bán.",
    path: ["sale_price"],
  });

export type ProductFormInput = z.input<typeof productSchema>;
export type ProductFormValues = z.output<typeof productSchema>;
