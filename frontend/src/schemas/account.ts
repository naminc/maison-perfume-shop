import { z } from 'zod';

export const updateProfileSchema = z.object({
  full_name: z.string().trim().min(2, 'Tên quá ngắn').max(100),
  email:     z.string().trim().email('Email không hợp lệ').max(255),
  phone:     z.string().trim().max(15).optional().nullable(),
});

export const changePasswordSchema = z
  .object({
    current_password:          z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
    new_password:              z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự').max(100),
    new_password_confirmation: z.string(),
  })
  .refine((d) => d.new_password === d.new_password_confirmation, {
    message: 'Xác nhận mật khẩu mới không khớp',
    path: ['new_password_confirmation'],
  });

export type UpdateProfileFormValues  = z.infer<typeof updateProfileSchema>;
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
