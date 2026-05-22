import {
  Plus,
  ArrowRightLeft,
  ShoppingCart,
  ClipboardList,
  Truck,
  FileDown,
} from "lucide-react";
import type { usePermissions } from "@/hooks/usePermissions";

type Nav = (path: string) => void;

export interface ActionDef {
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: (navigate: Nav) => void;
  permission?: Parameters<ReturnType<typeof usePermissions>["can"]>[0];
}

export const ACTIONS: ActionDef[] = [
  {
    label: "New Item",
    icon: <Plus className="h-4 w-4" />,
    shortcut: "N I",
    action: (nav) => nav("/admin/catalog"),
    permission: "create_item",
  },
  {
    label: "New Movement",
    icon: <ArrowRightLeft className="h-4 w-4" />,
    shortcut: "N M",
    action: (nav) => nav("/admin/movements"),
    permission: "log_movement",
  },
  {
    label: "New Purchase Order",
    icon: <ShoppingCart className="h-4 w-4" />,
    shortcut: "N P",
    action: (nav) => nav("/admin/purchase-orders"),
    permission: "create_po",
  },
  {
    label: "New Request",
    icon: <ClipboardList className="h-4 w-4" />,
    action: (nav) => nav("/admin/requests"),
    permission: "create_request",
  },
  {
    label: "New Supplier",
    icon: <Truck className="h-4 w-4" />,
    action: (nav) => nav("/admin/suppliers"),
    permission: "manage_suppliers",
  },
  {
    label: "Export Items CSV",
    icon: <FileDown className="h-4 w-4" />,
    action: (nav) => nav("/admin/catalog"),
    permission: "export_data",
  },
];
