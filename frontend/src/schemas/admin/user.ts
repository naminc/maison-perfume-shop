import { z } from "zod";

export const adminUserSchema = z.object({
  full_name: z.string().trim().min(1, "Vui lòng nhập họ tên người dùng.").max(255, "Họ tên không được vượt quá 255 ký tự."),
  email: z.string().trim().min(1, "Vui lòng nhập email.").email("Email không hợp lệ.").max(255, "Email không được vượt quá 255 ký tự."),
  phone: z
    .string()
    .trim()
    .max(20, "Số điện thoại không được vượt quá 20 ký tự.")
    .regex(/^(0\d{9,10}|\+84\d{9,10})$/, "Số điện thoại không hợp lệ.")
    .or(z.literal(""))
    .nullable()
    .optional(),
  role: z.enum(["admin", "user"]),
  status: z.enum(["active", "inactive", "banned"]),
});

export type AdminUserFormInput = z.input<typeof adminUserSchema>;
export type AdminUserFormValues = z.output<typeof adminUserSchema>;
