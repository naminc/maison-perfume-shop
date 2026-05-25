import { Link, useLocation } from "react-router-dom";
import { Package, Store } from "lucide-react";
import { ADMIN_NAV_ITEMS } from "@/constants/admin-navigation";
import { cn } from "@/lib/utils";

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const location = useLocation();

  const isActive = (href: string) =>
    location.pathname === href || location.pathname.startsWith(`${href}/`);

  return (
    <nav data-tour="sidebar" className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center gap-2 px-5">
        <Package className="h-5 w-5 text-sidebar-primary" />
        <span className="text-lg font-semibold tracking-tight text-sidebar-primary-foreground">Maison</span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2">
        <div className="space-y-1">
          {ADMIN_NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                isActive(item.href)
                  ? "bg-sidebar-accent font-medium text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10 p-3">
        <Link
          to="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
        >
          <Store className="h-4 w-4 shrink-0" />
          Quay lại cửa hàng
        </Link>
      </div>
    </nav>
  );
}
