import { z } from 'zod';

export const addressSchema = z.object({
  receiver_name:    z.string().min(1, 'Vui lòng nhập tên người nhận.'),
  receiver_phone:   z.string().min(1, 'Vui lòng nhập số điện thoại.'),
  province_code:    z.string().min(1, 'Vui lòng chọn Tỉnh/Thành phố.'),
  province_name:    z.string().min(1),
  ward_code:        z.string().min(1, 'Vui lòng chọn Phường/Xã.'),
  ward_name:        z.string().min(1),
  specific_address: z.string().min(1, 'Vui lòng nhập địa chỉ cụ thể.'),
  address_type:     z.enum(['home', 'office', 'other']).default('home'),
  is_default:       z.boolean().optional(),
});

export type AddressFormValues = z.input<typeof addressSchema>;
