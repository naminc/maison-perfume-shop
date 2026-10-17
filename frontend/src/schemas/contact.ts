import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Vui lòng nhập họ tên (ít nhất 2 ký tự)").max(100, "Họ tên không được vượt quá 100 ký tự"),
  email: z.string().trim().email("Email không hợp lệ").max(255, "Email không được vượt quá 255 ký tự"),
  phone: z.string().trim().max(30, "Số điện thoại không được vượt quá 30 ký tự").optional().or(z.literal("")),
  subject: z.string().trim().max(255, "Tiêu đề không được vượt quá 255 ký tự").optional().or(z.literal("")),
  message: z.string().trim().min(10, "Nội dung tin nhắn phải có ít nhất 10 ký tự").max(2000, "Nội dung không được vượt quá 2000 ký tự"),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
