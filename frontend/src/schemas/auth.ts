import { z } from 'zod';

export const loginSchema = z.object({
  email:    z.string().trim().email('Email không hợp lệ').max(255),
  password: z.string().min(6, 'Tối thiểu 6 ký tự').max(100),
});

export const registerSchema = z.object({
  full_name:             z.string().trim().min(2, 'Tên quá ngắn').max(100),
  email:                 z.string().trim().email('Email không hợp lệ').max(255),
  password:              z.string().min(6, 'Tối thiểu 6 ký tự').max(100),
  password_confirmation: z.string(),
}).refine((d) => d.password === d.password_confirmation, {
  message: 'Mật khẩu không khớp',
  path: ['password_confirmation'],
});

export const updateProfileSchema = z.object({
  full_name: z.string().trim().min(2, 'Tên quá ngắn').max(100),
  email:     z.string().trim().email('Email không hợp lệ').max(255),
  phone:     z.string().trim().max(15).optional().nullable(),
});

export type LoginFormValues          = z.infer<typeof loginSchema>;
export type RegisterFormValues       = z.infer<typeof registerSchema>;
export type UpdateProfileFormValues  = z.infer<typeof updateProfileSchema>;
