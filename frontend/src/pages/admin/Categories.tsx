import { Tags } from "lucide-react";
import { AdminModulePlaceholder } from "@/components/admin/shared/AdminModulePlaceholder";

export default function Categories() {
  return (
    <AdminModulePlaceholder
      icon={Tags}
      title="Danh mục"
      description="Quản lý danh mục sản phẩm nước hoa."
    />
  );
}
