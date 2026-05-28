import { useEffect, useMemo, useState } from "react";
import type { AxiosError } from "axios";
import { Download, Plus, RefreshCw, Tags } from "lucide-react";
import { toast } from "sonner";
import { adminCategoryApi } from "@/api/admin/category";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CategoryFilters } from "@/components/admin/categories/CategoryFilters";
import { CategoryFormSheet } from "@/components/admin/categories/CategoryFormSheet";
import { CategoryTable } from "@/components/admin/categories/CategoryTable";
import { AdminBulkActionBar } from "@/components/admin/shared/AdminBulkActionBar";
import { ButtonSpinner } from "@/components/shared/ButtonSpinner";
import { CATEGORY_PAGE_SIZE, CATEGORY_STATUS_LABELS } from "@/constants/category";
import { useAdminCategories, useDeleteCategory } from "@/hooks/useAdminCategories";
import { wasApiConnectionNotified } from "@/lib/api";
import { formatDateTime } from "@/lib/date-time";
import { exportExcel, type ExcelColumn } from "@/lib/export-excel";
import type { ApiErrorResponse } from "@/types/auth";
import type { Category, CategoryListParams, CategoryListStatusFilter } from "@/types/category";

export default function Categories() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<CategoryListStatusFilter>("all");
  const [page, setPage] = useState(1);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<number>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const deleteCategory = useDeleteCategory();

  const listParams = useMemo<CategoryListParams>(() => ({
    search: debouncedSearch,
    status,
    page,
    per_page: CATEGORY_PAGE_SIZE,
  }), [debouncedSearch, page, status]);

  const categoriesQuery = useAdminCategories(listParams);

  const categories = categoriesQuery.data?.data ?? [];
  const hasFilters = Boolean(debouncedSearch.trim()) || status !== "all";

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    setPage(1);
    setSelectedCategoryIds(new Set());
  }, [debouncedSearch, status]);

  const openCreate = () => {
    setEditingCategory(null);
    setSheetOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditingCategory(category);
    setSheetOpen(true);
  };

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setStatus("all");
  };

  const confirmDelete = () => {
    if (!deletingCategory) return;

    deleteCategory.mutate(deletingCategory.id, {
      onSuccess: () => {
        toast.success("Đã xoá danh mục.");
        setDeletingCategory(null);
        setSelectedCategoryIds((current) => {
          const next = new Set(current);
          next.delete(deletingCategory.id);
          return next;
        });
        if (categories.length === 1 && page > 1) {
          setPage((current) => current - 1);
        }
      },
      onError: (error) => {
        if (wasApiConnectionNotified(error)) return;
        toast.error(getApiErrorMessage(error, "Xoá danh mục thất bại."));
      },
    });
  };

  const confirmBulkDelete = async () => {
    const ids = Array.from(selectedCategoryIds);
    if (ids.length === 0) return;

    try {
      await Promise.all(ids.map((id) => deleteCategory.mutateAsync(id)));
      toast.success(`Đã xoá ${ids.length} danh mục.`);
      setSelectedCategoryIds(new Set());
      setBulkDeleteOpen(false);
      if (ids.length >= categories.length && page > 1) {
        setPage((current) => current - 1);
      }
    } catch (error) {
      if (wasApiConnectionNotified(error)) return;
      toast.error(getApiErrorMessage(error, "Xoá danh mục đã chọn thất bại."));
    }
  };

  const exportCategories = async () => {
    setIsExporting(true);

    try {
      const response = await adminCategoryApi.getCategories({
        search: debouncedSearch,
        status,
        per_page: 100,
      });

      if (response.data.length === 0) {
        toast.error("Không có danh mục để xuất.");
        return;
      }

      await exportExcel({
        rows: response.data,
        columns: CATEGORY_EXPORT_COLUMNS,
        filename: "maison-categories",
        sheetName: "Danh mục",
      });

      toast.success("Đã xuất file Excel danh mục.");
    } catch (error) {
      if (wasApiConnectionNotified(error)) return;
      toast.error(getApiErrorMessage(error, "Xuất Excel thất bại."));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Danh mục</h1>
          <p className="text-sm text-muted-foreground">
            {categoriesQuery.data?.total ?? 0} danh mục
          </p>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <Button
            variant="outline"
            onClick={exportCategories}
            disabled={isExporting || categoriesQuery.isLoading}
            className="gap-1.5"
          >
            {isExporting ? <ButtonSpinner /> : <Download className="h-4 w-4" />}
            Xuất Excel
          </Button>
          <Button onClick={openCreate} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Thêm danh mục
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <CategoryFilters
          search={search}
          status={status}
          isFetching={categoriesQuery.isFetching}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
          onClear={clearFilters}
          onRefresh={() => categoriesQuery.refetch()}
        />
      </Card>

      {categoriesQuery.isError ? (
        <div className="flex flex-col items-center justify-center rounded-md border border-border bg-white px-4 py-14 text-center">
          <Tags className="mb-3 h-10 w-10 text-muted-foreground/50" strokeWidth={1.5} />
          <h3 className="text-base font-semibold text-foreground">Không thể tải danh mục</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {getApiErrorMessage(categoriesQuery.error, "Vui lòng thử lại sau.")}
          </p>
          <Button className="mt-4" onClick={() => categoriesQuery.refetch()}>
            <RefreshCw className="h-4 w-4" />
            Thử lại
          </Button>
        </div>
      ) : (
        <CategoryTable
          categories={categories}
          pagination={categoriesQuery.data}
          isLoading={categoriesQuery.isLoading}
          hasFilters={hasFilters}
          currentPage={page}
          isFetching={categoriesQuery.isFetching}
          selectedIds={selectedCategoryIds}
          onPageChange={(nextPage) => {
            setSelectedCategoryIds(new Set());
            setPage(nextPage);
          }}
          onCreate={openCreate}
          onEdit={openEdit}
          onDelete={setDeletingCategory}
          onSelectedChange={setSelectedCategoryIds}
        />
      )}

      <CategoryFormSheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) setEditingCategory(null);
        }}
        category={editingCategory}
      />

      <AlertDialog open={Boolean(deletingCategory)} onOpenChange={(open) => !open && setDeletingCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá danh mục {deletingCategory?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Danh mục sẽ bị xoá khỏi trang quản trị.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteCategory.isPending}>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteCategory.isPending}
              onClick={(event) => {
                event.preventDefault();
                confirmDelete();
              }}
            >
              {deleteCategory.isPending && <ButtonSpinner />}
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá {selectedCategoryIds.size} danh mục đã chọn?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Các danh mục đã chọn sẽ bị xoá khỏi trang quản trị.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteCategory.isPending}>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteCategory.isPending}
              onClick={(event) => {
                event.preventDefault();
                confirmBulkDelete();
              }}
            >
              {deleteCategory.isPending && <ButtonSpinner />}
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AdminBulkActionBar
        selectedCount={selectedCategoryIds.size}
        itemLabel="danh mục"
        isDeleting={deleteCategory.isPending}
        onDeleteSelected={() => setBulkDeleteOpen(true)}
        onDeselectAll={() => setSelectedCategoryIds(new Set())}
      />

      {selectedCategoryIds.size === 0 && (
        <button
          type="button"
          onClick={openCreate}
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 sm:hidden"
          aria-label="Thêm danh mục"
        >
          <Plus className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}

function getApiErrorMessage(error: unknown, fallback: string) {
  const err = error as AxiosError<ApiErrorResponse>;
  return err.response?.data?.message ?? err.message ?? fallback;
}

const CATEGORY_EXPORT_COLUMNS: ExcelColumn<Category>[] = [
  {
    header: "STT",
    accessor: (_category, index) => index + 1,
  },
  {
    header: "Tên danh mục",
    accessor: (category) => category.name,
  },
  {
    header: "Slug",
    accessor: (category) => category.slug,
  },
  {
    header: "Trạng thái",
    accessor: (category) => CATEGORY_STATUS_LABELS[category.status],
  },
  {
    header: "Thứ tự",
    accessor: (category) => category.sort_order,
  },
  {
    header: "Ngày tạo",
    accessor: (category) => formatDateTime(category.created_at, ""),
  },
  {
    header: "Ngày cập nhật",
    accessor: (category) => formatDateTime(category.updated_at, ""),
  },
];
