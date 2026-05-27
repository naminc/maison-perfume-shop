import { USER_STATUS_LABELS } from "@/constants/admin-users";
import { cn } from "@/lib/utils";
import type { AdminUserStatus } from "@/types/admin/user";

const STATUS_STYLE: Record<AdminUserStatus, { dotClass: string; textClass: string }> = {
  active: {
    dotClass: "bg-primary",
    textClass: "text-primary",
  },
  inactive: {
    dotClass: "bg-amber-500",
    textClass: "text-amber-700",
  },
  banned: {
    dotClass: "bg-destructive",
    textClass: "text-destructive",
  },
};

interface UserStatusBadgeProps {
  status: AdminUserStatus;
  className?: string;
}

export function UserStatusBadge({ status, className }: UserStatusBadgeProps) {
  const style = STATUS_STYLE[status];

  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", className)}>
      <span className={cn("h-2 w-2 shrink-0 rounded-full", style.dotClass)} />
      <span className={style.textClass}>{USER_STATUS_LABELS[status]}</span>
    </span>
  );
}
