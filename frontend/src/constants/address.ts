import type { AddressType } from "@/types/address";

export const ADDRESS_TYPE_LABELS = {
  home: "Nhà riêng",
  office: "Văn phòng",
  other: "Khác",
} as const satisfies Record<AddressType, string>;

export const ADDRESS_TYPE_OPTIONS = [
  { value: "home", label: ADDRESS_TYPE_LABELS.home },
  { value: "office", label: ADDRESS_TYPE_LABELS.office },
  { value: "other", label: ADDRESS_TYPE_LABELS.other },
] as const satisfies readonly { value: AddressType; label: string }[];

export const ADDRESS_PAGE_SIZE = 4;
