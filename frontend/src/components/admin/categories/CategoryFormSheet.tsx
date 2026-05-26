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
import { CATEGORY_STATUS_OPTIONS } from "@/constants/category";
import { useCreateCategory, useUpdateCategory } from "@/hooks/useAdminCategories";
import { wasApiConnectionNotified } from "@/lib/api";
import { applyApiErrors } from "@/lib/form-utils";
import { cn } from "@/lib/utils";
import { categorySchema, type CategoryFormInput, type CategoryFormValues } from "@/schemas/admin/category";
import type { ApiErrorResponse } from "@/types/auth";
import type { Category, CategoryPayload } from "@/types/category";

interface CategoryFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
}

export function CategoryFormSheet({
  open,
  onOpenChange,
  category,
}: CategoryFormSheetProps) {
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const isEditMode = Boolean(category);
  const isSubmitting = createCategory.isPending || updateCategory.isPending;

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CategoryFormInput, unknown, CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: getDefaultValues(category),
  });

  useEffect(() => {
    if (open) {
      reset(getDefaultValues(category));
    }
  }, [category, open, reset]);

  const onSubmit = (values: CategoryFormValues) => {
    const payload = toPayload(values);

    const handlers = {
      onSuccess: () => {
        toast.success(isEditMode ? "Đã cập nhật danh mục." : "Đã thêm danh mục.");
        onOpenChange(false);
      },
      onError: (error: unknown) => {
        if (wasApiConnectionNotified(error)) return;
        const err = error as AxiosError<ApiErrorResponse<CategoryFormInput>>;
        if (applyApiErrors(err.response?.data?.errors, setError)) return;
        toast.error(err.response?.data?.message ?? "Lưu danh mục thất bại.");
      },
    };

    if (category) {
      updateCategory.mutate({ id: category.id, payload }, handlers);
      return;
    }

    createCategory.mutate(payload, handlers);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-[480px]">
        <SheetHeader>
          <SheetTitle>{isEditMode ? "Sửa danh mục" : "Thêm danh mục"}</SheetTitle>
          <SheetDescription>
            Slug có thể để trống, hệ thống sẽ tự tạo từ tên danh mục.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
          <fieldset className="space-y-3">
            <legend className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Thông tin cơ bản</legend>
            <Field error={errors.name?.message} label="Tên danh mục *" htmlFor="name">
              <Input id="name" className="h-9" placeholder="Nước hoa nam" {...register("name")} />
            </Field>
            <Field error={errors.slug?.message} label="Slug" htmlFor="slug">
              <Input id="slug" className="h-9" placeholder="nuoc-hoa-nam" {...register("slug")} />
            </Field>
            <Field error={errors.description?.message} label="Mô tả" htmlFor="description">
              <Textarea
                id="description"
                rows={3}
                className=""
                placeholder="Mô tả ngắn về danh mục"
                {...register("description")}
              />
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
                      {CATEGORY_STATUS_OPTIONS.map((option) => (
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

function getDefaultValues(category?: Category | null): CategoryFormInput {
  return {
    name: category?.name ?? "",
    slug: category?.slug ?? "",
    description: category?.description ?? "",
    parent_id: null,
    status: category?.status ?? "active",
    sort_order: category?.sort_order ?? "",
  };
}

function toPayload(values: CategoryFormValues): CategoryPayload {
  return {
    name: values.name.trim(),
    slug: normalizeOptionalString(values.slug),
    description: normalizeOptionalString(values.description),
    parent_id: null,
    status: values.status,
    sort_order: values.sort_order,
  };
}

function normalizeOptionalString(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed === "" ? null : trimmed;
}
