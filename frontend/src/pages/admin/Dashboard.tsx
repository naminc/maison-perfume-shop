import { LayoutDashboard } from "lucide-react";
import { AdminModulePlaceholder } from "@/components/admin/shared/AdminModulePlaceholder";

export default function Dashboard() {
  return (
    <AdminModulePlaceholder
      icon={LayoutDashboard}
      title="Bảng điều khiển"
      description="Tổng quan hoạt động bán hàng, đơn hàng và hiệu suất shop."
    />
  );
}
