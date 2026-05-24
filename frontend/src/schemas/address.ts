import { z } from 'zod';

const normalizePhone = (value: string) => value.replace(/[\s.-]+/g, '');
const phonePattern = /^(0\d{9,10}|\+84\d{9,10})$/;

export const addressSchema = z.object({
  receiver_name:    z.string().min(1, 'Vui lòng nhập tên người nhận.'),
  receiver_phone:   z.string()
    .trim()
    .min(1, 'Vui lòng nhập số điện thoại.')
    .refine((value) => phonePattern.test(normalizePhone(value)), 'Số điện thoại không hợp lệ.'),
  province_code:    z.string().min(1, 'Vui lòng chọn Tỉnh/Thành phố.'),
  province_name:    z.string().min(1),
  ward_code:        z.string().min(1, 'Vui lòng chọn Phường/Xã.'),
  ward_name:        z.string().min(1),
  specific_address: z.string().min(1, 'Vui lòng nhập địa chỉ cụ thể.'),
  address_type:     z.enum(['home', 'office', 'other']).default('home'),
  is_default:       z.boolean().optional(),
});

export type AddressFormValues = z.input<typeof addressSchema>;
