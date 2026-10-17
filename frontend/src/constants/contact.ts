import type { ContactStatus, ContactStatusFilter } from "@/types/contact";

export const CONTACT_PAGE_SIZE = 10;

export const CONTACT_STATUS_LABELS: Record<ContactStatus, string> = {
  pending: "Chờ xử lý",
  replied: "Đã phản hồi",
  closed: "Đã đóng",
};

export const CONTACT_STATUS_BADGE_CLASS: Record<ContactStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  replied: "bg-emerald-50 text-emerald-700",
  closed: "bg-stone-100 text-stone-700",
};

export const CONTACT_STATUS_OPTIONS: Array<{ value: ContactStatus; label: string }> = [
  { value: "pending", label: CONTACT_STATUS_LABELS.pending },
  { value: "replied", label: CONTACT_STATUS_LABELS.replied },
  { value: "closed", label: CONTACT_STATUS_LABELS.closed },
];

export const CONTACT_STATUS_FILTER_OPTIONS: Array<{ value: ContactStatusFilter; label: string }> = [
  { value: "all", label: "Tất cả trạng thái" },
  ...CONTACT_STATUS_OPTIONS,
];
