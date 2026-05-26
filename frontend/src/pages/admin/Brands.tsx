import { useEffect, useMemo, useState } from "react";
import type { AxiosError } from "axios";
import { BadgeCheck, Download, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { adminBrandApi } from "@/api/admin/brand";
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
import { BrandFilters } from "@/components/admin/brands/BrandFilters";
import { BrandFormSheet } from "@/components/admin/brands/BrandFormSheet";
import { BrandTable } from "@/components/admin/brands/BrandTable";
import { AdminBulkActionBar } from "@/components/admin/shared/AdminBulkActionBar";
import { ButtonSpinner } from "@/components/shared/ButtonSpinner";
import { BRAND_PAGE_SIZE, BRAND_STATUS_LABELS } from "@/constants/brand";
import { useAdminBrands, useDeleteBrand } from "@/hooks/useAdminBrands";
import { wasApiConnectionNotified } from "@/lib/api";
import { exportExcel, type ExcelColumn } from "@/lib/export-excel";
import type { ApiErrorResponse } from "@/types/auth";
import type { Brand, BrandListParams, BrandListStatusFilter } from "@/types/brand";

export default function Brands() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<BrandListStatusFilter>("all");
  const [page, setPage] = useState(1);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [deletingBrand, setDeletingBrand] = useState<Brand | null>(null);
  const [selectedBrandIds, setSelectedBrandIds] = useState<Set<number>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const deleteBrand = useDeleteBrand();

  const listParams = useMemo<BrandListParams>(() => ({
    search: debouncedSearch,
    status,
    page,
    per_page: BRAND_PAGE_SIZE,
  }), [debouncedSearch, page, status]);

  const brandsQuery = useAdminBrands(listParams);

  const brands = brandsQuery.data?.data ?? [];
  const hasFilters = Boolean(debouncedSearch.trim()) || status !== "all";

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    setPage(1);
    setSelectedBrandIds(new Set());
  }, [debouncedSearch, status]);

  const openCreate = () => {
    setEditingBrand(null);
    setSheetOpen(true);
  };

  const openEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setSheetOpen(true);
  };

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setStatus("all");
  };

  const confirmDelete = () => {
    if (!deletingBrand) return;

    deleteBrand.mutate(deletingBrand.id, {
      onSuccess: () => {
        toast.success("Đã xoá thương hiệu.");
        setDeletingBrand(null);
        setSelectedBrandIds((current) => {
          const next = new Set(current);
          next.delete(deletingBrand.id);
          return next;
        });
        if (brands.length === 1 && page > 1) {
          setPage((current) => current - 1);
        }
      },
      onError: (error) => {
        if (wasApiConnectionNotified(error)) return;
        toast.error(getApiErrorMessage(error, "Xoá thương hiệu thất bại."));
      },
    });
  };

  const confirmBulkDelete = async () => {
    const ids = Array.from(selectedBrandIds);
    if (ids.length === 0) return;

    try {
      await Promise.all(ids.map((id) => deleteBrand.mutateAsync(id)));
      toast.success(`Đã xoá ${ids.length} thương hiệu.`);
      setSelectedBrandIds(new Set());
      setBulkDeleteOpen(false);
      if (ids.length >= brands.length && page > 1) {
        setPage((current) => current - 1);
      }
    } catch (error) {
      if (wasApiConnectionNotified(error)) return;
      toast.error(getApiErrorMessage(error, "Xoá thương hiệu đã chọn thất bại."));
    }
  };

  const exportBrands = async () => {
    setIsExporting(true);

    try {
      const response = await adminBrandApi.getBrands({
        search: debouncedSearch,
        status,
        per_page: 100,
      });

      if (response.data.length === 0) {
        toast.error("Không có thương hiệu để xuất.");
        return;
      }

      await exportExcel({
        rows: response.data,
        columns: BRAND_EXPORT_COLUMNS,
        filename: "maison-brands",
        sheetName: "Thương hiệu",
      });

      toast.success("Đã xuất file Excel thương hiệu.");
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
          <h1 className="text-2xl font-semibold text-foreground">Thương hiệu</h1>
          <p className="text-sm text-muted-foreground">
            {brandsQuery.data?.total ?? 0} thương hiệu
          </p>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <Button
            variant="outline"
            onClick={exportBrands}
            disabled={isExporting || brandsQuery.isLoading}
            className="gap-1.5"
          >
            {isExporting ? <ButtonSpinner /> : <Download className="h-4 w-4" />}
            Xuất Excel
          </Button>
          <Button onClick={openCreate} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Thêm thương hiệu
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <BrandFilters
          search={search}
          status={status}
          isFetching={brandsQuery.isFetching}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
          onClear={clearFilters}
          onRefresh={() => brandsQuery.refetch()}
        />
      </Card>

      {brandsQuery.isError ? (
        <div className="flex flex-col items-center justify-center rounded-md border border-border bg-white px-4 py-14 text-center">
          <BadgeCheck className="mb-3 h-10 w-10 text-muted-foreground/50" strokeWidth={1.5} />
          <h3 className="text-base font-semibold text-foreground">Không thể tải thương hiệu</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {getApiErrorMessage(brandsQuery.error, "Vui lòng thử lại sau.")}
          </p>
          <Button className="mt-4" onClick={() => brandsQuery.refetch()}>
            <RefreshCw className="h-4 w-4" />
            Thử lại
          </Button>
        </div>
      ) : (
        <BrandTable
          brands={brands}
          pagination={brandsQuery.data}
          isLoading={brandsQuery.isLoading}
          hasFilters={hasFilters}
          currentPage={page}
          isFetching={brandsQuery.isFetching}
          selectedIds={selectedBrandIds}
          onPageChange={(nextPage) => {
            setSelectedBrandIds(new Set());
            setPage(nextPage);
          }}
          onCreate={openCreate}
          onEdit={openEdit}
          onDelete={setDeletingBrand}
          onSelectedChange={setSelectedBrandIds}
        />
      )}

      <BrandFormSheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) setEditingBrand(null);
        }}
        brand={editingBrand}
      />

      <AlertDialog open={Boolean(deletingBrand)} onOpenChange={(open) => !open && setDeletingBrand(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá thương hiệu {deletingBrand?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Thương hiệu sẽ bị xoá khỏi trang quản trị.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteBrand.isPending}>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteBrand.isPending}
              onClick={(event) => {
                event.preventDefault();
                confirmDelete();
              }}
            >
              {deleteBrand.isPending && <ButtonSpinner />}
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá {selectedBrandIds.size} thương hiệu đã chọn?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Các thương hiệu đã chọn sẽ bị xoá khỏi trang quản trị.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteBrand.isPending}>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteBrand.isPending}
              onClick={(event) => {
                event.preventDefault();
                confirmBulkDelete();
              }}
            >
              {deleteBrand.isPending && <ButtonSpinner />}
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AdminBulkActionBar
        selectedCount={selectedBrandIds.size}
        itemLabel="thương hiệu"
        isDeleting={deleteBrand.isPending}
        onDeleteSelected={() => setBulkDeleteOpen(true)}
        onDeselectAll={() => setSelectedBrandIds(new Set())}
      />

      {selectedBrandIds.size === 0 && (
        <button
          type="button"
          onClick={openCreate}
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 sm:hidden"
          aria-label="Thêm thương hiệu"
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

const BRAND_EXPORT_COLUMNS: ExcelColumn<Brand>[] = [
  {
    header: "STT",
    accessor: (_brand, index) => index + 1,
  },
  {
    header: "Tên thương hiệu",
    accessor: (brand) => brand.name,
  },
  {
    header: "Slug",
    accessor: (brand) => brand.slug,
  },
  {
    header: "Website",
    accessor: (brand) => brand.website,
  },
  {
    header: "Trạng thái",
    accessor: (brand) => BRAND_STATUS_LABELS[brand.status],
  },
  {
    header: "Thứ tự",
    accessor: (brand) => brand.sort_order,
  },
  {
    header: "Ngày cập nhật",
    accessor: (brand) => formatDate(brand.updated_at),
  },
];

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}
