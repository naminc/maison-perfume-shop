import { Package } from "lucide-react";
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
import { ProductRowActionsMenu } from "@/components/admin/products/ProductRowActionsMenu";
import { ProductStatusBadge } from "@/components/admin/products/ProductStatusBadge";
import { PRODUCT_GENDER_LABELS } from "@/constants/product";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatDateTime } from "@/lib/date-time";
import { cn } from "@/lib/utils";
import type { Product, ProductListResponse } from "@/types/product";

interface ProductTableProps {
  products: Product[];
  pagination?: ProductListResponse;
  isLoading?: boolean;
  hasFilters?: boolean;
  currentPage: number;
  isFetching?: boolean;
  onPageChange: (page: number) => void;
  selectedIds?: Set<number>;
  onCreate: () => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onSelectedChange?: (selectedIds: Set<number>) => void;
}

export function ProductTable({
  products,
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
}: ProductTableProps) {
  const isMobile = useIsMobile();
  const allSelected = products.length > 0 && products.every((product) => selectedIds.has(product.id));
  const someSelected = products.some((product) => selectedIds.has(product.id));

  const toggleAll = (checked: boolean) => {
    const next = new Set(selectedIds);

    products.forEach((product) => {
      if (checked) {
        next.add(product.id);
      } else {
        next.delete(product.id);
      }
    });

    onSelectedChange(next);
  };

  const toggleOne = (productId: number, checked: boolean) => {
    const next = new Set(selectedIds);

    if (checked) {
      next.add(productId);
    } else {
      next.delete(productId);
    }

    onSelectedChange(next);
  };

  if (isLoading) {
    return (
      <div className="rounded-md border border-border bg-white p-4">
        <TableSkeleton rows={6} columns={12} />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title={hasFilters ? "Không tìm thấy sản phẩm" : "Chưa có sản phẩm"}
        description={
          hasFilters
            ? "Thử thay đổi từ khoá tìm kiếm hoặc bộ lọc sản phẩm."
            : "Tạo sản phẩm đầu tiên để bắt đầu quản lý catalogue bán hàng."
        }
        actionLabel={hasFilters ? undefined : "Thêm sản phẩm"}
        onAction={hasFilters ? undefined : onCreate}
      />
    );
  }

  const paginationContent = (
    <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
      <span>
        Hiển thị {pagination?.from ?? 0}-{pagination?.to ?? 0} trong {pagination?.total ?? 0} sản phẩm
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
          {products.map((product) => (
            <Card key={product.id} className="transition-colors hover:bg-muted/50">
              <CardHeader className="px-4 pb-2 pt-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Checkbox
                      checked={selectedIds.has(product.id)}
                      onCheckedChange={(checked) => toggleOne(product.id, checked === true)}
                      aria-label={`Chọn sản phẩm ${product.name}`}
                    />
                    <ProductImage product={product} />
                    <div className="min-w-0">
                      <CardTitle className="truncate text-sm font-medium">{product.name}</CardTitle>
                      <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
                        {product.sku ?? product.slug}
                      </p>
                    </div>
                  </div>
                  <ProductStatusBadge status={product.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-1 px-4 pb-3 text-sm">
                <InfoRow label="Thương hiệu" value={product.brand?.name ?? "-"} />
                <InfoRow label="Danh mục" value={product.category?.name ?? "-"} />
                <InfoRow label="Giá" value={formatProductPrice(product)} />
                <InfoRow label="Tồn kho" value={String(product.stock)} />
                <InfoRow label="Thứ tự" value={String(product.sort_order)} />
                <InfoRow label="Ngày cập nhật" value={formatDateTime(product.updated_at)} muted />
                <div className="flex justify-end pt-1">
                  <ProductRowActionsMenu product={product} onEdit={onEdit} onDelete={onDelete} />
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
        <Table className="min-w-[1540px] table-fixed">
          <colgroup>
            <col className="w-12" />
            <col className="w-16" />
            <col className="w-20" />
            <col className="w-[18%]" />
            <col className="w-32" />
            <col className="w-36" />
            <col className="w-36" />
            <col className="w-28" />
            <col className="w-36" />
            <col className="w-24" />
            <col className="w-36" />
            <col className="w-24" />
            <col className="w-40" />
            <col className="w-12" />
          </colgroup>
          <TableHeader className="sticky top-0 bg-card">
            <TableRow>
              <TableHead className="pl-4">
                <Checkbox
                  checked={allSelected ? true : someSelected ? "indeterminate" : false}
                  onCheckedChange={(checked) => toggleAll(checked === true)}
                  aria-label="Chọn tất cả sản phẩm trên trang"
                />
              </TableHead>
              <TableHead className="text-center">STT</TableHead>
              <TableHead>Ảnh</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Thương hiệu</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Giới tính</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead className="text-center">Tồn kho</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-center">Thứ tự</TableHead>
              <TableHead>Ngày cập nhật</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product, index) => (
              <TableRow key={product.id} className={selectedIds.has(product.id) ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/50"}>
                <TableCell className="pl-4" onClick={(event) => event.stopPropagation()}>
                  <Checkbox
                    checked={selectedIds.has(product.id)}
                    onCheckedChange={(checked) => toggleOne(product.id, checked === true)}
                    aria-label={`Chọn sản phẩm ${product.name}`}
                  />
                </TableCell>
                <TableCell className="text-center font-mono text-xs text-muted-foreground">
                  {((pagination?.current_page ?? currentPage) - 1) * (pagination?.per_page ?? products.length) + index + 1}
                </TableCell>
                <TableCell>
                  <ProductImage product={product} />
                </TableCell>
                <TableCell className="min-w-0">
                  <div className="truncate font-medium">{product.name}</div>
                  <div className="mt-1 truncate font-mono text-xs text-muted-foreground">{product.slug}</div>
                </TableCell>
                <TableCell className="truncate font-mono text-xs text-muted-foreground">{product.sku ?? "-"}</TableCell>
                <TableCell className="truncate text-sm">{product.brand?.name ?? "-"}</TableCell>
                <TableCell className="truncate text-sm">{product.category?.name ?? "-"}</TableCell>
                <TableCell className="text-sm">{PRODUCT_GENDER_LABELS[product.gender]}</TableCell>
                <TableCell className="whitespace-nowrap">
                  <PriceBlock product={product} />
                </TableCell>
                <TableCell className={cn("text-center font-mono text-sm", product.stock === 0 && "text-destructive")}>
                  {product.stock}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <ProductStatusBadge status={product.status} />
                </TableCell>
                <TableCell className="text-center font-mono text-sm">{product.sort_order}</TableCell>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{formatDateTime(product.updated_at)}</TableCell>
                <TableCell className="text-right" onClick={(event) => event.stopPropagation()}>
                  <ProductRowActionsMenu product={product} onEdit={onEdit} onDelete={onDelete} />
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

function InfoRow({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("truncate text-right", muted && "text-muted-foreground")}>{value}</span>
    </div>
  );
}

function ProductImage({ product }: { product: Product }) {
  if (product.image) {
    return (
      <img
        src={product.image}
        alt={product.name}
        className="h-12 w-12 rounded-md border border-border bg-white object-cover"
      />
    );
  }

  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground">
      <Package className="h-5 w-5" />
    </div>
  );
}

function PriceBlock({ product }: { product: Product }) {
  if (product.sale_price) {
    return (
      <div className="space-y-0.5">
        <div className="font-medium text-destructive">{formatMoney(product.sale_price)}</div>
        <div className="text-xs text-muted-foreground line-through">{formatMoney(product.price)}</div>
      </div>
    );
  }

  return <span className="font-medium">{formatMoney(product.price)}</span>;
}

function formatProductPrice(product: Product) {
  return product.sale_price
    ? `${formatMoney(product.sale_price)} / ${formatMoney(product.price)}`
    : formatMoney(product.price);
}

function formatMoney(value: string | number | null) {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}
