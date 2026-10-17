import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import type { AxiosError } from "axios";
import { Boxes, ClipboardList, Download, History, PackageCheck, PackageX, PencilLine, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { adminProductApi } from "@/api/admin/product";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { ButtonSpinner } from "@/components/shared/ButtonSpinner";
import { INVENTORY_PAGE_SIZE, LOW_STOCK_THRESHOLD, STOCK_MOVEMENT_LABELS, STOCK_MOVEMENT_OPTIONS } from "@/constants/inventory";
import { useAdminProducts } from "@/hooks/useAdminProducts";
import { useAdjustProductStock, useStockMovements } from "@/hooks/useInventory";
import { wasApiConnectionNotified } from "@/lib/api";
import { formatDateTime } from "@/lib/date-time";
import { exportExcel, type ExcelColumn } from "@/lib/export-excel";
import type { ApiErrorResponse } from "@/types/auth";
import type { AdminStockAdjustmentType, StockMovement, StockMovementType } from "@/types/inventory";
import type { Product } from "@/types/product";

interface InventoryRow {
  id: number;
  productId: number;
  name: string;
  variantName: string | null;
  sku: string;
  stock: number;
  image: string | null;
  brand?: Product["brand"];
  updated_at: string;
}

type StockFilter = "all" | "in_stock" | "low_stock" | "out_of_stock";

interface AdjustmentForm {
  type: AdminStockAdjustmentType;
  quantity: string;
  reference: string;
  note: string;
}

const EMPTY_ADJUSTMENT: AdjustmentForm = {
  type: "import",
  quantity: "",
  reference: "",
  note: "",
};

export default function Inventory() {
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [movementType, setMovementType] = useState<StockMovementType | "all">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [movementPage, setMovementPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<InventoryRow | null>(null);
  const [historyProduct, setHistoryProduct] = useState<InventoryRow | null>(null);
  const [form, setForm] = useState<AdjustmentForm>(EMPTY_ADJUSTMENT);
  const [isExporting, setIsExporting] = useState(false);

  const productsQuery = useAdminProducts({ status: "all", per_page: 100 });
  const movementsQuery = useStockMovements({
    product_variant_id: historyProduct?.id,
    type: movementType,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    page: movementPage,
    per_page: INVENTORY_PAGE_SIZE,
  });
  const adjustStock = useAdjustProductStock();

  const products = useMemo(
    () => flattenProducts(productsQuery.data?.data ?? []),
    [productsQuery.data?.data],
  );
  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase("vi");

    return products.filter((product) => {
      const matchesSearch = !keyword
        || product.name.toLocaleLowerCase("vi").includes(keyword)
        || product.sku.toLocaleLowerCase("vi").includes(keyword);
      const matchesStock = stockFilter === "all"
        || (stockFilter === "out_of_stock" && product.stock === 0)
        || (stockFilter === "low_stock" && product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD)
        || (stockFilter === "in_stock" && product.stock > LOW_STOCK_THRESHOLD);

      return matchesSearch && matchesStock;
    });
  }, [products, search, stockFilter]);

  const stats = useMemo(() => ({
    products: products.length,
    units: products.reduce((total, product) => total + product.stock, 0),
    outOfStock: products.filter((product) => product.stock === 0).length,
    lowStock: products.filter((product) => product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD).length,
  }), [products]);

  const delta = calculateDelta(form);
  const projectedStock = selectedProduct ? selectedProduct.stock + delta : 0;

  const openAdjustment = (product: InventoryRow) => {
    setSelectedProduct(product);
    setForm(EMPTY_ADJUSTMENT);
  };

  const submitAdjustment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedProduct) return;

    const quantity = Number(form.quantity);
    if (!Number.isInteger(quantity) || quantity === 0 || projectedStock < 0) return;

    adjustStock.mutate({
      variantId: selectedProduct.id,
      payload: {
        type: form.type,
        quantity,
        reference: form.reference.trim() || null,
        note: form.note.trim() || null,
      },
    }, {
      onSuccess: () => {
        toast.success("Đã cập nhật tồn kho.");
        setSelectedProduct(null);
        setForm(EMPTY_ADJUSTMENT);
      },
      onError: (error) => {
        if (wasApiConnectionNotified(error)) return;
        toast.error(getApiErrorMessage(error, "Điều chỉnh tồn kho thất bại."));
      },
    });
  };

  const exportInventory = async () => {
    setIsExporting(true);
    try {
      const response = await adminProductApi.getProducts({ status: "all", per_page: 100 });
      await exportExcel({
        rows: flattenProducts(response.data),
        columns: INVENTORY_EXPORT_COLUMNS,
        filename: "maison-inventory",
        sheetName: "Tồn kho",
      });
      toast.success("Đã xuất danh sách tồn kho.");
    } catch (error) {
      if (wasApiConnectionNotified(error)) return;
      toast.error(getApiErrorMessage(error, "Xuất Excel thất bại."));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Quản lý tồn kho</h1>
          <p className="text-sm text-muted-foreground">Theo dõi số lượng và lịch sử biến động kho.</p>
        </div>
        <Button variant="outline" onClick={exportInventory} disabled={isExporting || productsQuery.isLoading}>
          {isExporting ? <ButtonSpinner /> : <Download className="h-4 w-4" />}
          Xuất Excel
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Boxes} label="Tổng phiên bản" value={stats.products} />
        <StatCard icon={PackageCheck} label="Tổng số lượng tồn" value={stats.units} />
        <StatCard icon={PackageX} label="Hết hàng" value={stats.outOfStock} destructive />
        <StatCard icon={ClipboardList} label="Sắp hết" value={stats.lowStock} warning />
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm tên hoặc SKU..." className="md:max-w-sm" />
          <Select value={stockFilter} onValueChange={(value) => setStockFilter(value as StockFilter)}>
            <SelectTrigger className="md:w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="in_stock">Còn hàng</SelectItem>
              <SelectItem value="low_stock">Sắp hết</SelectItem>
              <SelectItem value="out_of_stock">Hết hàng</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="md:ml-auto" onClick={() => productsQuery.refetch()}>
            <RefreshCw className={`h-4 w-4 ${productsQuery.isFetching ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14 text-center">STT</TableHead>
              <TableHead className="w-16">Ảnh</TableHead>
              <TableHead>Sản phẩm</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Thương hiệu</TableHead>
              <TableHead className="text-center">Tồn kho</TableHead>
              <TableHead>Trạng thái kho</TableHead>
              <TableHead>Cập nhật</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productsQuery.isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}><TableCell colSpan={9}><div className="h-10 animate-pulse rounded bg-muted" /></TableCell></TableRow>
              ))
            ) : filteredProducts.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="h-32 text-center text-muted-foreground">Không có sản phẩm phù hợp.</TableCell></TableRow>
            ) : filteredProducts.map((product, index) => (
              <TableRow key={product.id}>
                <TableCell className="text-center text-muted-foreground">{index + 1}</TableCell>
                <TableCell><ProductImage product={product} /></TableCell>
                <TableCell><div className="font-medium">{product.name}</div><div className="text-xs text-muted-foreground">{product.variantName ?? "Phiên bản mặc định"}</div></TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{product.sku ?? "-"}</TableCell>
                <TableCell>{product.brand?.name ?? "-"}</TableCell>
                <TableCell className="text-center font-mono font-semibold">{product.stock}</TableCell>
                <TableCell><StockBadge stock={product.stock} /></TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">{formatDateTime(product.updated_at)}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openAdjustment(product)}>
                      <PencilLine className="h-4 w-4" /> Điều chỉnh
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => { setHistoryProduct(product); setMovementPage(1); }} title="Xem lịch sử">
                      <History className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Lịch sử biến động</h2>
            <p className="text-sm text-muted-foreground">{historyProduct ? `Đang lọc theo ${historyProduct.name}` : "Tất cả sản phẩm"}</p>
          </div>
          <div className="flex gap-2">
            {historyProduct && <Button variant="outline" size="sm" onClick={() => setHistoryProduct(null)}>Bỏ lọc sản phẩm</Button>}
            <Input
              type="date"
              aria-label="Từ ngày"
              value={dateFrom}
              max={dateTo || undefined}
              className="w-36"
              onChange={(event) => { setDateFrom(event.target.value); setMovementPage(1); }}
            />
            <Input
              type="date"
              aria-label="Đến ngày"
              value={dateTo}
              min={dateFrom || undefined}
              className="w-36"
              onChange={(event) => { setDateTo(event.target.value); setMovementPage(1); }}
            />
            <Select value={movementType} onValueChange={(value) => { setMovementType(value as StockMovementType | "all"); setMovementPage(1); }}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                {STOCK_MOVEMENT_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <MovementTable
          movements={movementsQuery.data?.data ?? []}
          isLoading={movementsQuery.isLoading}
          page={movementPage}
          pagination={movementsQuery.data}
          onPageChange={setMovementPage}
        />
      </section>

      <Dialog open={Boolean(selectedProduct)} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Điều chỉnh tồn kho</DialogTitle>
            <DialogDescription>{selectedProduct?.name}</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitAdjustment} className="space-y-4">
            <div className="grid grid-cols-2 gap-3 rounded-md border bg-muted/30 p-3 text-sm">
              <div><span className="text-muted-foreground">Hiện tại</span><div className="text-lg font-semibold">{selectedProduct?.stock ?? 0}</div></div>
              <div><span className="text-muted-foreground">Sau điều chỉnh</span><div className={`text-lg font-semibold ${projectedStock < 0 ? "text-destructive" : ""}`}>{projectedStock}</div></div>
            </div>
            <Field label="Loại thao tác">
              <Select value={form.type} onValueChange={(value) => setForm((current) => ({ ...current, type: value as AdminStockAdjustmentType }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="import">Nhập kho</SelectItem>
                  <SelectItem value="export">Xuất kho</SelectItem>
                  <SelectItem value="adjustment">Điều chỉnh chênh lệch</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label={form.type === "adjustment" ? "Số lượng thay đổi (+/-)" : "Số lượng"}>
              <Input type="number" min={form.type === "adjustment" ? undefined : 1} value={form.quantity} onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))} required />
            </Field>
            <Field label="Mã tham chiếu">
              <Input value={form.reference} onChange={(event) => setForm((current) => ({ ...current, reference: event.target.value }))} placeholder="PN-001" />
            </Field>
            <Field label={`Ghi chú${form.type === "adjustment" ? " *" : ""}`}>
              <Textarea value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} required={form.type === "adjustment"} />
            </Field>
            {projectedStock < 0 && <p className="text-sm text-destructive">Số lượng xuất vượt quá tồn kho hiện tại.</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSelectedProduct(null)}>Huỷ</Button>
              <Button type="submit" disabled={adjustStock.isPending || !form.quantity || projectedStock < 0}>
                {adjustStock.isPending && <ButtonSpinner />} Xác nhận
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MovementTable({ movements, isLoading, page, pagination, onPageChange }: {
  movements: StockMovement[];
  isLoading: boolean;
  page: number;
  pagination?: { current_page: number; last_page: number; total: number; from: number | null; to: number | null };
  onPageChange: (page: number) => void;
}) {
  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader><TableRow><TableHead>Thời gian</TableHead><TableHead>Sản phẩm</TableHead><TableHead>Loại</TableHead><TableHead className="text-center">Thay đổi</TableHead><TableHead>Tồn trước → sau</TableHead><TableHead>Tham chiếu</TableHead><TableHead>Người thực hiện</TableHead><TableHead>Ghi chú</TableHead></TableRow></TableHeader>
        <TableBody>
          {isLoading ? Array.from({ length: 4 }).map((_, index) => <TableRow key={index}><TableCell colSpan={8}><div className="h-8 animate-pulse rounded bg-muted" /></TableCell></TableRow>)
            : movements.length === 0 ? <TableRow><TableCell colSpan={8} className="h-28 text-center text-muted-foreground">Chưa có lịch sử biến động kho.</TableCell></TableRow>
              : movements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{formatDateTime(movement.created_at)}</TableCell>
                  <TableCell><div className="font-medium">{movement.product?.name ?? `#${movement.product_id}`}</div><div className="font-mono text-xs text-muted-foreground">{movement.variant?.sku ?? "-"}</div></TableCell>
                  <TableCell>{STOCK_MOVEMENT_LABELS[movement.type]}</TableCell>
                  <TableCell className={`text-center font-mono font-semibold ${movement.quantity > 0 ? "text-emerald-700" : "text-destructive"}`}>{movement.quantity > 0 ? "+" : ""}{movement.quantity}</TableCell>
                  <TableCell className="font-mono">{movement.stock_before} → {movement.stock_after}</TableCell>
                  <TableCell className="font-mono text-xs">{movement.order?.order_code ?? movement.reference ?? "-"}</TableCell>
                  <TableCell>{movement.user?.full_name ?? "Hệ thống"}</TableCell>
                  <TableCell className="max-w-64 truncate text-muted-foreground">{movement.note ?? "-"}</TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
        <span>Hiển thị {pagination?.from ?? 0}-{pagination?.to ?? 0} trong {pagination?.total ?? 0} biến động</span>
        <div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Trước</Button><Button variant="outline" size="sm" disabled={page >= (pagination?.last_page ?? 1)} onClick={() => onPageChange(page + 1)}>Sau</Button></div>
      </div>
    </Card>
  );
}

function StatCard({ icon: Icon, label, value, destructive, warning }: { icon: typeof Boxes; label: string; value: number; destructive?: boolean; warning?: boolean }) {
  return <Card className="flex items-center gap-3 p-4"><div className={`grid h-10 w-10 place-items-center rounded-md ${destructive ? "bg-destructive/10 text-destructive" : warning ? "bg-amber-100 text-amber-700" : "bg-primary/10 text-primary"}`}><Icon className="h-5 w-5" /></div><div><p className="text-sm text-muted-foreground">{label}</p><p className="text-xl font-semibold">{value}</p></div></Card>;
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return <Badge variant="destructive">Hết hàng</Badge>;
  if (stock <= LOW_STOCK_THRESHOLD) return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Sắp hết</Badge>;
  return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Còn hàng</Badge>;
}

function ProductImage({ product }: { product: InventoryRow }) {
  return product.image ? <img src={product.image} alt={product.name} className="h-10 w-10 rounded-md border object-cover" /> : <div className="grid h-10 w-10 place-items-center rounded-md border bg-muted"><Boxes className="h-4 w-4 text-muted-foreground" /></div>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}

function calculateDelta(form: AdjustmentForm) {
  const quantity = Number(form.quantity);
  if (!Number.isFinite(quantity)) return 0;
  if (form.type === "import") return Math.abs(quantity);
  if (form.type === "export") return -Math.abs(quantity);
  return quantity;
}

function getApiErrorMessage(error: unknown, fallback: string) {
  const err = error as AxiosError<ApiErrorResponse>;
  const errors = err.response?.data?.errors as Record<string, string[]> | undefined;
  return (errors ? Object.values(errors).flat().find(Boolean) : undefined) ?? err.response?.data?.message ?? err.message ?? fallback;
}

function stockStatus(product: InventoryRow) {
  if (product.stock === 0) return "Hết hàng";
  if (product.stock <= LOW_STOCK_THRESHOLD) return "Sắp hết";
  return "Còn hàng";
}

const INVENTORY_EXPORT_COLUMNS: ExcelColumn<InventoryRow>[] = [
  { header: "Sản phẩm", accessor: (product) => product.name },
  { header: "Phiên bản", accessor: (product) => product.variantName },
  { header: "SKU", accessor: (product) => product.sku },
  { header: "Thương hiệu", accessor: (product) => product.brand?.name },
  { header: "Tồn kho", accessor: (product) => product.stock },
  { header: "Trạng thái kho", accessor: stockStatus },
  { header: "Cập nhật gần nhất", accessor: (product) => formatDateTime(product.updated_at, "") },
];

function flattenProducts(products: Product[]): InventoryRow[] {
  return products.flatMap((product) => product.variants.map((variant) => ({
    id: variant.id,
    productId: product.id,
    name: product.name,
    variantName: variant.name,
    sku: variant.sku,
    stock: variant.stock,
    image: product.image,
    brand: product.brand,
    updated_at: variant.updated_at ?? product.updated_at,
  })));
}
