import {
  LayoutDashboard,
  Mail,
  Package,
  Settings,
  ShoppingCart,
  Tags,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: "Bảng điều khiển", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Danh mục", href: "/admin/categories", icon: Tags },
  { label: "Sản phẩm", href: "/admin/catalog", icon: Package },
  { label: "Đơn hàng", href: "/admin/orders", icon: ShoppingCart },
  { label: "Liên hệ", href: "/admin/contacts", icon: Mail },
  { label: "Cài đặt", href: "/admin/settings", icon: Settings },
];

export const ADMIN_BOTTOM_NAV_ITEMS = ADMIN_NAV_ITEMS.slice(0, 4);
