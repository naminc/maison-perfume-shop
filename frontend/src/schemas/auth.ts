import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Email không hợp lệ").max(255),
  password: z.string().min(6, "Tối thiểu 6 ký tự").max(100),
});

export const registerSchema = z
  .object({
    full_name: z.string().trim().min(2, "Tên quá ngắn").max(100),
    email: z.string().trim().email("Email không hợp lệ").max(255),
    password: z.string().min(6, "Tối thiểu 6 ký tự").max(100),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Mật khẩu không khớp",
    path: ["password_confirmation"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Email không hợp lệ").max(255),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Liên kết đặt lại mật khẩu không hợp lệ"),
    email: z.string().trim().email("Email không hợp lệ").max(255),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự").max(100),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Xác nhận mật khẩu không khớp",
    path: ["password_confirmation"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
