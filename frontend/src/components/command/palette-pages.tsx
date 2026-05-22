import {
  LayoutDashboard,
  Package,
  ArrowRightLeft,
  Truck,
  ShoppingCart,
  ClipboardList,
  MapPin,
  Settings,
} from "lucide-react";

export interface PageDef {
  label: string;
  path: string;
  icon: React.ReactNode;
}

export const PAGES: PageDef[] = [
  { label: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Catalog", path: "/admin/catalog", icon: <Package className="h-4 w-4" /> },
  { label: "Movements", path: "/admin/movements", icon: <ArrowRightLeft className="h-4 w-4" /> },
  { label: "Suppliers", path: "/admin/suppliers", icon: <Truck className="h-4 w-4" /> },
  { label: "Purchase Orders", path: "/admin/purchase-orders", icon: <ShoppingCart className="h-4 w-4" /> },
  { label: "Requests", path: "/admin/requests", icon: <ClipboardList className="h-4 w-4" /> },
  { label: "Locations", path: "/admin/locations", icon: <MapPin className="h-4 w-4" /> },
  { label: "Settings", path: "/admin/settings", icon: <Settings className="h-4 w-4" /> },
];
