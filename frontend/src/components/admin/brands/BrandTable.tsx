import { BadgeCheck, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/skeletons/TableSkeleton";
import { BrandRowActionsMenu } from "@/components/admin/brands/BrandRowActionsMenu";
import { BrandStatusBadge } from "@/components/admin/brands/BrandStatusBadge";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatDateTime } from "@/lib/date-time";
import type { Brand, BrandListResponse } from "@/types/brand";

interface BrandTableProps {
  brands: Brand[];
  pagination?: BrandListResponse;
  isLoading?: boolean;
  hasFilters?: boolean;
  currentPage: number;
  isFetching?: boolean;
  onPageChange: (page: number) => void;
  selectedIds?: Set<number>;
  onCreate: () => void;
  onEdit: (brand: Brand) => void;
  onDelete: (brand: Brand) => void;
  onSelectedChange?: (selectedIds: Set<number>) => void;
}

export function BrandTable({
  brands,
  pagination,
  isLoading,
  hasFilters,
  currentPage,
  isFetching,
  onPageChange,
  selectedIds = EMPTY_SELECTED_IDS,
  onCreate,
  onEdit,
  onDelete,
  onSelectedChange = noopSelectionChange,
}: BrandTableProps) {
  const isMobile = useIsMobile();
  const allSelected = brands.length > 0 && brands.every((brand) => selectedIds.has(brand.id));
  const someSelected = brands.some((brand) => selectedIds.has(brand.id));

  const toggleAll = (checked: boolean) => {
    const next = new Set(selectedIds);

    brands.forEach((brand) => {
      if (checked) {
        next.add(brand.id);
      } else {
        next.delete(brand.id);
      }
    });

    onSelectedChange(next);
  };

  const toggleOne = (brandId: number, checked: boolean) => {
    const next = new Set(selectedIds);

    if (checked) {
      next.add(brandId);
    } else {
      next.delete(brandId);
    }

    onSelectedChange(next);
  };

  if (isLoading) {
    return (
      <div className="rounded-md border border-border bg-white p-4">
        <TableSkeleton rows={6} columns={10} />
      </div>
    );
  }

  if (brands.length === 0) {
    return (
      <EmptyState
        icon={BadgeCheck}
        title={hasFilters ? "Không tìm thấy thương hiệu" : "Chưa có thương hiệu"}
        description={
          hasFilters
            ? "Thử thay đổi từ khoá tìm kiếm hoặc bộ lọc trạng thái."
            : "Tạo thương hiệu đầu tiên để dùng cho sản phẩm và bộ lọc storefront."
        }
        actionLabel={hasFilters ? undefined : "Thêm thương hiệu"}
        onAction={hasFilters ? undefined : onCreate}
      />
    );
  }

  const paginationContent = (
    <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
      <span>
        Hiển thị {pagination?.from ?? 0}-{pagination?.to ?? 0} trong {pagination?.total ?? 0} thương hiệu
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1 || isFetching}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        >
          Trước
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!pagination || currentPage >= pagination.last_page || isFetching}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Sau
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div>
        <div className="space-y-3">
          {brands.map((brand) => (
            <Card key={brand.id} className="transition-colors hover:bg-muted/50">
              <CardHeader className="px-4 pb-2 pt-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Checkbox
                      checked={selectedIds.has(brand.id)}
                      onCheckedChange={(checked) => toggleOne(brand.id, checked === true)}
                      aria-label={`Chọn thương hiệu ${brand.name}`}
                    />
                    <BrandLogo brand={brand} />
                    <div className="min-w-0">
                      <CardTitle className="truncate text-sm font-medium">{brand.name}</CardTitle>
                      <p className="mt-1 font-mono text-xs text-muted-foreground">{brand.slug}</p>
                    </div>
                  </div>
                  <BrandStatusBadge status={brand.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-1 px-4 pb-3 text-sm">
                {brand.website && (
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Website</span>
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate text-primary hover:underline"
                    >
                      {brand.website}
                    </a>
                  </div>
                )}
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Thứ tự</span>
                  <span className="font-mono">{brand.sort_order}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Ngày tạo</span>
                  <span className="text-right text-muted-foreground">{formatDateTime(brand.created_at)}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Ngày cập nhật</span>
                  <span className="text-right text-muted-foreground">{formatDateTime(brand.updated_at)}</span>
                </div>
                <div className="flex justify-end pt-1">
                  <BrandRowActionsMenu brand={brand} onEdit={onEdit} onDelete={onDelete} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {paginationContent}
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-md border border-border bg-white">
        <Table className="min-w-[1360px] table-fixed">
          <colgroup>
            <col className="w-12" />
            <col className="w-16" />
            <col className="w-20" />
            <col className="w-[20%]" />
            <col className="w-[16%]" />
            <col className="w-[18%]" />
            <col className="w-36" />
            <col className="w-24" />
            <col className="w-40" />
            <col className="w-40" />
            <col className="w-12" />
          </colgroup>
          <TableHeader className="sticky top-0 bg-card">
            <TableRow>
              <TableHead className="pl-4">
                <Checkbox
                  checked={allSelected ? true : someSelected ? "indeterminate" : false}
                  onCheckedChange={(checked) => toggleAll(checked === true)}
                  aria-label="Chọn tất cả thương hiệu trên trang"
                />
              </TableHead>
              <TableHead className="text-center">STT</TableHead>
              <TableHead>Logo</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Website</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-center">Thứ tự</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Ngày cập nhật</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.map((brand, index) => (
              <TableRow key={brand.id} className={selectedIds.has(brand.id) ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/50"}>
                <TableCell className="pl-4" onClick={(event) => event.stopPropagation()}>
                  <Checkbox
                    checked={selectedIds.has(brand.id)}
                    onCheckedChange={(checked) => toggleOne(brand.id, checked === true)}
                    aria-label={`Chọn thương hiệu ${brand.name}`}
                  />
                </TableCell>
                <TableCell className="text-center font-mono text-xs text-muted-foreground">
                  {((pagination?.current_page ?? currentPage) - 1) * (pagination?.per_page ?? brands.length) + index + 1}
                </TableCell>
                <TableCell>
                  <BrandLogo brand={brand} />
                </TableCell>
                <TableCell className="min-w-0">
                  <div className="truncate font-medium">{brand.name}</div>
                  {brand.description && (
                    <div className="mt-1 truncate text-xs text-muted-foreground">
                      {brand.description}
                    </div>
                  )}
                </TableCell>
                <TableCell className="truncate font-mono text-xs text-muted-foreground">{brand.slug}</TableCell>
                <TableCell className="min-w-0">
                  {brand.website ? (
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex max-w-full items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <span className="truncate">{brand.website}</span>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    </a>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <BrandStatusBadge status={brand.status} />
                </TableCell>
                <TableCell className="text-center font-mono text-sm">{brand.sort_order}</TableCell>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{formatDateTime(brand.created_at)}</TableCell>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{formatDateTime(brand.updated_at)}</TableCell>
                <TableCell className="text-right" onClick={(event) => event.stopPropagation()}>
                  <BrandRowActionsMenu brand={brand} onEdit={onEdit} onDelete={onDelete} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {paginationContent}
    </div>
  );
}

const EMPTY_SELECTED_IDS = new Set<number>();
const noopSelectionChange = () => {};

function BrandLogo({ brand }: { brand: Brand }) {
  if (brand.logo) {
    return (
      <img
        src={brand.logo}
        alt={brand.name}
        className="h-10 w-10 rounded-md border border-border bg-white object-contain"
      />
    );
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-muted text-sm font-semibold text-muted-foreground">
      {brand.name.charAt(0).toUpperCase()}
    </div>
  );
}
