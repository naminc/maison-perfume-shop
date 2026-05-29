import { useEffect, type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  PRODUCT_GENDER_OPTIONS,
  PRODUCT_STATUS_OPTIONS,
} from "@/constants/product";
import { useCreateProduct, useUpdateProduct } from "@/hooks/useAdminProducts";
import { wasApiConnectionNotified } from "@/lib/api";
import { applyApiErrors } from "@/lib/form-utils";
import { cn } from "@/lib/utils";
import { productSchema, type ProductFormInput, type ProductFormValues } from "@/schemas/admin/product";
import type { ApiErrorResponse } from "@/types/auth";
import type { Brand } from "@/types/brand";
import type { Category } from "@/types/category";
import type { Product, ProductPayload } from "@/types/product";

interface ProductFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  brands: Brand[];
  categories: Category[];
}

export function ProductFormSheet({
  open,
  onOpenChange,
  product,
  brands,
  categories,
}: ProductFormSheetProps) {
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const isEditMode = Boolean(product);
  const isSubmitting = createProduct.isPending || updateProduct.isPending;

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: getDefaultValues(product),
  });

  useEffect(() => {
    if (open) {
      reset(getDefaultValues(product));
    }
  }, [product, open, reset]);

  const onSubmit = (values: ProductFormValues) => {
    const payload = toPayload(values);

    const handlers = {
      onSuccess: () => {
        toast.success(isEditMode ? "Đã cập nhật sản phẩm." : "Đã thêm sản phẩm.");
        onOpenChange(false);
      },
      onError: (error: unknown) => {
        if (wasApiConnectionNotified(error)) return;
        const err = error as AxiosError<ApiErrorResponse<ProductFormInput>>;
        if (applyApiErrors(err.response?.data?.errors, setError)) return;
        toast.error(err.response?.data?.message ?? "Lưu sản phẩm thất bại.");
      },
    };

    if (product) {
      updateProduct.mutate({ id: product.id, payload }, handlers);
      return;
    }

    createProduct.mutate(payload, handlers);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-[640px]">
        <SheetHeader>
          <SheetTitle>{isEditMode ? "Sửa sản phẩm" : "Thêm sản phẩm"}</SheetTitle>
          <SheetDescription>
            Slug có thể để trống, hệ thống sẽ tự tạo từ tên sản phẩm.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
          <fieldset className="space-y-3">
            <legend className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Thông tin cơ bản</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field error={errors.name?.message} label="Tên sản phẩm *" htmlFor="name">
                <Input id="name" className="h-9" placeholder="Maison Rose Eau de Parfum" {...register("name")} />
              </Field>
              <Field error={errors.slug?.message} label="Slug" htmlFor="slug">
                <Input id="slug" className="h-9" placeholder="maison-rose-edp" {...register("slug")} />
              </Field>
              <Field error={errors.sku?.message} label="SKU" htmlFor="sku">
                <Input id="sku" className="h-9" placeholder="MSR-EDP-50" {...register("sku")} />
              </Field>
              <Field error={errors.image?.message} label="Ảnh URL" htmlFor="image">
                <Input id="image" className="h-9" placeholder="https://example.com/product.jpg" {...register("image")} />
              </Field>
            </div>
            <Field error={errors.short_description?.message} label="Mô tả ngắn" htmlFor="short_description">
              <Textarea
                id="short_description"
                rows={2}
                placeholder="Mô tả ngắn hiển thị ở danh sách sản phẩm"
                {...register("short_description")}
              />
            </Field>
            <Field error={errors.description?.message} label="Mô tả chi tiết" htmlFor="description">
              <Textarea
                id="description"
                rows={4}
                placeholder="Thông tin hương, phong cách, dịp sử dụng..."
                {...register("description")}
              />
            </Field>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Phân loại</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field error={errors.brand_id?.message} label="Thương hiệu" htmlFor="brand_id">
                <Controller
                  control={control}
                  name="brand_id"
                  render={({ field }) => (
                    <Select
                      value={field.value ? String(field.value) : "none"}
                      onValueChange={(value) => field.onChange(value === "none" ? undefined : Number(value))}
                    >
                      <SelectTrigger id="brand_id" className="h-9 focus:border-primary focus:ring-0">
                        <SelectValue placeholder="Chọn thương hiệu" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Không chọn</SelectItem>
                        {brands.map((brand) => (
                          <SelectItem key={brand.id} value={String(brand.id)}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              <Field error={errors.category_id?.message} label="Danh mục" htmlFor="category_id">
                <Controller
                  control={control}
                  name="category_id"
                  render={({ field }) => (
                    <Select
                      value={field.value ? String(field.value) : "none"}
                      onValueChange={(value) => field.onChange(value === "none" ? undefined : Number(value))}
                    >
                      <SelectTrigger id="category_id" className="h-9 focus:border-primary focus:ring-0">
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Không chọn</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={String(category.id)}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              <Field error={errors.gender?.message} label="Giới tính *" htmlFor="gender">
                <Controller
                  control={control}
                  name="gender"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="gender" className="h-9 focus:border-primary focus:ring-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRODUCT_GENDER_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              <Field error={errors.concentration?.message} label="Nồng độ" htmlFor="concentration">
                <Input id="concentration" className="h-9" placeholder="EDP, EDT, Parfum..." {...register("concentration")} />
              </Field>

              <Field error={errors.volume_ml?.message} label="Dung tích (ml)" htmlFor="volume_ml">
                <Input id="volume_ml" type="number" min={1} className="h-9" placeholder="50" {...register("volume_ml")} />
              </Field>
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Giá và tồn kho</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field error={errors.price?.message} label="Giá bán *" htmlFor="price">
                <Input id="price" type="number" min={0} step="1000" className="h-9" placeholder="1850000" {...register("price")} />
              </Field>
              <Field error={errors.sale_price?.message} label="Giá khuyến mãi" htmlFor="sale_price">
                <Input id="sale_price" type="number" min={0} step="1000" className="h-9" placeholder="Tuỳ chọn" {...register("sale_price")} />
              </Field>
              <Field error={errors.stock?.message} label="Tồn kho *" htmlFor="stock">
                <Input id="stock" type="number" min={0} className="h-9" placeholder="0" {...register("stock")} />
              </Field>
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Hiển thị</legend>
            <div className="grid gap-3 sm:grid-cols-2">
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
                        {PRODUCT_STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
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
            </div>
            <Controller
              control={control}
              name="is_featured"
              render={({ field }) => (
                <label className="flex items-center gap-2 rounded-md border border-border bg-white px-3 py-2 text-sm">
                  <Checkbox checked={field.value === true} onCheckedChange={(checked) => field.onChange(checked === true)} />
                  <span>Sản phẩm nổi bật</span>
                </label>
              )}
            />
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

function getDefaultValues(product?: Product | null): ProductFormInput {
  return {
    brand_id: product?.brand_id ?? undefined,
    category_id: product?.category_id ?? undefined,
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    sku: product?.sku ?? "",
    short_description: product?.short_description ?? "",
    description: product?.description ?? "",
    image: product?.image ?? "",
    gender: product?.gender ?? "unisex",
    concentration: product?.concentration ?? "",
    volume_ml: product?.volume_ml ?? "",
    price: product?.price ?? "",
    sale_price: product?.sale_price ?? "",
    stock: product?.stock ?? 0,
    status: product?.status ?? "active",
    is_featured: product?.is_featured ?? false,
    sort_order: product?.sort_order ?? "",
  };
}

function toPayload(values: ProductFormValues): ProductPayload {
  return {
    brand_id: values.brand_id ?? null,
    category_id: values.category_id ?? null,
    name: values.name.trim(),
    slug: normalizeOptionalString(values.slug),
    sku: normalizeOptionalString(values.sku),
    short_description: normalizeOptionalString(values.short_description),
    description: normalizeOptionalString(values.description),
    image: normalizeOptionalString(values.image),
    gender: values.gender,
    concentration: normalizeOptionalString(values.concentration),
    volume_ml: values.volume_ml ?? null,
    price: values.price,
    sale_price: values.sale_price ?? null,
    stock: values.stock,
    status: values.status,
    is_featured: values.is_featured ?? false,
    sort_order: values.sort_order,
  };
}

function normalizeOptionalString(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed === "" ? null : trimmed;
}
