import type { StockMovementType } from "@/types/inventory";

export const LOW_STOCK_THRESHOLD = 5;
export const INVENTORY_PAGE_SIZE = 15;

export const STOCK_MOVEMENT_LABELS: Record<StockMovementType, string> = {
  import: "Nhập kho",
  export: "Xuất kho",
  adjustment: "Điều chỉnh",
  order: "Đơn hàng",
  order_cancelled: "Hoàn đơn huỷ",
};

export const STOCK_MOVEMENT_OPTIONS = Object.entries(STOCK_MOVEMENT_LABELS).map(([value, label]) => ({
  value: value as StockMovementType,
  label,
}));
