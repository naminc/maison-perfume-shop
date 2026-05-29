import { PRODUCT_STATUS_LABELS } from "@/constants/product";
import { cn } from "@/lib/utils";
import type { ProductStatus } from "@/types/product";

const STATUS_STYLE: Record<ProductStatus, { dotClass: string; textClass: string }> = {
  active: {
    dotClass: "bg-primary",
    textClass: "text-primary",
  },
  inactive: {
    dotClass: "bg-destructive",
    textClass: "text-destructive",
  },
};

interface ProductStatusBadgeProps {
  status: ProductStatus;
  className?: string;
}

export function ProductStatusBadge({ status, className }: ProductStatusBadgeProps) {
  const style = STATUS_STYLE[status];

  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", className)}>
      <span className={cn("h-2 w-2 shrink-0 rounded-full", style.dotClass)} />
      <span className={style.textClass}>{PRODUCT_STATUS_LABELS[status]}</span>
    </span>
  );
}
