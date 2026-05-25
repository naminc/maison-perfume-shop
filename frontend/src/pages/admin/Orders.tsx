import { ShoppingCart } from "lucide-react";
import { AdminModulePlaceholder } from "@/components/admin/shared/AdminModulePlaceholder";

export default function Orders() {
  return (
    <AdminModulePlaceholder
      icon={ShoppingCart}
      title="Đơn hàng"
      description="Theo dõi và xử lý đơn hàng của khách."
    />
  );
}
