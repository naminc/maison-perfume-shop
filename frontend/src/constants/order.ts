import type {
  OrderStatus,
  OrderStatusFilter,
  PaymentMethod,
  PaymentMethodFilter,
  PaymentStatus,
  PaymentStatusFilter,
} from "@/types/order";

export const ORDER_PAGE_SIZE = 10;
export const ACCOUNT_ORDER_PAGE_SIZE = 5;

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Chờ xử lý",
  confirmed: "Đã xác nhận",
  processing: "Đang chuẩn bị",
  shipping: "Đang giao",
  completed: "Hoàn thành",
  cancelled: "Đã huỷ",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cod: "COD",
  bank: "Chuyển khoản",
  card: "Thẻ",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: "Chưa thanh toán",
  paid: "Đã thanh toán",
  failed: "Thất bại",
  refunded: "Đã hoàn tiền",
};

export const ORDER_STATUS_OPTIONS: Array<{ value: OrderStatus; label: string }> = [
  { value: "pending", label: ORDER_STATUS_LABELS.pending },
  { value: "confirmed", label: ORDER_STATUS_LABELS.confirmed },
  { value: "processing", label: ORDER_STATUS_LABELS.processing },
  { value: "shipping", label: ORDER_STATUS_LABELS.shipping },
  { value: "completed", label: ORDER_STATUS_LABELS.completed },
  { value: "cancelled", label: ORDER_STATUS_LABELS.cancelled },
];

export const ORDER_STATUS_FILTER_OPTIONS: Array<{ value: OrderStatusFilter; label: string }> = [
  { value: "all", label: "Tất cả trạng thái" },
  ...ORDER_STATUS_OPTIONS,
];

export const PAYMENT_METHOD_FILTER_OPTIONS: Array<{ value: PaymentMethodFilter; label: string }> = [
  { value: "all", label: "Tất cả thanh toán" },
  { value: "cod", label: PAYMENT_METHOD_LABELS.cod },
  { value: "bank", label: PAYMENT_METHOD_LABELS.bank },
  { value: "card", label: PAYMENT_METHOD_LABELS.card },
];

export const PAYMENT_STATUS_FILTER_OPTIONS: Array<{ value: PaymentStatusFilter; label: string }> = [
  { value: "all", label: "Tất cả thanh toán" },
  { value: "unpaid", label: PAYMENT_STATUS_LABELS.unpaid },
  { value: "paid", label: PAYMENT_STATUS_LABELS.paid },
  { value: "failed", label: PAYMENT_STATUS_LABELS.failed },
  { value: "refunded", label: PAYMENT_STATUS_LABELS.refunded },
];

export const ORDER_STATUS_BADGE_CLASS: Record<OrderStatus, string> = {
  pending: "bg-stone-100 text-stone-700",
  confirmed: "bg-sky-50 text-sky-700",
  processing: "bg-amber-50 text-amber-700",
  shipping: "bg-blue-50 text-blue-700",
  completed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-700",
};

export const PAYMENT_STATUS_BADGE_CLASS: Record<PaymentStatus, string> = {
  unpaid: "bg-stone-100 text-stone-700",
  paid: "bg-emerald-50 text-emerald-700",
  failed: "bg-red-50 text-red-700",
  refunded: "bg-violet-50 text-violet-700",
};

export const ORDER_NEXT_STATUS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipping"],
  shipping: ["completed"],
  completed: [],
  cancelled: [],
};
