export type AdminSettingGroup = "general" | "social" | "seo";

export type AdminSettingKey =
  | "store_name"
  | "domain"
  | "contact_email"
  | "phone"
  | "address"
  | "logo"
  | "icon"
  | "facebook_url"
  | "instagram_url"
  | "meta_title"
  | "meta_description";

export type AdminSettings = Record<AdminSettingKey, string | null>;

export type AdminSettingsGrouped = Partial<
  Record<AdminSettingGroup, Partial<AdminSettings>>
>;

export type UpdateAdminSettingsPayload = AdminSettings;
