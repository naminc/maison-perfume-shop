import { useEffect, type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Textarea } from "@/components/admin/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ButtonSpinner } from "@/components/shared/ButtonSpinner";
import { BRAND_STATUS_OPTIONS } from "@/constants/brand";
import { useCreateBrand, useUpdateBrand } from "@/hooks/useAdminBrands";
import { wasApiConnectionNotified } from "@/lib/api";
import { applyApiErrors } from "@/lib/form-utils";
import { cn } from "@/lib/utils";
import { brandSchema, type BrandFormInput, type BrandFormValues } from "@/schemas/admin/brand";
import type { ApiErrorResponse } from "@/types/auth";
import type { Brand, BrandPayload } from "@/types/brand";

interface BrandFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand?: Brand | null;
}

export function BrandFormSheet({
  open,
  onOpenChange,
  brand,
}: BrandFormSheetProps) {
  const createBrand = useCreateBrand();
  const updateBrand = useUpdateBrand();
  const isEditMode = Boolean(brand);
  const isSubmitting = createBrand.isPending || updateBrand.isPending;

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<BrandFormInput, unknown, BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: getDefaultValues(brand),
  });

  useEffect(() => {
    if (open) {
      reset(getDefaultValues(brand));
    }
  }, [brand, open, reset]);

  const onSubmit = (values: BrandFormValues) => {
    const payload = toPayload(values);

    const handlers = {
      onSuccess: () => {
        toast.success(isEditMode ? "Đã cập nhật thương hiệu." : "Đã thêm thương hiệu.");
        onOpenChange(false);
      },
      onError: (error: unknown) => {
        if (wasApiConnectionNotified(error)) return;
        const err = error as AxiosError<ApiErrorResponse<BrandFormInput>>;
        if (applyApiErrors(err.response?.data?.errors, setError)) return;
        toast.error(err.response?.data?.message ?? "Lưu thương hiệu thất bại.");
      },
    };

    if (brand) {
      updateBrand.mutate({ id: brand.id, payload }, handlers);
      return;
    }

    createBrand.mutate(payload, handlers);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-[480px]">
        <SheetHeader>
          <SheetTitle>{isEditMode ? "Sửa thương hiệu" : "Thêm thương hiệu"}</SheetTitle>
          <SheetDescription>
            Slug có thể để trống, hệ thống sẽ tự tạo từ tên thương hiệu.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
          <fieldset className="space-y-3">
            <legend className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Thông tin cơ bản</legend>
            <Field error={errors.name?.message} label="Tên thương hiệu *" htmlFor="name">
              <Input id="name" className="h-9" placeholder="Chanel" {...register("name")} />
            </Field>
            <Field error={errors.slug?.message} label="Slug" htmlFor="slug">
              <Input id="slug" className="h-9" placeholder="chanel" {...register("slug")} />
            </Field>
            <Field error={errors.description?.message} label="Mô tả" htmlFor="description">
              <Textarea
                id="description"
                rows={3}
                className=""
                placeholder="Mô tả ngắn về thương hiệu"
                {...register("description")}
              />
            </Field>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Nhận diện</legend>
            <Field error={errors.logo?.message} label="Logo URL" htmlFor="logo">
              <Input id="logo" className="h-9" placeholder="https://example.com/logo.png" {...register("logo")} />
            </Field>
            <Field error={errors.website?.message} label="Website" htmlFor="website">
              <Input id="website" className="h-9" placeholder="https://example.com" {...register("website")} />
            </Field>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Trạng thái</legend>
            <Field error={errors.status?.message} label="Trạng thái" htmlFor="status">
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="status" className="h-9 focus:border-primary focus:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BRAND_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Hiển thị</legend>
            <Field error={errors.sort_order?.message} label="Thứ tự" htmlFor="sort_order">
              <Input
                id="sort_order"
                type="number"
                min={1}
                className="h-9"
                placeholder="Tự động"
                {...register("sort_order")}
              />
            </Field>
          </fieldset>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting && <ButtonSpinner />}
              {isSubmitting ? "Đang lưu..." : "Lưu"}
            </Button>
            <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => onOpenChange(false)} className="flex-1">
              Huỷ
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function Field({
  children,
  className,
  error,
  htmlFor,
  label,
}: {
  children: ReactNode;
  className?: string;
  error?: string;
  htmlFor: string;
  label: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function getDefaultValues(brand?: Brand | null): BrandFormInput {
  return {
    name: brand?.name ?? "",
    slug: brand?.slug ?? "",
    description: brand?.description ?? "",
    logo: brand?.logo ?? "",
    website: brand?.website ?? "",
    status: brand?.status ?? "active",
    sort_order: brand?.sort_order ?? "",
  };
}

function toPayload(values: BrandFormValues): BrandPayload {
  return {
    name: values.name.trim(),
    slug: normalizeOptionalString(values.slug),
    description: normalizeOptionalString(values.description),
    logo: normalizeOptionalString(values.logo),
    website: normalizeOptionalString(values.website),
    status: values.status,
    sort_order: values.sort_order,
  };
}

function normalizeOptionalString(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed === "" ? null : trimmed;
}
