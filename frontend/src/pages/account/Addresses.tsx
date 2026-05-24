import { useState } from "react";
import { Plus } from "lucide-react";
import AccountLayout from "@/layouts/AccountLayout";
import { Button } from "@/components/ui/button";
import { AddressList } from "@/components/account/AddressList";
import { AddressFormModal } from "@/components/account/AddressFormModal";
import { useAddresses } from "@/hooks/useAddressQueries";
import type { UserAddress } from "@/types/address";

export default function Addresses() {
  const { data: addresses, isLoading } = useAddresses();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UserAddress | null>(null);

  const openNew = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (address: UserAddress) => {
    setEditing(address);
    setModalOpen(true);
  };

  return (
    <AccountLayout title="Địa chỉ giao hàng" subtitle="Quản lý các địa chỉ nhận hàng của bạn.">
      <div className="flex justify-end">
        <Button
          onClick={openNew}
          className="h-11 rounded-lg bg-stone-900 px-5 text-white hover:bg-stone-800"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Thêm địa chỉ mới
        </Button>
      </div>

      <AddressList addresses={addresses} isLoading={isLoading} onEdit={openEdit} />

      <AddressFormModal open={modalOpen} onOpenChange={setModalOpen} editing={editing} />
    </AccountLayout>
  );
}
