import {
  BadgeCheck,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Package,
  Settings,
  ShoppingCart,
  Tags,
  Users,
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
  { label: "Thương hiệu", href: "/admin/brands", icon: BadgeCheck },
  { label: "Sản phẩm", href: "/admin/products", icon: Package },
  { label: "Đánh giá", href: "/admin/product-reviews", icon: MessageSquare },
  { label: "Đơn hàng", href: "/admin/orders", icon: ShoppingCart },
  { label: "Liên hệ", href: "/admin/contacts", icon: Mail },
  { label: "Người dùng", href: "/admin/users", icon: Users },
  { label: "Cài đặt", href: "/admin/settings", icon: Settings },
];

export const ADMIN_BOTTOM_NAV_ITEMS = ADMIN_NAV_ITEMS.slice(0, 4);
