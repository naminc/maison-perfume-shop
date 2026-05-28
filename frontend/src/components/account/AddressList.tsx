import { Pencil, Trash2, MapPin, Star } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ButtonSpinner } from "@/components/shared/ButtonSpinner";
import { useDeleteAddress, useSetDefaultAddress } from "@/hooks/useAddressQueries";
import { ADDRESS_PAGE_SIZE, ADDRESS_TYPE_LABELS } from "@/constants/address";
import { formatVietnamPhone } from "@/lib/phone";
import type { UserAddress } from "@/types/address";

interface Props {
  addresses: UserAddress[] | undefined;
  isLoading: boolean;
  onEdit: (address: UserAddress) => void;
}

const formatAddressArea = (address: UserAddress) => {
  const wardName = address.ward_name.trim();
  const provinceName = address.province_name.trim();

  if (!wardName) return provinceName;
  if (!provinceName || wardName.endsWith(provinceName)) return wardName;

  return `${wardName}, ${provinceName}`;
};

export function AddressList({ addresses, isLoading, onEdit }: Props) {
  const [page, setPage] = useState(1);
  const deleteAddress = useDeleteAddress();
  const setDefault = useSetDefaultAddress();
  const addressItems = addresses ?? [];
  const totalPages = Math.ceil(addressItems.length / ADDRESS_PAGE_SIZE);
  const currentPage = totalPages > 0 ? Math.min(page, totalPages) : 1;
  const startIndex = (currentPage - 1) * ADDRESS_PAGE_SIZE;
  const endIndex = startIndex + ADDRESS_PAGE_SIZE;
  const visibleAddresses = addressItems.slice(startIndex, endIndex);

  const handleDelete = (address: UserAddress) => {
    if (!confirm(`Xoá địa chỉ của "${address.receiver_name}"?`)) return;
    deleteAddress.mutate(address.id, {
      onSuccess: () => toast.success("Đã xoá địa chỉ."),
      onError: () => toast.error("Không thể xoá địa chỉ."),
    });
  };

  const handleSetDefault = (id: number) => {
    setDefault.mutate(id, {
      onSuccess: () => toast.success("Đã đặt làm địa chỉ mặc định."),
      onError: () => toast.error("Thao tác thất bại."),
    });
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-stone-200 bg-white p-5">
            <div className="mb-3 flex items-center gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-5 w-36" />
            <Skeleton className="mt-1.5 h-4 w-28" />
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-1 h-4 w-48" />
          </div>
        ))}
      </div>
    );
  }

  if (!addresses || addresses.length === 0) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white py-16 text-center">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-stone-100">
          <MapPin className="h-7 w-7 text-stone-400" />
        </div>
        <h2 className="text-lg font-medium">Chưa có địa chỉ nào</h2>
        <p className="mt-1 text-sm text-stone-500">Thêm địa chỉ để thanh toán nhanh hơn.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {visibleAddresses.map((a) => (
        <article
          key={a.id}
          className={`relative rounded-xl border bg-white p-5 transition-colors ${
            a.is_default ? "border-stone-900" : "border-stone-200"
          }`}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700">
                {ADDRESS_TYPE_LABELS[a.address_type]}
              </span>
              {a.is_default && (
                <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                  <Star className="h-3 w-3 fill-current" /> Mặc định
                </span>
              )}
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => onEdit(a)}
                className="grid h-8 w-8 place-items-center rounded-full text-stone-500 hover:bg-stone-100"
                aria-label="Sửa"
              >
                <Pencil className="h-4 w-4" />
              </button>
              {!a.is_default && (
                <button
                  onClick={() => handleDelete(a)}
                  disabled={deleteAddress.isPending}
                  className="grid h-8 w-8 place-items-center rounded-full text-stone-500 hover:bg-stone-100 hover:text-red-600 disabled:opacity-50"
                  aria-label="Xoá"
                >
                  {deleteAddress.isPending && deleteAddress.variables === a.id
                    ? <ButtonSpinner />
                    : <Trash2 className="h-4 w-4" />}
                </button>
              )}
            </div>
          </div>

          <p className="font-semibold">{a.receiver_name}</p>
          <p className="text-sm text-stone-500">{formatVietnamPhone(a.receiver_phone)}</p>
          <p className="mt-2 text-sm text-stone-700">{a.specific_address}</p>
          <p className="text-sm text-stone-500">{formatAddressArea(a)}</p>

          {!a.is_default && (
            <button
              onClick={() => handleSetDefault(a.id)}
              disabled={setDefault.isPending}
              className="mt-4 text-xs font-medium text-amber-700 hover:underline disabled:opacity-50"
            >
              {setDefault.isPending && setDefault.variables === a.id
                ? "Đang xử lý..."
                : "Đặt làm địa chỉ mặc định"}
            </button>
          )}
        </article>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col gap-3 border-t border-stone-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-stone-500">
            Hiển thị {startIndex + 1}-{Math.min(endIndex, addressItems.length)} trong {addressItems.length} địa chỉ
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 transition-colors hover:border-stone-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-stone-300"
            >
              Trước
            </button>
            <span className="min-w-20 text-center text-sm text-stone-500">
              Trang {currentPage}/{totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 transition-colors hover:border-stone-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-stone-300"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
