export type AddressType = 'home' | 'office' | 'other';

export interface UserAddress {
  id: number;
  user_id: number;
  receiver_name: string;
  receiver_phone: string;
  province_code: string;
  province_name: string;
  ward_code: string;
  ward_name: string;
  specific_address: string;
  address_type: AddressType;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface AddressPayload {
  receiver_name: string;
  receiver_phone: string;
  province_code: string;
  province_name: string;
  ward_code: string;
  ward_name: string;
  specific_address: string;
  address_type?: AddressType;
  is_default?: boolean;
}

export interface VnProvince {
  code: string;
  name: string;
  full_name: string;
  slug: string;
  type: 'province' | 'city';
  is_central: boolean;
}

export interface VnWard {
  code: string;
  name: string;
  full_name: string;
  slug: string;
  type: 'ward' | 'commune';
  province_code: string;
}
