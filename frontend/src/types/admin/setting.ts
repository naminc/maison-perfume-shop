export type AdminSettingGroup = "general" | "social" | "seo" | "system";

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
  | "meta_description"
  | "maintenance_enabled"
  | "maintenance_message";

export type AdminSettings = Record<AdminSettingKey, string | null>;

export type AdminSettingsGrouped = Partial<
  Record<AdminSettingGroup, Partial<AdminSettings>>
>;

export type UpdateAdminSettingsPayload = AdminSettings;
