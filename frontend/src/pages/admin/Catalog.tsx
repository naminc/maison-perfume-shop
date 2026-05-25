import { Package } from "lucide-react";
import { AdminModulePlaceholder } from "@/components/admin/shared/AdminModulePlaceholder";

export default function Catalog() {
  return (
    <AdminModulePlaceholder
      icon={Package}
      title="Sản phẩm"
      description="Quản lý danh sách sản phẩm, tồn kho và thông tin nước hoa."
    />
  );
}
