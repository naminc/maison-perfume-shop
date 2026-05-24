import { useLayoutEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ButtonSpinner } from "@/components/shared/ButtonSpinner";
import { addressSchema, type AddressFormValues } from "@/schemas/address";
import { useCreateAddress, useUpdateAddress } from "@/hooks/useAddressQueries";
import { useProvinces, useWards } from "@/hooks/useGeoQueries";
import { applyApiErrors } from "@/lib/form-utils";
import type { ApiErrorResponse } from "@/types/auth";
import type { UserAddress } from "@/types/address";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: UserAddress | null;
}

const ADDRESS_TYPE_OPTIONS = [
  { value: "home", label: "Nhà riêng" },
  { value: "office", label: "Văn phòng" },
  { value: "other", label: "Khác" },
] as const;

const DEFAULTS: AddressFormValues = {
  receiver_name: "",
  receiver_phone: "",
  province_code: "",
  province_name: "",
  ward_code: "",
  ward_name: "",
  specific_address: "",
  address_type: "home",
  is_default: false,
};

export function AddressFormModal({ open, onOpenChange, editing }: Props) {
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const isPending = createAddress.isPending || updateAddress.isPending;

  const {
    register, handleSubmit, reset, setError, control, watch, setValue,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: DEFAULTS,
  });

  const selectedProvinceCode = watch("province_code");
  const provincesQuery = useProvinces();
  const wardsQuery = useWards(open ? selectedProvinceCode : "");
  const provinces = provincesQuery.data ?? [];
  const wards = wardsQuery.data ?? [];
  const isProvincesLoading = provincesQuery.isFetching && provinces.length === 0;
  const isWardsLoading = wardsQuery.isFetching && wards.length === 0;

  useLayoutEffect(() => {
    if (open) {
      reset(editing ? {
        receiver_name: editing.receiver_name,
        receiver_phone: editing.receiver_phone,
        province_code: editing.province_code,
        province_name: editing.province_name,
        ward_code: editing.ward_code,
        ward_name: editing.ward_name,
        specific_address: editing.specific_address,
        address_type: editing.address_type ?? "home",
        is_default: editing.is_default,
      } : DEFAULTS);
    }
  }, [open, editing, reset]);

  const handleProvinceChange = (code: string) => {
    const province = provinces.find((p) => p.code === code);
    setValue("province_code", code);
    setValue("province_name", province?.full_name ?? "");
    setValue("ward_code", "");
    setValue("ward_name", "");
  };

  const handleWardChange = (code: string) => {
    const ward = wards.find((w) => w.code === code);
    setValue("ward_code", code);
    setValue("ward_name", ward?.full_name ?? "");
  };

  const onSubmit = (data: AddressFormValues) => {
    const onError = (error: Error) => {
      const err = error as AxiosError<ApiErrorResponse<AddressFormValues>>;
      if (applyApiErrors(err.response?.data?.errors, setError)) return;
      toast.error(err.response?.data?.message ?? "Thao tác thất bại.");
    };

    const onSuccess = () => {
      toast.success(editing ? "Cập nhật địa chỉ thành công." : "Thêm địa chỉ thành công.");
      onOpenChange(false);
    };

    if (editing) {
      updateAddress.mutate({ id: editing.id, payload: data }, { onSuccess, onError });
    } else {
      createAddress.mutate(data, { onSuccess, onError });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-address-modal
        overlayClassName="![animation:none]"
        className="max-w-2xl max-h-[90dvh] overflow-y-auto sm:max-h-[85dvh] inset-x-0 bottom-0 top-auto translate-x-0 translate-y-0 sm:inset-auto sm:left-[50%] sm:top-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 ![animation:none]"
      >
        <DialogHeader>
          <DialogTitle className="text-lg">{editing ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}</DialogTitle>
          <DialogDescription>
            {editing ? "Cập nhật thông tin địa chỉ giao hàng." : "Nhập thông tin địa chỉ giao hàng mới."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-1">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Tên người nhận" error={errors.receiver_name?.message} required>
              <Input {...register("receiver_name")} placeholder="Nguyễn Văn A" className="h-11 rounded-lg border-input bg-stone-50" />
            </FormField>
            <FormField label="Số điện thoại" error={errors.receiver_phone?.message} required>
              <Input {...register("receiver_phone")} placeholder="0987 654 321" className="h-11 rounded-lg border-input bg-stone-50" />
            </FormField>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Tỉnh/Thành phố" error={errors.province_code?.message} required>
              <Controller
                name="province_code"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={handleProvinceChange}
                    disabled={isProvincesLoading}
                  >
                    <SelectTrigger className="h-11 rounded-lg border-input bg-stone-50">
                      <SelectValue placeholder={isProvincesLoading ? "Đang tải Tỉnh/TP..." : "Chọn Tỉnh/Thành phố"} />
                    </SelectTrigger>
                    <SelectContent className="max-h-52 sm:max-h-60 ![animation:none]" position="popper" sideOffset={4}>
                      {isProvincesLoading && (
                        <SelectItem value="__loading_provinces" disabled>Đang tải Tỉnh/TP...</SelectItem>
                      )}
                      {provincesQuery.isError && (
                        <SelectItem value="__province_error" disabled>Không thể tải Tỉnh/TP</SelectItem>
                      )}
                      {provinces.map((p) => (
                        <SelectItem key={p.code} value={p.code}>{p.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <FormField label="Phường/Xã" error={errors.ward_code?.message} required>
              <Controller
                name="ward_code"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={handleWardChange}
                    disabled={!selectedProvinceCode || isWardsLoading}
                  >
                    <SelectTrigger className="h-11 rounded-lg border-input bg-stone-50">
                      <SelectValue
                        placeholder={
                          !selectedProvinceCode
                            ? "Chọn Tỉnh/TP trước"
                            : isWardsLoading
                              ? "Đang tải Phường/Xã..."
                              : "Chọn Phường/Xã"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="max-h-52 sm:max-h-60 ![animation:none]" position="popper" sideOffset={4}>
                      {isWardsLoading && (
                        <SelectItem value="__loading_wards" disabled>Đang tải Phường/Xã...</SelectItem>
                      )}
                      {wardsQuery.isError && (
                        <SelectItem value="__ward_error" disabled>Không thể tải Phường/Xã</SelectItem>
                      )}
                      {wards.map((w) => (
                        <SelectItem key={w.code} value={w.code}>{w.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
          </div>

          <FormField label="Địa chỉ cụ thể" error={errors.specific_address?.message} required>
            <Input {...register("specific_address")} placeholder="Số nhà, tên đường, khu phố..." className="h-11 rounded-lg border-input bg-stone-50" />
          </FormField>

          <FormField label="Loại địa chỉ" error={errors.address_type?.message}>
            <Controller
              name="address_type"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-3 gap-2">
                  {ADDRESS_TYPE_OPTIONS.map((option) => {
                    const selected = field.value === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => field.onChange(option.value)}
                        className={`h-10 rounded-lg border px-3 text-sm font-medium transition-colors ${
                          selected
                            ? "border-stone-900 bg-stone-900 text-white"
                            : "border-stone-300 bg-white text-stone-700 hover:border-stone-400"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              )}
            />
          </FormField>

          <div className="flex items-center gap-2">
            <Controller
              name="is_default"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="is_default"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="is_default" className="text-sm cursor-pointer">Đặt làm địa chỉ mặc định</Label>
          </div>

          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:gap-2 pt-2">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto bg-stone-900 text-white hover:bg-stone-800 flex items-center justify-center gap-2 h-11"
            >
              {isPending ? <><ButtonSpinner /> Đang lưu...</> : editing ? "Cập nhật" : "Thêm"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending} className="w-full sm:w-auto h-11">
              Huỷ
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FormField({ label, error, required, children }: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="mb-1.5 block text-sm font-medium text-stone-700">
        {label}{required && <span className="text-red-500"> *</span>}
      </Label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
