import { CATEGORY_STATUS_LABELS } from "@/constants/category";
import { cn } from "@/lib/utils";
import type { CategoryStatus } from "@/types/category";

const STATUS_STYLE: Record<CategoryStatus, { dotClass: string; textClass: string }> = {
  active: {
    dotClass: "bg-primary",
    textClass: "text-primary",
  },
  inactive: {
    dotClass: "bg-destructive",
    textClass: "text-destructive",
  },
};

interface CategoryStatusBadgeProps {
  status: CategoryStatus;
  className?: string;
}

export function CategoryStatusBadge({ status, className }: CategoryStatusBadgeProps) {
  const style = STATUS_STYLE[status];

  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", className)}>
      <span className={cn("h-2 w-2 shrink-0 rounded-full", style.dotClass)} />
      <span className={style.textClass}>{CATEGORY_STATUS_LABELS[status]}</span>
    </span>
  );
}
