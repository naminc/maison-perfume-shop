import { ShieldCheck, UserRound } from "lucide-react";
import { USER_ROLE_LABELS } from "@/constants/admin-users";
import { cn } from "@/lib/utils";
import type { AdminUserRole } from "@/types/admin/user";

const ROLE_STYLE: Record<AdminUserRole, string> = {
  admin: "bg-primary/10 text-primary",
  user: "bg-muted text-muted-foreground",
};

interface UserRoleBadgeProps {
  role: AdminUserRole;
  className?: string;
}

export function UserRoleBadge({ role, className }: UserRoleBadgeProps) {
  const Icon = role === "admin" ? ShieldCheck : UserRound;

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium", ROLE_STYLE[role], className)}>
      <Icon className="h-3.5 w-3.5" />
      {USER_ROLE_LABELS[role]}
    </span>
  );
}
