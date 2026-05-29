import { useEffect, useMemo, useState } from "react";
import type { AxiosError } from "axios";
import { Download, Package, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { adminProductApi } from "@/api/admin/product";
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
import { ProductFilters } from "@/components/admin/products/ProductFilters";
import { ProductFormSheet } from "@/components/admin/products/ProductFormSheet";
import { ProductTable } from "@/components/admin/products/ProductTable";
import { AdminBulkActionBar } from "@/components/admin/shared/AdminBulkActionBar";
import { ButtonSpinner } from "@/components/shared/ButtonSpinner";
import {
  PRODUCT_GENDER_LABELS,
  PRODUCT_PAGE_SIZE,
  PRODUCT_STATUS_LABELS,
} from "@/constants/product";
import { useAdminBrands } from "@/hooks/useAdminBrands";
import { useAdminCategories } from "@/hooks/useAdminCategories";
import { useAdminProducts, useDeleteProduct } from "@/hooks/useAdminProducts";
import { wasApiConnectionNotified } from "@/lib/api";
import { formatDateTime } from "@/lib/date-time";
import { exportExcel, type ExcelColumn } from "@/lib/export-excel";
import type { ApiErrorResponse } from "@/types/auth";
import type {
  Product,
  ProductFeaturedFilter,
  ProductGenderFilter,
  ProductListParams,
  ProductListStatusFilter,
} from "@/types/product";

export default function Products() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<ProductListStatusFilter>("all");
  const [gender, setGender] = useState<ProductGenderFilter>("all");
  const [brandId, setBrandId] = useState<number | "all">("all");
  const [categoryId, setCategoryId] = useState<number | "all">("all");
  const [isFeatured, setIsFeatured] = useState<ProductFeaturedFilter>("all");
  const [page, setPage] = useState(1);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<number>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const deleteProduct = useDeleteProduct();

  const listParams = useMemo<ProductListParams>(() => ({
    search: debouncedSearch,
    status,
    gender,
    brand_id: brandId,
    category_id: categoryId,
    is_featured: isFeatured,
    page,
    per_page: PRODUCT_PAGE_SIZE,
  }), [brandId, categoryId, debouncedSearch, gender, isFeatured, page, status]);

  const productsQuery = useAdminProducts(listParams);
  const brandsQuery = useAdminBrands({ status: "all", per_page: 100 });
  const categoriesQuery = useAdminCategories({ status: "all", per_page: 100 });

  const products = productsQuery.data?.data ?? [];
  const brands = brandsQuery.data?.data ?? [];
  const categories = categoriesQuery.data?.data ?? [];
  const hasFilters = Boolean(debouncedSearch.trim())
    || status !== "all"
    || gender !== "all"
    || brandId !== "all"
    || categoryId !== "all"
    || isFeatured !== "all";

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    setPage(1);
    setSelectedProductIds(new Set());
  }, [brandId, categoryId, debouncedSearch, gender, isFeatured, status]);

  const openCreate = () => {
    setEditingProduct(null);
    setSheetOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setSheetOpen(true);
  };

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setStatus("all");
    setGender("all");
    setBrandId("all");
    setCategoryId("all");
    setIsFeatured("all");
  };

  const confirmDelete = () => {
    if (!deletingProduct) return;

    deleteProduct.mutate(deletingProduct.id, {
      onSuccess: () => {
        toast.success("Đã xoá sản phẩm.");
        setDeletingProduct(null);
        setSelectedProductIds((current) => {
          const next = new Set(current);
          next.delete(deletingProduct.id);
          return next;
        });
        if (products.length === 1 && page > 1) {
          setPage((current) => current - 1);
        }
      },
      onError: (error) => {
        if (wasApiConnectionNotified(error)) return;
        toast.error(getApiErrorMessage(error, "Xoá sản phẩm thất bại."));
      },
    });
  };

  const confirmBulkDelete = async () => {
    const ids = Array.from(selectedProductIds);
    if (ids.length === 0) return;

    try {
      await Promise.all(ids.map((id) => deleteProduct.mutateAsync(id)));
      toast.success(`Đã xoá ${ids.length} sản phẩm.`);
      setSelectedProductIds(new Set());
      setBulkDeleteOpen(false);
      if (ids.length >= products.length && page > 1) {
        setPage((current) => current - 1);
      }
    } catch (error) {
      if (wasApiConnectionNotified(error)) return;
      toast.error(getApiErrorMessage(error, "Xoá sản phẩm đã chọn thất bại."));
    }
  };

  const exportProducts = async () => {
    setIsExporting(true);

    try {
      const response = await adminProductApi.getProducts({
        search: debouncedSearch,
        status,
        gender,
        brand_id: brandId,
        category_id: categoryId,
        is_featured: isFeatured,
        per_page: 100,
      });

      if (response.data.length === 0) {
        toast.error("Không có sản phẩm để xuất.");
        return;
      }

      await exportExcel({
        rows: response.data,
        columns: PRODUCT_EXPORT_COLUMNS,
        filename: "maison-products",
        sheetName: "Sản phẩm",
      });

      toast.success("Đã xuất file Excel sản phẩm.");
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
          <h1 className="text-2xl font-semibold text-foreground">Sản phẩm</h1>
          <p className="text-sm text-muted-foreground">
            {productsQuery.data?.total ?? 0} sản phẩm
          </p>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <Button
            variant="outline"
            onClick={exportProducts}
            disabled={isExporting || productsQuery.isLoading}
            className="gap-1.5"
          >
            {isExporting ? <ButtonSpinner /> : <Download className="h-4 w-4" />}
            Xuất Excel
          </Button>
          <Button onClick={openCreate} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Thêm sản phẩm
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <ProductFilters
          search={search}
          status={status}
          gender={gender}
          brandId={brandId}
          categoryId={categoryId}
          isFeatured={isFeatured}
          brands={brands}
          categories={categories}
          isFetching={productsQuery.isFetching || brandsQuery.isFetching || categoriesQuery.isFetching}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
          onGenderChange={setGender}
          onBrandChange={setBrandId}
          onCategoryChange={setCategoryId}
          onFeaturedChange={setIsFeatured}
          onClear={clearFilters}
          onRefresh={() => {
            productsQuery.refetch();
            brandsQuery.refetch();
            categoriesQuery.refetch();
          }}
        />
      </Card>

      {productsQuery.isError ? (
        <div className="flex flex-col items-center justify-center rounded-md border border-border bg-white px-4 py-14 text-center">
          <Package className="mb-3 h-10 w-10 text-muted-foreground/50" strokeWidth={1.5} />
          <h3 className="text-base font-semibold text-foreground">Không thể tải sản phẩm</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {getApiErrorMessage(productsQuery.error, "Vui lòng thử lại sau.")}
          </p>
          <Button className="mt-4" onClick={() => productsQuery.refetch()}>
            <RefreshCw className="h-4 w-4" />
            Thử lại
          </Button>
        </div>
      ) : (
        <ProductTable
          products={products}
          pagination={productsQuery.data}
          isLoading={productsQuery.isLoading}
          hasFilters={hasFilters}
          currentPage={page}
          isFetching={productsQuery.isFetching}
          selectedIds={selectedProductIds}
          onPageChange={(nextPage) => {
            setSelectedProductIds(new Set());
            setPage(nextPage);
          }}
          onCreate={openCreate}
          onEdit={openEdit}
          onDelete={setDeletingProduct}
          onSelectedChange={setSelectedProductIds}
        />
      )}

      <ProductFormSheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) setEditingProduct(null);
        }}
        product={editingProduct}
        brands={brands}
        categories={categories}
      />

      <AlertDialog open={Boolean(deletingProduct)} onOpenChange={(open) => !open && setDeletingProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá sản phẩm {deletingProduct?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Sản phẩm sẽ bị xoá khỏi trang quản trị.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteProduct.isPending}>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteProduct.isPending}
              onClick={(event) => {
                event.preventDefault();
                confirmDelete();
              }}
            >
              {deleteProduct.isPending && <ButtonSpinner />}
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá {selectedProductIds.size} sản phẩm đã chọn?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Các sản phẩm đã chọn sẽ bị xoá khỏi trang quản trị.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteProduct.isPending}>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteProduct.isPending}
              onClick={(event) => {
                event.preventDefault();
                confirmBulkDelete();
              }}
            >
              {deleteProduct.isPending && <ButtonSpinner />}
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AdminBulkActionBar
        selectedCount={selectedProductIds.size}
        itemLabel="sản phẩm"
        isDeleting={deleteProduct.isPending}
        onDeleteSelected={() => setBulkDeleteOpen(true)}
        onDeselectAll={() => setSelectedProductIds(new Set())}
      />

      {selectedProductIds.size === 0 && (
        <button
          type="button"
          onClick={openCreate}
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 sm:hidden"
          aria-label="Thêm sản phẩm"
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

function formatMoney(value: string | number | null) {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

const PRODUCT_EXPORT_COLUMNS: ExcelColumn<Product>[] = [
  {
    header: "STT",
    accessor: (_product, index) => index + 1,
  },
  {
    header: "Tên sản phẩm",
    accessor: (product) => product.name,
  },
  {
    header: "SKU",
    accessor: (product) => product.sku,
  },
  {
    header: "Slug",
    accessor: (product) => product.slug,
  },
  {
    header: "Thương hiệu",
    accessor: (product) => product.brand?.name,
  },
  {
    header: "Danh mục",
    accessor: (product) => product.category?.name,
  },
  {
    header: "Giới tính",
    accessor: (product) => PRODUCT_GENDER_LABELS[product.gender],
  },
  {
    header: "Giá bán",
    accessor: (product) => formatMoney(product.price),
  },
  {
    header: "Giá khuyến mãi",
    accessor: (product) => product.sale_price ? formatMoney(product.sale_price) : "",
  },
  {
    header: "Tồn kho",
    accessor: (product) => product.stock,
  },
  {
    header: "Trạng thái",
    accessor: (product) => PRODUCT_STATUS_LABELS[product.status],
  },
  {
    header: "Nổi bật",
    accessor: (product) => product.is_featured ? "Có" : "Không",
  },
  {
    header: "Thứ tự",
    accessor: (product) => product.sort_order,
  },
  {
    header: "Ngày cập nhật",
    accessor: (product) => formatDateTime(product.updated_at, ""),
  },
];
