import type { AdminSettingKey } from "@/types/admin/setting";

export const ADMIN_SETTINGS_DEFAULTS = {
  store_name: "",
  domain: "",
  contact_email: "",
  phone: "",
  address: "",
  logo: "",
  icon: "",
  facebook_url: "",
  instagram_url: "",
  meta_title: "",
  meta_description: "",
  maintenance_enabled: "0",
  maintenance_message: "",
} as const satisfies Record<AdminSettingKey, string>;

export const ADMIN_SETTINGS_TABS = [
  {
    value: "general",
    label: "Chung",
    fields: ["store_name", "domain", "contact_email", "phone", "address", "logo", "icon"],
  },
  {
    value: "social",
    label: "Mạng xã hội",
    fields: ["facebook_url", "instagram_url"],
  },
  {
    value: "seo",
    label: "SEO",
    fields: ["meta_title", "meta_description"],
  },
  {
    value: "system",
    label: "Hệ thống",
    fields: ["maintenance_enabled", "maintenance_message"],
  },
] as const;

export const ADMIN_SETTING_FIELDS = {
  store_name: {
    label: "Tên shop",
    placeholder: "Maison Perfume",
  },
  domain: {
    label: "Tên miền",
    placeholder: "https://maison.vn",
    type: "url",
  },
  contact_email: {
    label: "Email liên hệ",
    placeholder: "hello@maison.vn",
    type: "email",
  },
  phone: {
    label: "Số điện thoại",
    placeholder: "0987 654 321",
    type: "tel",
  },
  address: {
    label: "Địa chỉ",
    placeholder: "Nhập địa chỉ cửa hàng",
    multiline: true,
  },
  logo: {
    label: "Logo",
    placeholder: "https://maison.vn/logo.png",
    type: "url",
  },
  icon: {
    label: "Icon",
    placeholder: "https://maison.vn/favicon.ico",
    type: "url",
  },
  facebook_url: {
    label: "Facebook",
    placeholder: "https://facebook.com/maison",
    type: "url",
  },
  instagram_url: {
    label: "Instagram",
    placeholder: "https://instagram.com/maison",
    type: "url",
  },
  meta_title: {
    label: "Meta Title",
    placeholder: "Maison Perfume | Nước hoa chính hãng",
  },
  meta_description: {
    label: "Meta Description",
    placeholder: "Mô tả ngắn cho công cụ tìm kiếm",
    multiline: true,
  },
  maintenance_enabled: {
    label: "Bật chế độ bảo trì",
    placeholder: "",
    type: "switch",
  },
  maintenance_message: {
    label: "Thông báo bảo trì",
    placeholder: "Website đang được bảo trì. Vui lòng quay lại sau.",
    multiline: true,
  },
} as const satisfies Record<
  AdminSettingKey,
  {
    label: string;
    placeholder: string;
    type?: "email" | "tel" | "url" | "switch";
    multiline?: boolean;
  }
>;
