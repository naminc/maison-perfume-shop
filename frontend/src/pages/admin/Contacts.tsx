import { Mail } from "lucide-react";
import { AdminModulePlaceholder } from "@/components/admin/shared/AdminModulePlaceholder";

export default function Contacts() {
  return (
    <AdminModulePlaceholder
      icon={Mail}
      title="Liên hệ"
      description="Quản lý yêu cầu liên hệ và phản hồi từ khách hàng."
    />
  );
}
