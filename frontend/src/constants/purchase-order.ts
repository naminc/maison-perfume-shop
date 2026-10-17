import type { PurchaseOrderStatus } from "@/types/purchase-order";

export const PURCHASE_ORDER_STATUS_LABELS: Record<PurchaseOrderStatus, string> = {
  draft: "Nháp", ordered: "Đã đặt hàng", received: "Đã nhận hàng", cancelled: "Đã huỷ",
};
export const PURCHASE_ORDER_STATUS_OPTIONS = Object.entries(PURCHASE_ORDER_STATUS_LABELS).map(([value, label]) => ({ value: value as PurchaseOrderStatus, label }));
export const PURCHASE_ORDER_PAGE_SIZE = 10;
