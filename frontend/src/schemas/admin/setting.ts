import { z } from "zod";
import { isValidVietnamPhone } from "@/lib/phone";
import { optionalUrlSchema } from "@/schemas/shared";

export const adminSettingsSchema = z.object({
  store_name: z.string().trim().min(1, "Vui lòng nhập tên shop.").max(120, "Tên shop không được vượt quá 120 ký tự."),
  domain: optionalUrlSchema,
  contact_email: z.string().trim().min(1, "Vui lòng nhập email liên hệ.").email("Email liên hệ không hợp lệ.").max(255),
  phone: z
    .string()
    .trim()
    .max(20)
    .refine((value) => !value || isValidVietnamPhone(value), "Số điện thoại không hợp lệ."),
  address: z.string().trim().max(500, "Địa chỉ không được vượt quá 500 ký tự."),
  logo: optionalUrlSchema,
  icon: optionalUrlSchema,
  facebook_url: optionalUrlSchema,
  instagram_url: optionalUrlSchema,
  meta_title: z.string().trim().max(70, "Meta title không được vượt quá 70 ký tự."),
  meta_description: z.string().trim().max(160, "Meta description không được vượt quá 160 ký tự."),
  maintenance_enabled: z.string(),
  maintenance_message: z.string().trim().max(500, "Thông báo bảo trì không được vượt quá 500 ký tự."),
});

export type AdminSettingsFormValues = z.infer<typeof adminSettingsSchema>;
