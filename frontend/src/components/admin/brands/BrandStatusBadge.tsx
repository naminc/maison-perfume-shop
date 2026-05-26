import { BRAND_STATUS_LABELS } from "@/constants/brand";
import { cn } from "@/lib/utils";
import type { BrandStatus } from "@/types/brand";

const STATUS_STYLE: Record<BrandStatus, { dotClass: string; textClass: string }> = {
  active: {
    dotClass: "bg-primary",
    textClass: "text-primary",
  },
  inactive: {
    dotClass: "bg-destructive",
    textClass: "text-destructive",
  },
};

interface BrandStatusBadgeProps {
  status: BrandStatus;
  className?: string;
}

export function BrandStatusBadge({ status, className }: BrandStatusBadgeProps) {
  const style = STATUS_STYLE[status];

  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", className)}>
      <span className={cn("h-2 w-2 shrink-0 rounded-full", style.dotClass)} />
      <span className={style.textClass}>{BRAND_STATUS_LABELS[status]}</span>
    </span>
  );
}
