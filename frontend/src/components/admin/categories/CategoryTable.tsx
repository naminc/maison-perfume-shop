import { Tags } from "lucide-react";
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
import { CategoryRowActionsMenu } from "@/components/admin/categories/CategoryRowActionsMenu";
import { CategoryStatusBadge } from "@/components/admin/categories/CategoryStatusBadge";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Category, CategoryListResponse } from "@/types/category";

interface CategoryTableProps {
  categories: Category[];
  pagination?: CategoryListResponse;
  isLoading?: boolean;
  hasFilters?: boolean;
  currentPage: number;
  isFetching?: boolean;
  onPageChange: (page: number) => void;
  selectedIds?: Set<number>;
  onCreate: () => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onSelectedChange?: (selectedIds: Set<number>) => void;
}

export function CategoryTable({
  categories,
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
}: CategoryTableProps) {
  const isMobile = useIsMobile();
  const allSelected = categories.length > 0 && categories.every((category) => selectedIds.has(category.id));
  const someSelected = categories.some((category) => selectedIds.has(category.id));

  const toggleAll = (checked: boolean) => {
    const next = new Set(selectedIds);

    categories.forEach((category) => {
      if (checked) {
        next.add(category.id);
      } else {
        next.delete(category.id);
      }
    });

    onSelectedChange(next);
  };

  const toggleOne = (categoryId: number, checked: boolean) => {
    const next = new Set(selectedIds);

    if (checked) {
      next.add(categoryId);
    } else {
      next.delete(categoryId);
    }

    onSelectedChange(next);
  };

  if (isLoading) {
    return (
      <div className="rounded-md border border-border bg-white p-4">
        <TableSkeleton rows={6} columns={7} />
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <EmptyState
        icon={Tags}
        title={hasFilters ? "Không tìm thấy danh mục" : "Chưa có danh mục"}
        description={
          hasFilters
            ? "Thử thay đổi từ khoá tìm kiếm hoặc bộ lọc trạng thái."
            : "Tạo danh mục đầu tiên để bắt đầu quản lý sản phẩm."
        }
        actionLabel={hasFilters ? undefined : "Thêm danh mục"}
        onAction={hasFilters ? undefined : onCreate}
      />
    );
  }

  const paginationContent = (
    <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
      <span>
        Hiển thị {pagination?.from ?? 0}-{pagination?.to ?? 0} trong {pagination?.total ?? 0} danh mục
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
          {categories.map((category) => (
            <Card key={category.id} className="transition-colors hover:bg-muted/50">
              <CardHeader className="px-4 pb-2 pt-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <Checkbox
                      checked={selectedIds.has(category.id)}
                      onCheckedChange={(checked) => toggleOne(category.id, checked === true)}
                      aria-label={`Chọn danh mục ${category.name}`}
                    />
                    <div className="min-w-0">
                      <CardTitle className="truncate text-sm font-medium">{category.name}</CardTitle>
                      <p className="mt-1 font-mono text-xs text-muted-foreground">{category.slug}</p>
                    </div>
                  </div>
                  <CategoryStatusBadge status={category.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-1 px-4 pb-3 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Thứ tự</span>
                  <span className="font-mono">{category.sort_order}</span>
                </div>
                <div className="flex justify-end pt-1">
                  <CategoryRowActionsMenu category={category} onEdit={onEdit} onDelete={onDelete} />
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
        <Table className="min-w-[1024px] table-fixed">
          <colgroup>
            <col className="w-12" />
            <col className="w-16" />
            <col className="w-[28%]" />
            <col className="w-[26%]" />
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
                  aria-label="Chọn tất cả danh mục trên trang"
                />
              </TableHead>
              <TableHead className="text-center">STT</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-center">Thứ tự</TableHead>
              <TableHead>Ngày cập nhật</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category, index) => (
              <TableRow key={category.id} className={selectedIds.has(category.id) ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/50"}>
                <TableCell className="pl-4" onClick={(event) => event.stopPropagation()}>
                  <Checkbox
                    checked={selectedIds.has(category.id)}
                    onCheckedChange={(checked) => toggleOne(category.id, checked === true)}
                    aria-label={`Chọn danh mục ${category.name}`}
                  />
                </TableCell>
                <TableCell className="text-center font-mono text-xs text-muted-foreground">
                  {((pagination?.current_page ?? currentPage) - 1) * (pagination?.per_page ?? categories.length) + index + 1}
                </TableCell>
                <TableCell className="min-w-0">
                  <div className="truncate font-medium">{category.name}</div>
                  {category.description && (
                    <div className="mt-1 truncate text-xs text-muted-foreground">
                      {category.description}
                    </div>
                  )}
                </TableCell>
                <TableCell className="truncate font-mono text-xs text-muted-foreground">{category.slug}</TableCell>
                <TableCell className="whitespace-nowrap">
                  <CategoryStatusBadge status={category.status} />
                </TableCell>
                <TableCell className="text-center font-mono text-sm">{category.sort_order}</TableCell>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{formatDate(category.updated_at)}</TableCell>
                <TableCell className="text-right" onClick={(event) => event.stopPropagation()}>
                  <CategoryRowActionsMenu category={category} onEdit={onEdit} onDelete={onDelete} />
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

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}
