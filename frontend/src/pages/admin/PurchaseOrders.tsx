import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import type { AxiosError } from "axios";
import {
  ClipboardList,
  Download,
  Eye,
  PackageCheck,
  Pencil,
  Plus,
  Send,
  Trash2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { adminPurchaseOrderApi } from "@/api/admin/purchase-order";
import {
  PURCHASE_ORDER_PAGE_SIZE,
  PURCHASE_ORDER_STATUS_LABELS,
  PURCHASE_ORDER_STATUS_OPTIONS,
} from "@/constants/purchase-order";
import { useAdminProducts } from "@/hooks/useAdminProducts";
import {
  useCreatePurchaseOrder,
  useDeletePurchaseOrder,
  usePurchaseOrders,
  usePurchaseOrderSummary,
  useUpdatePurchaseOrder,
  useUpdatePurchaseOrderStatus,
} from "@/hooks/usePurchaseOrders";
import { useSuppliers } from "@/hooks/useSuppliers";
import { wasApiConnectionNotified } from "@/lib/api";
import { formatDateTime } from "@/lib/date-time";
import { exportExcel, type ExcelColumn } from "@/lib/export-excel";
import { formatVnd } from "@/lib/product-utils";
import { purchaseOrderSchema } from "@/schemas/admin/purchase-order";
import type { ApiErrorResponse } from "@/types/auth";
import type { Product } from "@/types/product";
import type {
  PurchaseOrder,
  PurchaseOrderListParams,
  PurchaseOrderPayload,
  PurchaseOrderStatus,
} from "@/types/purchase-order";

type FormItem = {
  product_id: number | "";
  product_variant_id: number | "";
  quantity: number;
  unit_cost: number;
};
type FormState = {
  supplier_id: number | "";
  discount: number;
  shipping_fee: number;
  reference: string;
  note: string;
  items: FormItem[];
};
const EMPTY: FormState = {
  supplier_id: "",
  discount: 0,
  shipping_fee: 0,
  reference: "",
  note: "",
  items: [
    { product_id: "", product_variant_id: "", quantity: 1, unit_cost: 0 },
  ],
};

export default function PurchaseOrders() {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<PurchaseOrderStatus | "all">("all");
  const [supplierId, setSupplierId] = useState<number | "all">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PurchaseOrder | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [detail, setDetail] = useState<PurchaseOrder | null>(null);
  const [confirmStatus, setConfirmStatus] =
    useState<PurchaseOrderStatus | null>(null);
  const [deleting, setDeleting] = useState<PurchaseOrder | null>(null);
  const params = useMemo<PurchaseOrderListParams>(
    () => ({
      search: debounced,
      status,
      supplier_id: supplierId,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      page,
      per_page: PURCHASE_ORDER_PAGE_SIZE,
    }),
    [debounced, status, supplierId, dateFrom, dateTo, page],
  );
  const query = usePurchaseOrders(params);
  const summary = usePurchaseOrderSummary();
  const suppliers = useSuppliers({ status: "active", per_page: 100 });
  const products = useAdminProducts({ status: "all", per_page: 100 });
  const create = useCreatePurchaseOrder();
  const update = useUpdatePurchaseOrder();
  const changeStatus = useUpdatePurchaseOrderStatus();
  const remove = useDeletePurchaseOrder();
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(search.trim()), 300);
    return () => window.clearTimeout(id);
  }, [search]);
  useEffect(
    () => setPage(1),
    [debounced, status, supplierId, dateFrom, dateTo],
  );
  const productList = products.data?.data ?? [];
  const supplierList = suppliers.data?.data ?? [];
  const subtotal = form.items.reduce(
    (sum, item) =>
      sum + Number(item.quantity || 0) * Number(item.unit_cost || 0),
    0,
  );
  const total = Math.max(
    0,
    subtotal - Number(form.discount || 0) + Number(form.shipping_fee || 0),
  );

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setFormOpen(true);
  };
  const openEdit = (po: PurchaseOrder) => {
    setEditing(po);
    setForm({
      supplier_id: po.supplier_id,
      discount: Number(po.discount),
      shipping_fee: Number(po.shipping_fee),
      reference: po.reference ?? "",
      note: po.note ?? "",
      items: po.items.map((i) => ({
        product_id: i.product_id,
        product_variant_id: i.product_variant_id,
        quantity: i.quantity,
        unit_cost: Number(i.unit_cost),
      })),
    });
    setFormOpen(true);
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const parsed = purchaseOrderSchema.safeParse(form);
    if (!parsed.success)
      return toast.error(
        parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.",
      );
    if (form.discount > subtotal)
      return toast.error("Chiết khấu không được vượt quá tạm tính.");
    const payload = parsed.data as PurchaseOrderPayload;
    const options = {
      onSuccess: () => {
        toast.success(
          editing ? "Đã cập nhật phiếu nhập." : "Đã tạo phiếu nhập.",
        );
        setFormOpen(false);
      },
      onError: errorToast,
    };
    if (editing) {
      update.mutate({ id: editing.id, payload }, options);
    } else {
      create.mutate(payload, options);
    }
  };
  const performStatus = () => {
    if (!detail || !confirmStatus) return;
    changeStatus.mutate(
      { id: detail.id, status: confirmStatus },
      {
        onSuccess: (po) => {
          toast.success(
            confirmStatus === "received"
              ? "Đã nhận hàng và cập nhật tồn kho."
              : "Đã cập nhật trạng thái.",
          );
          setDetail(po);
          setConfirmStatus(null);
        },
        onError: errorToast,
      },
    );
  };
  const exportRows = async () => {
    const result = await adminPurchaseOrderApi.list({
      ...params,
      page: 1,
      per_page: 100,
    });
    await exportExcel({
      rows: result.data,
      columns: EXPORT_COLUMNS,
      filename: "maison-purchase-orders",
      sheetName: "Phiếu nhập",
    });
    toast.success("Đã xuất danh sách phiếu nhập.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Phiếu nhập hàng</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý nguồn hàng và ghi nhận nhập kho.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportRows}>
            <Download className="h-4 w-4" />
            Xuất Excel
          </Button>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Tạo phiếu nhập
          </Button>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Stat label="Tổng phiếu" value={summary.data?.total ?? 0} />
        <Stat label="Phiếu nháp" value={summary.data?.draft ?? 0} />
        <Stat label="Đã đặt hàng" value={summary.data?.ordered ?? 0} />
        <Stat label="Đã nhận" value={summary.data?.received ?? 0} />
        <Stat
          label="Giá trị đã nhận"
          value={formatVnd(summary.data?.received_value ?? 0)}
        />
      </div>
      <Card className="grid gap-3 p-4 md:grid-cols-3 xl:grid-cols-6">
        <Input
          placeholder="Tìm mã phiếu/reference..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          value={String(supplierId)}
          onValueChange={(v) => setSupplierId(v === "all" ? "all" : Number(v))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Nhà cung cấp" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả nhà cung cấp</SelectItem>
            {supplierList.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={status}
          onValueChange={(v) => setStatus(v as PurchaseOrderStatus | "all")}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            {PURCHASE_ORDER_STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
        <Input
          type="date"
          value={dateTo}
          min={dateFrom || undefined}
          onChange={(e) => setDateTo(e.target.value)}
        />
        <Button
          variant="outline"
          onClick={() => {
            setSearch("");
            setStatus("all");
            setSupplierId("all");
            setDateFrom("");
            setDateTo("");
          }}
        >
          Xoá lọc
        </Button>
      </Card>
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã phiếu</TableHead>
              <TableHead>Nhà cung cấp</TableHead>
              <TableHead className="text-center">Sản phẩm</TableHead>
              <TableHead className="text-center">Số lượng</TableHead>
              <TableHead>Tổng tiền</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Người tạo</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="h-28 text-center">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : (query.data?.data ?? []).length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="h-28 text-center text-muted-foreground"
                >
                  Không có phiếu nhập.
                </TableCell>
              </TableRow>
            ) : (
              query.data!.data.map((po) => (
                <TableRow key={po.id}>
                  <TableCell className="font-mono font-medium">
                    {po.code}
                  </TableCell>
                  <TableCell>{po.supplier?.name}</TableCell>
                  <TableCell className="text-center">
                    {po.items_count ?? po.items.length}
                  </TableCell>
                  <TableCell className="text-center">
                    {Number(
                      po.total_quantity ??
                        po.items.reduce((s, i) => s + i.quantity, 0),
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatVnd(po.total)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={po.status} />
                  </TableCell>
                  <TableCell>{formatDateTime(po.created_at)}</TableCell>
                  <TableCell>{po.creator?.full_name ?? "-"}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Xem"
                        onClick={() => setDetail(po)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {po.status === "draft" && (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Sửa"
                            onClick={() => openEdit(po)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Xoá"
                            onClick={() => setDeleting(po)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="flex justify-end gap-2 border-t p-3">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Trước
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= (query.data?.last_page ?? 1)}
            onClick={() => setPage(page + 1)}
          >
            Sau
          </Button>
        </div>
      </Card>

      <Sheet open={formOpen} onOpenChange={setFormOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-3xl">
          <SheetHeader>
            <SheetTitle>
              {editing ? `Sửa ${editing.code}` : "Tạo phiếu nhập"}
            </SheetTitle>
            <SheetDescription>
              Phiếu nháp chưa làm thay đổi tồn kho.
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={submit} className="mt-6 space-y-5">
            <Field label="Nhà cung cấp *">
              <Select
                value={form.supplier_id ? String(form.supplier_id) : undefined}
                onValueChange={(v) =>
                  setForm({ ...form, supplier_id: Number(v) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn nhà cung cấp" />
                </SelectTrigger>
                <SelectContent>
                  {supplierList.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.code} - {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Sản phẩm *</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setForm({
                      ...form,
                      items: [
                        ...form.items,
                        { product_id: "", product_variant_id: "", quantity: 1, unit_cost: 0 },
                      ],
                    })
                  }
                >
                  <Plus className="h-4 w-4" />
                  Thêm dòng
                </Button>
              </div>
              {form.items.map((item, index) => (
                <ItemRow
                  key={index}
                  item={item}
                  products={productList}
                  selected={form.items.map((i) => i.product_variant_id)}
                  onChange={(next) =>
                    setForm({
                      ...form,
                      items: form.items.map((value, i) =>
                        i === index ? next : value,
                      ),
                    })
                  }
                  onRemove={() =>
                    setForm({
                      ...form,
                      items: form.items.filter((_, i) => i !== index),
                    })
                  }
                />
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Chiết khấu">
                <Input
                  type="number"
                  min={0}
                  value={form.discount}
                  onChange={(e) =>
                    setForm({ ...form, discount: Number(e.target.value) })
                  }
                />
              </Field>
              <Field label="Phí vận chuyển">
                <Input
                  type="number"
                  min={0}
                  value={form.shipping_fee}
                  onChange={(e) =>
                    setForm({ ...form, shipping_fee: Number(e.target.value) })
                  }
                />
              </Field>
              <Field label="Mã tham chiếu">
                <Input
                  value={form.reference}
                  onChange={(e) =>
                    setForm({ ...form, reference: e.target.value })
                  }
                />
              </Field>
              <Field label="Ghi chú">
                <Textarea
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                />
              </Field>
            </div>
            <div className="rounded-md border p-4 text-sm">
              <MoneyRow label="Tạm tính" value={subtotal} />
              <MoneyRow label="Chiết khấu" value={-form.discount} />
              <MoneyRow label="Phí vận chuyển" value={form.shipping_fee} />
              <div className="mt-2 border-t pt-2">
                <MoneyRow label="Tổng cộng" value={total} strong />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
              >
                Huỷ
              </Button>
              <Button disabled={create.isPending || update.isPending}>
                Lưu phiếu nháp
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <Sheet open={Boolean(detail)} onOpenChange={(v) => !v && setDetail(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          {detail && (
            <>
              <SheetHeader>
                <SheetTitle>{detail.code}</SheetTitle>
                <SheetDescription>
                  {detail.supplier.name} · {formatDateTime(detail.created_at)}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-5">
                <div className="flex items-center justify-between">
                  <StatusBadge status={detail.status} />
                  <span className="text-sm text-muted-foreground">
                    Người tạo: {detail.creator?.full_name ?? "-"}
                  </span>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead className="text-center">SL</TableHead>
                      <TableHead>Giá nhập</TableHead>
                      <TableHead>Thành tiền</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.items.map((i) => (
                      <TableRow key={i.id}>
                        <TableCell>
                          <div className="font-medium">{i.product_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {[i.variant_name, i.concentration, i.volume_ml ? `${i.volume_ml}ml` : null].filter(Boolean).join(" · ")} · {i.sku ?? "-"} · Tồn: {i.variant?.stock ?? "-"}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {i.quantity}
                        </TableCell>
                        <TableCell>{formatVnd(i.unit_cost)}</TableCell>
                        <TableCell>{formatVnd(i.line_total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="rounded-md border p-4">
                  <MoneyRow label="Tạm tính" value={Number(detail.subtotal)} />
                  <MoneyRow
                    label="Chiết khấu"
                    value={-Number(detail.discount)}
                  />
                  <MoneyRow
                    label="Phí vận chuyển"
                    value={Number(detail.shipping_fee)}
                  />
                  <div className="mt-2 border-t pt-2">
                    <MoneyRow
                      label="Tổng cộng"
                      value={Number(detail.total)}
                      strong
                    />
                  </div>
                </div>
                {detail.reference && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Tham chiếu:</span>{" "}
                    {detail.reference}
                  </p>
                )}
                {detail.note && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Ghi chú:</span>{" "}
                    {detail.note}
                  </p>
                )}
                <div className="flex justify-end gap-2">
                  {detail.status === "draft" && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setDetail(null);
                          openEdit(detail);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                        Sửa
                      </Button>
                      <Button onClick={() => setConfirmStatus("ordered")}>
                        <Send className="h-4 w-4" />
                        Đã đặt hàng
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => setConfirmStatus("cancelled")}
                      >
                        <XCircle className="h-4 w-4" />
                        Huỷ phiếu
                      </Button>
                    </>
                  )}
                  {detail.status === "ordered" && (
                    <>
                      <Button onClick={() => setConfirmStatus("received")}>
                        <PackageCheck className="h-4 w-4" />
                        Xác nhận đã nhận
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => setConfirmStatus("cancelled")}
                      >
                        <XCircle className="h-4 w-4" />
                        Huỷ phiếu
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
      <Dialog
        open={Boolean(confirmStatus)}
        onOpenChange={(v) => !v && setConfirmStatus(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận cập nhật trạng thái?</DialogTitle>
            <DialogDescription>
              {confirmStatus === "received"
                ? "Tồn kho sẽ được tăng theo từng dòng sản phẩm và không thể xác nhận nhận hàng lần hai."
                : "Trạng thái phiếu nhập sẽ được cập nhật."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmStatus(null)}>
              Quay lại
            </Button>
            <Button
              variant={
                confirmStatus === "cancelled" ? "destructive" : "default"
              }
              onClick={performStatus}
              disabled={changeStatus.isPending}
            >
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={Boolean(deleting)}
        onOpenChange={(v) => !v && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá phiếu nháp?</AlertDialogTitle>
            <AlertDialogDescription>
              Thao tác này không ảnh hưởng đến tồn kho.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleting &&
                remove.mutate(deleting.id, {
                  onSuccess: () => {
                    toast.success("Đã xoá phiếu nhập.");
                    setDeleting(null);
                  },
                  onError: errorToast,
                })
              }
            >
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ItemRow({
  item,
  products,
  selected,
  onChange,
  onRemove,
}: {
  item: FormItem;
  products: Product[];
  selected: Array<number | "">;
  onChange: (item: FormItem) => void;
  onRemove: () => void;
}) {
  const options = products.flatMap((product) => product.variants.map((variant) => ({ product, variant })));
  const selectedOption = options.find(({ variant }) => variant.id === item.product_variant_id);
  return (
    <div className="grid items-end gap-2 rounded-md border p-3 sm:grid-cols-[1fr_90px_140px_120px_36px]">
      <Field label="Phiên bản sản phẩm">
        <Select
          value={item.product_variant_id ? String(item.product_variant_id) : undefined}
          onValueChange={(v) => {
            const option = options.find(({ variant }) => variant.id === Number(v));
            if (option) onChange({ ...item, product_id: option.product.id, product_variant_id: option.variant.id });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn sản phẩm" />
          </SelectTrigger>
          <SelectContent>
            {options.map(({ product, variant }) => (
              <SelectItem
                key={variant.id}
                value={String(variant.id)}
                disabled={selected.includes(variant.id) && variant.id !== item.product_variant_id}
              >
                {product.name} - {variant.name ?? variant.sku}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          SKU: {selectedOption?.variant.sku ?? "-"} · Tồn: {selectedOption?.variant.stock ?? "-"}
        </p>
      </Field>
      <Field label="Số lượng">
        <Input
          type="number"
          min={1}
          value={item.quantity}
          onChange={(e) =>
            onChange({ ...item, quantity: Number(e.target.value) })
          }
        />
      </Field>
      <Field label="Giá nhập">
        <Input
          type="number"
          min={0}
          value={item.unit_cost}
          onChange={(e) =>
            onChange({ ...item, unit_cost: Number(e.target.value) })
          }
        />
      </Field>
      <div className="pb-2 text-right text-sm font-medium">
        {formatVnd(item.quantity * item.unit_cost)}
      </div>
      <Button type="button" size="icon" variant="ghost" onClick={onRemove}>
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <Card className="p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </Card>
  );
}
function MoneyRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: number;
  strong?: boolean;
}) {
  return (
    <div
      className={`flex justify-between py-1 ${strong ? "font-semibold" : ""}`}
    >
      <span>{label}</span>
      <span>{formatVnd(value)}</span>
    </div>
  );
}
function StatusBadge({ status }: { status: PurchaseOrderStatus }) {
  const variant =
    status === "cancelled"
      ? "destructive"
      : status === "received"
        ? "default"
        : "secondary";
  return (
    <Badge variant={variant}>{PURCHASE_ORDER_STATUS_LABELS[status]}</Badge>
  );
}
function errorToast(error: unknown) {
  if (wasApiConnectionNotified(error)) return;
  const e = error as AxiosError<ApiErrorResponse>;
  const errors = e.response?.data?.errors as
    Record<string, string[]> | undefined;
  toast.error(
    (errors && Object.values(errors).flat()[0]) ||
      e.response?.data?.message ||
      "Thao tác thất bại.",
  );
}
const EXPORT_COLUMNS: ExcelColumn<PurchaseOrder>[] = [
  { header: "Mã phiếu", accessor: (r) => r.code },
  { header: "Nhà cung cấp", accessor: (r) => r.supplier?.name },
  { header: "Số sản phẩm", accessor: (r) => r.items_count ?? r.items.length },
  { header: "Tổng số lượng", accessor: (r) => r.total_quantity ?? 0 },
  { header: "Tổng tiền", accessor: (r) => Number(r.total) },
  {
    header: "Trạng thái",
    accessor: (r) => PURCHASE_ORDER_STATUS_LABELS[r.status],
  },
  { header: "Ngày tạo", accessor: (r) => formatDateTime(r.created_at) },
];
