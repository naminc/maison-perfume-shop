import type { PublicSettings } from "@/types/setting";

export const DEFAULT_PUBLIC_SETTINGS: PublicSettings = {
  store_name: "Maison Perfume",
  domain: null,
  contact_email: "hello@maison.vn",
  phone: "0987 654 321",
  address: null,
  logo: null,
  icon: null,
  facebook_url: null,
  instagram_url: null,
  meta_title: "Maison Perfume | Nước hoa chính hãng",
  meta_description: "Nước hoa chính hãng, chọn lọc theo gu và phong cách sống.",
  maintenance: {
    enabled: false,
    message: "Website đang được bảo trì. Vui lòng quay lại sau.",
  },
};

export function resolvePublicSettings(settings?: Partial<PublicSettings> | null): PublicSettings {
  const resolved = {
    ...DEFAULT_PUBLIC_SETTINGS,
    ...Object.fromEntries(
      Object.entries(settings ?? {}).map(([key, value]) => [
        key,
        value === "" ? DEFAULT_PUBLIC_SETTINGS[key as keyof PublicSettings] : value,
      ]),
    ),
  };

  return {
    ...resolved,
    maintenance: {
      ...DEFAULT_PUBLIC_SETTINGS.maintenance,
      ...(settings?.maintenance ?? {}),
    },
  };
}

export function getBrandParts(storeName: string) {
  const [primary = "Maison", ...rest] = storeName.trim().split(/\s+/);

  return {
    primary,
    secondary: rest.join(" "),
  };
}

export function getPhoneHref(phone: string | null) {
  const digits = phone?.replace(/[^\d+]/g, "");

  return digits ? `tel:${digits}` : undefined;
}
