import { Filter, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/admin/ui/input";
import {
  PRODUCT_FEATURED_FILTER_OPTIONS,
  PRODUCT_GENDER_FILTER_OPTIONS,
  PRODUCT_STATUS_FILTER_OPTIONS,
} from "@/constants/product";
import { cn } from "@/lib/utils";
import type { Brand } from "@/types/brand";
import type { Category } from "@/types/category";
import type {
  ProductFeaturedFilter,
  ProductGenderFilter,
  ProductListStatusFilter,
} from "@/types/product";

interface ProductFiltersProps {
  search: string;
  status: ProductListStatusFilter;
  gender: ProductGenderFilter;
  brandId: number | "all";
  categoryId: number | "all";
  isFeatured: ProductFeaturedFilter;
  brands: Brand[];
  categories: Category[];
  isFetching?: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: ProductListStatusFilter) => void;
  onGenderChange: (value: ProductGenderFilter) => void;
  onBrandChange: (value: number | "all") => void;
  onCategoryChange: (value: number | "all") => void;
  onFeaturedChange: (value: ProductFeaturedFilter) => void;
  onClear: () => void;
  onRefresh: () => void;
}

export function ProductFilters({
  search,
  status,
  gender,
  brandId,
  categoryId,
  isFeatured,
  brands,
  categories,
  isFetching,
  onSearchChange,
  onStatusChange,
  onGenderChange,
  onBrandChange,
  onCategoryChange,
  onFeaturedChange,
  onClear,
  onRefresh,
}: ProductFiltersProps) {
  const activeCount = [
    search.trim(),
    status !== "all" ? status : "",
    gender !== "all" ? gender : "",
    brandId !== "all" ? brandId : "",
    categoryId !== "all" ? categoryId : "",
    isFeatured !== "all" ? isFeatured : "",
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
      <Input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        className="h-9 w-full rounded-md bg-white lg:w-64"
        placeholder="Tìm tên, slug hoặc SKU..."
      />

      <Select value={status} onValueChange={(value) => onStatusChange(value as ProductListStatusFilter)}>
        <SelectTrigger className="h-9 w-full focus:border-primary focus:ring-0 sm:w-44">
          <SelectValue placeholder="Trạng thái" />
        </SelectTrigger>
        <SelectContent>
          {PRODUCT_STATUS_FILTER_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={gender} onValueChange={(value) => onGenderChange(value as ProductGenderFilter)}>
        <SelectTrigger className="h-9 w-full focus:border-primary focus:ring-0 sm:w-44">
          <SelectValue placeholder="Giới tính" />
        </SelectTrigger>
        <SelectContent>
          {PRODUCT_GENDER_FILTER_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={String(brandId)} onValueChange={(value) => onBrandChange(value === "all" ? "all" : Number(value))}>
        <SelectTrigger className="h-9 w-full focus:border-primary focus:ring-0 sm:w-48">
          <SelectValue placeholder="Thương hiệu" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả thương hiệu</SelectItem>
          {brands.map((brand) => (
            <SelectItem key={brand.id} value={String(brand.id)}>
              {brand.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={String(categoryId)} onValueChange={(value) => onCategoryChange(value === "all" ? "all" : Number(value))}>
        <SelectTrigger className="h-9 w-full focus:border-primary focus:ring-0 sm:w-48">
          <SelectValue placeholder="Danh mục" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả danh mục</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={String(category.id)}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={isFeatured} onValueChange={(value) => onFeaturedChange(value as ProductFeaturedFilter)}>
        <SelectTrigger className="h-9 w-full focus:border-primary focus:ring-0 sm:w-44">
          <SelectValue placeholder="Nổi bật" />
        </SelectTrigger>
        <SelectContent>
          {PRODUCT_FEATURED_FILTER_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {activeCount > 0 && (
        <Button variant="ghost" size="sm" onClick={onClear} className="gap-1 text-muted-foreground">
          <X className="h-3 w-3" />
          Xoá lọc
        </Button>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5 lg:ml-auto"
        disabled={isFetching}
        onClick={onRefresh}
      >
        <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
        Làm mới
      </Button>

      {activeCount > 0 && (
        <span className="inline-flex h-6 items-center gap-1 rounded-full bg-primary/10 px-2 text-xs font-medium text-primary lg:hidden">
          <Filter className="h-3 w-3" />
          {activeCount} bộ lọc
        </span>
      )}
    </div>
  );
}
