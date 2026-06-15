import { useEffect, useMemo, useState } from "react";
import type { AxiosError } from "axios";
import { Check, Download, Eye, MoreVertical, RefreshCw, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { adminOrderApi } from "@/api/admin/order";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/admin/ui/input";
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
import { ButtonSpinner } from "@/components/shared/ButtonSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/skeletons/TableSkeleton";
import {
  ORDER_NEXT_STATUS,
  ORDER_PAGE_SIZE,
  ORDER_STATUS_BADGE_CLASS,
  ORDER_STATUS_FILTER_OPTIONS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_OPTIONS,
  PAYMENT_METHOD_FILTER_OPTIONS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_BADGE_CLASS,
  PAYMENT_STATUS_FILTER_OPTIONS,
  PAYMENT_STATUS_LABELS,
} from "@/constants/order";
import { useAdminOrder, useAdminOrders, useDeleteOrder, useUpdateOrderStatus } from "@/hooks/useAdminOrders";
import { wasApiConnectionNotified } from "@/lib/api";
import { formatAddressParts } from "@/lib/address-format";
import { formatDateTime } from "@/lib/date-time";
import { exportExcel, type ExcelColumn } from "@/lib/export-excel";
import { formatVnd } from "@/lib/product-utils";
import type { ApiErrorResponse } from "@/types/auth";
import type {
  Order,
  OrderListParams,
  OrderStatus,
  OrderStatusFilter,
  PaymentMethodFilter,
  PaymentStatusFilter,
} from "@/types/order";

export default function Orders() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<OrderStatusFilter>("all");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusFilter>("all");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodFilter>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [detailOrderId, setDetailOrderId] = useState<number | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);
  const [pendingCancelStatus, setPendingCancelStatus] = useState<OrderStatus | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const listParams = useMemo<OrderListParams>(() => ({
    search: debouncedSearch,
    status,
    payment_status: paymentStatus,
    payment_method: paymentMethod,
    date_from: dateFrom,
    date_to: dateTo,
    page,
    per_page: ORDER_PAGE_SIZE,
  }), [dateFrom, dateTo, debouncedSearch, page, paymentMethod, paymentStatus, status]);

  const ordersQuery = useAdminOrders(listParams);
  const detailQuery = useAdminOrder(detailOrderId ?? undefined);
  const updateOrderStatus = useUpdateOrderStatus();
  const deleteOrder = useDeleteOrder();

  const orders = ordersQuery.data?.data ?? [];
  const pagination = ordersQuery.data;
  const detailOrder = detailQuery.data;
  const hasFilters = Boolean(debouncedSearch || status !== "all" || paymentStatus !== "all" || paymentMethod !== "all" || dateFrom || dateTo);
  const allSelected = orders.length > 0 && orders.every((order) => selectedIds.has(order.id));
  const someSelected = orders.some((order) => selectedIds.has(order.id));

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    setPage(1);
    setSelectedIds(new Set());
  }, [dateFrom, dateTo, debouncedSearch, paymentMethod, paymentStatus, status]);

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setStatus("all");
    setPaymentStatus("all");
    setPaymentMethod("all");
    setDateFrom("");
    setDateTo("");
  };

  const toggleAll = (checked: boolean) => {
    const next = new Set(selectedIds);
    orders.forEach((order) => {
      if (checked) next.add(order.id);
      else next.delete(order.id);
    });
    setSelectedIds(next);
  };

  const toggleOne = (orderId: number, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) next.add(orderId);
    else next.delete(orderId);
    setSelectedIds(next);
  };

  const changeStatus = (nextStatus: OrderStatus) => {
    if (!detailOrder || nextStatus === detailOrder.status) return;

    updateOrderStatus.mutate(
      { order: detailOrder.id, status: nextStatus },
      {
        onSuccess: () => {
          toast.success("Đã cập nhật trạng thái đơn hàng.");
          setPendingCancelStatus(null);
        },
        onError: (error) => {
          if (wasApiConnectionNotified(error)) return;
          toast.error(getApiErrorMessage(error, "Cập nhật trạng thái thất bại."));
        },
      },
    );
  };

  const confirmDelete = () => {
    if (!deletingOrder) return;

    deleteOrder.mutate(deletingOrder.id, {
      onSuccess: () => {
        toast.success("Đã xoá đơn hàng.");
        setDeletingOrder(null);
        if (detailOrderId === deletingOrder.id) setDetailOrderId(null);
      },
      onError: (error) => {
        if (wasApiConnectionNotified(error)) return;
        toast.error(getApiErrorMessage(error, "Xoá đơn hàng thất bại."));
      },
    });
  };

  const exportOrders = async () => {
    setIsExporting(true);

    try {
      const response = await adminOrderApi.getOrders({
        search: debouncedSearch,
        status,
        payment_status: paymentStatus,
        payment_method: paymentMethod,
        date_from: dateFrom,
        date_to: dateTo,
        per_page: 100,
      });

      if (response.data.length === 0) {
        toast.error("Không có đơn hàng để xuất.");
        return;
      }

      await exportExcel({
        rows: response.data,
        columns: ORDER_EXPORT_COLUMNS,
        filename: "maison-orders",
        sheetName: "Đơn hàng",
      });

      toast.success("Đã xuất file Excel đơn hàng.");
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
          <h1 className="text-2xl font-semibold text-foreground">Đơn hàng</h1>
          <p className="text-sm text-muted-foreground">{pagination?.total ?? 0} đơn hàng</p>
        </div>
        <Button
          variant="outline"
          onClick={exportOrders}
          disabled={isExporting || ordersQuery.isLoading}
          className="hidden gap-1.5 sm:inline-flex"
        >
          {isExporting ? <ButtonSpinner /> : <Download className="h-4 w-4" />}
          Xuất Excel
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-9 w-full rounded-md bg-white lg:w-64"
            placeholder="Tìm mã đơn, khách, SĐT..."
          />

          <Select value={status} onValueChange={(value) => setStatus(value as OrderStatusFilter)}>
            <SelectTrigger className="h-9 w-full focus:border-primary focus:ring-0 sm:w-44">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              {ORDER_STATUS_FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={paymentStatus} onValueChange={(value) => setPaymentStatus(value as PaymentStatusFilter)}>
            <SelectTrigger className="h-9 w-full focus:border-primary focus:ring-0 sm:w-48">
              <SelectValue placeholder="Thanh toán" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_STATUS_FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethodFilter)}>
            <SelectTrigger className="h-9 w-full focus:border-primary focus:ring-0 sm:w-48">
              <SelectValue placeholder="Phương thức" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHOD_FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="h-9 w-full rounded-md bg-white sm:w-40" />
          <Input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="h-9 w-full rounded-md bg-white sm:w-40" />

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
              Xoá lọc
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 lg:ml-auto"
            disabled={ordersQuery.isFetching}
            onClick={() => ordersQuery.refetch()}
          >
            <RefreshCw className={`h-4 w-4 ${ordersQuery.isFetching ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
        </div>
      </Card>

      {ordersQuery.isLoading ? (
        <div className="rounded-md border border-border bg-white p-4">
          <TableSkeleton rows={6} columns={10} />
        </div>
      ) : ordersQuery.isError ? (
        <EmptyState
          icon={ShoppingCart}
          title="Không thể tải đơn hàng"
          description="Vui lòng thử lại sau."
          actionLabel="Thử lại"
          onAction={() => ordersQuery.refetch()}
        />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title={hasFilters ? "Không tìm thấy đơn hàng" : "Chưa có đơn hàng"}
          description={hasFilters ? "Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm." : "Đơn hàng mới sẽ xuất hiện tại đây sau khi khách checkout."}
        />
      ) : (
        <div>
          <div className="overflow-x-auto rounded-md border border-border bg-white">
            <Table className="min-w-[1180px] table-fixed">
              <colgroup>
                <col className="w-12" />
                <col className="w-16" />
                <col className="w-40" />
                <col className="w-[18%]" />
                <col className="w-32" />
                <col className="w-36" />
                <col className="w-36" />
                <col className="w-36" />
                <col className="w-44" />
                <col className="w-12" />
              </colgroup>
              <TableHeader className="sticky top-0 bg-card">
                <TableRow>
                  <TableHead className="pl-4">
                    <Checkbox
                      checked={allSelected ? true : someSelected ? "indeterminate" : false}
                      onCheckedChange={(checked) => toggleAll(checked === true)}
                      aria-label="Chọn tất cả đơn hàng trên trang"
                    />
                  </TableHead>
                  <TableHead className="text-center">STT</TableHead>
                  <TableHead>Mã đơn</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>SĐT</TableHead>
                  <TableHead>Tổng tiền</TableHead>
                  <TableHead>Thanh toán</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày đặt</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order, index) => (
                  <TableRow key={order.id} className={selectedIds.has(order.id) ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/50"}>
                    <TableCell className="pl-4" onClick={(event) => event.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.has(order.id)}
                        onCheckedChange={(checked) => toggleOne(order.id, checked === true)}
                        aria-label={`Chọn đơn hàng ${order.order_code}`}
                      />
                    </TableCell>
                    <TableCell className="text-center font-mono text-xs text-muted-foreground">
                      {((pagination?.current_page ?? page) - 1) * (pagination?.per_page ?? orders.length) + index + 1}
                    </TableCell>
                    <TableCell className="font-mono text-sm font-medium">#{order.order_code}</TableCell>
                    <TableCell className="truncate">
                      <div className="truncate font-medium">{order.customer_name}</div>
                      <div className="truncate text-xs text-muted-foreground">{order.customer_email ?? "-"}</div>
                    </TableCell>
                    <TableCell className="text-sm">{order.customer_phone}</TableCell>
                    <TableCell className="whitespace-nowrap font-medium">{formatVnd(order.total)}</TableCell>
                    <TableCell>
                      <div className="text-sm">{PAYMENT_METHOD_LABELS[order.payment_method]}</div>
                      <span className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${PAYMENT_STATUS_BADGE_CLASS[order.payment_status]}`}>
                        {PAYMENT_STATUS_LABELS[order.payment_status]}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{formatDateTime(order.created_at)}</TableCell>
                    <TableCell className="text-right" onClick={(event) => event.stopPropagation()}>
                      <OrderActions
                        order={order}
                        onView={(selected) => setDetailOrderId(selected.id)}
                        onDelete={setDeletingOrder}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
            <span>Hiển thị {pagination?.from ?? 0}-{pagination?.to ?? 0} trong {pagination?.total ?? 0} đơn hàng</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || ordersQuery.isFetching}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination || page >= pagination.last_page || ordersQuery.isFetching}
                onClick={() => setPage((current) => current + 1)}
              >
                Sau
              </Button>
            </div>
          </div>
        </div>
      )}

      <Sheet open={detailOrderId !== null} onOpenChange={(open) => !open && setDetailOrderId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Chi tiết đơn hàng {detailOrder ? `#${detailOrder.order_code}` : ""}</SheetTitle>
            <SheetDescription>Thông tin khách hàng, sản phẩm và trạng thái xử lý.</SheetDescription>
          </SheetHeader>

          {detailQuery.isLoading ? (
            <div className="mt-6 space-y-4">
              <div className="h-28 animate-pulse rounded-md bg-muted" />
              <div className="h-64 animate-pulse rounded-md bg-muted" />
            </div>
          ) : detailOrder ? (
            <div className="mt-6 space-y-5">
              <div className="grid gap-3 rounded-md border border-border p-4 text-sm sm:grid-cols-2">
                <Info label="Khách hàng" value={detailOrder.customer_name} />
                <Info label="SĐT" value={detailOrder.customer_phone} />
                <Info label="Email" value={detailOrder.customer_email ?? "-"} />
                <Info label="Ngày đặt" value={formatDateTime(detailOrder.created_at)} />
                <Info label="Địa chỉ" value={formatShippingAddress(detailOrder)} className="sm:col-span-2" />
                {detailOrder.note && <Info label="Ghi chú" value={detailOrder.note} className="sm:col-span-2" />}
              </div>

              <div className="rounded-md border border-border p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">Trạng thái</div>
                    <div className="mt-1"><StatusBadge status={detailOrder.status} /></div>
                  </div>
                  <Select
                    value={detailOrder.status}
                    disabled={updateOrderStatus.isPending || ORDER_NEXT_STATUS[detailOrder.status].length === 0}
                    onValueChange={(value) => {
                      const next = value as OrderStatus;
                      if (next === "cancelled") setPendingCancelStatus(next);
                      else changeStatus(next);
                    }}
                  >
                    <SelectTrigger className="h-9 w-48">
                      <SelectValue placeholder="Đổi trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      {[detailOrder.status, ...ORDER_NEXT_STATUS[detailOrder.status]].map((option) => (
                        <SelectItem key={option} value={option}>
                          {ORDER_STATUS_LABELS[option]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <OrderTimeline order={detailOrder} />

              <div className="rounded-md border border-border">
                <div className="border-b border-border px-4 py-3 text-sm font-semibold">Sản phẩm</div>
                <div className="divide-y divide-border">
                  {(detailOrder.items ?? []).map((item) => (
                    <div key={item.id} className="flex gap-3 px-4 py-3">
                      {item.product_image ? (
                        <img src={item.product_image} alt={item.product_name} className="h-14 w-14 rounded-md object-cover" />
                      ) : (
                        <div className="grid h-14 w-14 place-items-center rounded-md bg-muted text-muted-foreground">
                          <ShoppingCart className="h-5 w-5" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{item.product_name}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {[item.brand_name, item.volume_ml ? `${item.volume_ml}ml` : null, item.concentration].filter(Boolean).join(" · ")} · x{item.quantity}
                        </div>
                      </div>
                      <div className="whitespace-nowrap text-sm font-semibold">{formatVnd(item.line_total)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <dl className="space-y-2 rounded-md border border-border p-4 text-sm">
                <SummaryRow label="Tạm tính" value={formatVnd(detailOrder.subtotal)} />
                <SummaryRow label="Vận chuyển" value={Number(detailOrder.shipping_fee) === 0 ? "Miễn phí" : formatVnd(detailOrder.shipping_fee)} />
                {Number(detailOrder.discount_total) > 0 && <SummaryRow label="Giảm giá" value={`-${formatVnd(detailOrder.discount_total)}`} />}
                <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
                  <dt>Tổng cộng</dt>
                  <dd>{formatVnd(detailOrder.total)}</dd>
                </div>
              </dl>
            </div>
          ) : (
            <div className="mt-6 text-sm text-muted-foreground">Không tìm thấy đơn hàng.</div>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={Boolean(pendingCancelStatus)} onOpenChange={(open) => !open && setPendingCancelStatus(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Huỷ đơn hàng này?</AlertDialogTitle>
            <AlertDialogDescription>
              Khi huỷ đơn, hệ thống sẽ cộng lại tồn kho cho các sản phẩm trong đơn. Hành động này không thể đổi tiếp trạng thái.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateOrderStatus.isPending}>Không huỷ</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={updateOrderStatus.isPending}
              onClick={(event) => {
                event.preventDefault();
                if (pendingCancelStatus) changeStatus(pendingCancelStatus);
              }}
            >
              {updateOrderStatus.isPending && <ButtonSpinner />}
              Huỷ đơn
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={Boolean(deletingOrder)} onOpenChange={(open) => !open && setDeletingOrder(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá đơn hàng {deletingOrder ? `#${deletingOrder.order_code}` : ""}?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này chỉ xoá đơn khỏi màn quản trị. Nếu cần hoàn kho, hãy chuyển trạng thái đơn sang huỷ trước.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteOrder.isPending}>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteOrder.isPending}
              onClick={(event) => {
                event.preventDefault();
                confirmDelete();
              }}
            >
              {deleteOrder.isPending && <ButtonSpinner />}
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function OrderActions({
  order,
  onView,
  onDelete,
}: {
  order: Order;
  onView: (order: Order) => void;
  onDelete: (order: Order) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Thao tác đơn hàng">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onView(order)}>
          <Eye className="mr-2 h-4 w-4" />
          Chi tiết
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive" onClick={() => onDelete(order)}>
          <Trash2 className="mr-2 h-4 w-4" />
          Xoá
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${ORDER_STATUS_BADGE_CLASS[status]}`}>
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}

const ORDER_TIMELINE_STEPS: Array<{ id: OrderStatus; label: string }> = [
  { id: "pending", label: "Chờ xử lý" },
  { id: "confirmed", label: "Đã xác nhận" },
  { id: "processing", label: "Đang chuẩn bị" },
  { id: "shipping", label: "Đang giao" },
  { id: "completed", label: "Hoàn thành" },
];

const ORDER_TIMELINE_INDEX: Partial<Record<OrderStatus, number>> = {
  pending: 0,
  confirmed: 1,
  processing: 2,
  shipping: 3,
  completed: 4,
};

function OrderTimeline({ order }: { order: Order }) {
  if (order.status === "cancelled") {
    return (
      <div className="rounded-md border border-red-100 bg-red-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-red-800">Đã huỷ</div>
            <div className="mt-1 text-xs text-red-700">
              {order.cancelled_at ? formatDateTime(order.cancelled_at) : "Tồn kho đã được hoàn lại khi huỷ đơn."}
            </div>
          </div>
          <StatusBadge status="cancelled" />
        </div>
      </div>
    );
  }

  const currentIndex = ORDER_TIMELINE_INDEX[order.status] ?? 0;

  return (
    <div className="rounded-md border border-border p-4">
      <div className="mb-3 text-sm font-semibold">Timeline xử lý</div>
      <ol className="grid gap-3 md:grid-cols-5 md:gap-0">
        {ORDER_TIMELINE_STEPS.map((step, index) => {
          const done = index <= currentIndex;
          const active = index === currentIndex;
          const connectorDone = index < currentIndex;

          return (
            <li key={step.id} className="relative flex min-w-0 items-start gap-2 pb-2 last:pb-0 md:block md:px-2 md:pb-0 md:text-center">
              {index < ORDER_TIMELINE_STEPS.length - 1 && (
                <span
                  className={`absolute left-[14px] top-8 h-[calc(100%-0.75rem)] w-px md:left-[calc(50%+14px)] md:top-[14px] md:h-px md:w-[calc(100%-28px)] ${
                    connectorDone ? "bg-primary" : "bg-border"
                  }`}
                  aria-hidden="true"
                />
              )}
              <div className={`relative z-20 mx-0 grid h-7 w-7 shrink-0 place-items-center rounded-full border text-xs md:mx-auto ${
                done ? "border-primary bg-primary text-primary-foreground" : "border-border bg-muted text-muted-foreground"
              }`}>
                {done ? <Check className="h-3.5 w-3.5" /> : index + 1}
              </div>
              <span className={`block min-w-0 pt-1 text-xs font-medium md:mt-2 md:pt-0 ${active ? "text-primary" : done ? "text-foreground" : "text-muted-foreground"}`}>
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function formatShippingAddress(order: Order) {
  return formatAddressParts([order.shipping_address, order.ward_name, order.province_name]);
}

function Info({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 break-words font-medium text-foreground">{value || "-"}</div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function getApiErrorMessage(error: unknown, fallback: string) {
  const err = error as AxiosError<ApiErrorResponse>;
  const errors = err.response?.data?.errors as Record<string, string[]> | undefined;
  const firstError = errors ? Object.values(errors).flat().find(Boolean) : undefined;

  return firstError ?? err.response?.data?.message ?? err.message ?? fallback;
}

const ORDER_EXPORT_COLUMNS: ExcelColumn<Order>[] = [
  {
    header: "STT",
    accessor: (_order, index) => index + 1,
  },
  {
    header: "Mã đơn",
    accessor: (order) => order.order_code,
  },
  {
    header: "Khách hàng",
    accessor: (order) => order.customer_name,
  },
  {
    header: "SĐT",
    accessor: (order) => order.customer_phone,
  },
  {
    header: "Email",
    accessor: (order) => order.customer_email ?? "",
  },
  {
    header: "Tổng tiền",
    accessor: (order) => formatVnd(order.total),
  },
  {
    header: "Thanh toán",
    accessor: (order) => PAYMENT_METHOD_LABELS[order.payment_method],
  },
  {
    header: "Trạng thái thanh toán",
    accessor: (order) => PAYMENT_STATUS_LABELS[order.payment_status],
  },
  {
    header: "Trạng thái",
    accessor: (order) => ORDER_STATUS_LABELS[order.status],
  },
  {
    header: "Ngày đặt",
    accessor: (order) => formatDateTime(order.created_at, ""),
  },
];
