import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { AxiosError } from "axios";
import { Check, CreditCard, MapPin, Package, Phone, Printer, RotateCcw, Truck } from "lucide-react";
import { toast } from "sonner";
import AccountLayout from "@/layouts/AccountLayout";
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
import { ButtonSpinner } from "@/components/shared/ButtonSpinner";
import { Button } from "@/components/ui/button";
import {
  ORDER_STATUS_BADGE_CLASS,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_BADGE_CLASS,
  PAYMENT_STATUS_LABELS,
} from "@/constants/order";
import { useCancelOrder, useMyOrder } from "@/hooks/useOrders";
import { formatAddressParts } from "@/lib/address-format";
import { formatDateTime } from "@/lib/date-time";
import { formatVietnamPhone } from "@/lib/phone";
import { formatVnd } from "@/lib/product-utils";
import type { ApiErrorResponse } from "@/types/auth";
import type { Order, OrderStatus } from "@/types/order";

const TRACKER_STEPS: Array<{ id: OrderStatus; label: string }> = [
  { id: "pending", label: "Đã đặt hàng" },
  { id: "confirmed", label: "Xác nhận" },
  { id: "processing", label: "Chuẩn bị" },
  { id: "shipping", label: "Đang giao" },
  { id: "completed", label: "Hoàn thành" },
];

const STEP_INDEX: Partial<Record<OrderStatus, number>> = {
  pending: 0,
  confirmed: 1,
  processing: 2,
  shipping: 3,
  completed: 4,
};

export default function OrderDetail() {
  const { id } = useParams();
  const [cancelOpen, setCancelOpen] = useState(false);
  const orderQuery = useMyOrder(id);
  const cancelOrder = useCancelOrder();
  const order = orderQuery.data;

  if (orderQuery.isLoading) {
    return (
      <AccountLayout title="Đơn hàng" subtitle="Đang tải chi tiết đơn hàng.">
        <div className="space-y-5">
          <div className="h-36 animate-pulse rounded-xl border border-stone-200 bg-white" />
          <div className="h-80 animate-pulse rounded-xl border border-stone-200 bg-white" />
        </div>
      </AccountLayout>
    );
  }

  if (orderQuery.isError || !order) {
    return (
      <AccountLayout title="Không tìm thấy đơn hàng" subtitle="Đơn hàng không tồn tại hoặc không thuộc tài khoản của bạn.">
        <div className="rounded-xl border border-stone-200 bg-white py-16 text-center">
          <Package className="mx-auto h-10 w-10 text-stone-300" strokeWidth={1.5} />
          <h2 className="mt-3 text-lg font-medium text-stone-900">Không thể tải đơn hàng</h2>
          <Button asChild className="mt-5 bg-stone-900 text-white hover:bg-stone-800">
            <Link to="/account/orders">Quay lại danh sách</Link>
          </Button>
        </div>
      </AccountLayout>
    );
  }

  const canCancel = order.status === "pending" || order.status === "confirmed";

  const confirmCancel = () => {
    if (!order) return;

    cancelOrder.mutate(order.order_code, {
      onSuccess: () => {
        toast.success("Đã huỷ đơn hàng.");
        setCancelOpen(false);
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error, "Huỷ đơn hàng thất bại."));
      },
    });
  };

  return (
    <AccountLayout title={`Đơn hàng #${order.order_code}`} subtitle={`Đặt ngày ${formatDateTime(order.created_at)}`}>
      <div className="space-y-5">
        <OrderTracker order={order} />

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <section className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <Package className="h-4 w-4" /> Sản phẩm ({order.items?.length ?? 0})
              </h2>
              <button className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900">
                <Printer className="h-3.5 w-3.5" /> In đơn
              </button>
            </div>

            <ul className="divide-y divide-stone-100">
              {(order.items ?? []).map((item) => (
                <li key={item.id} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                  {item.product_image ? (
                    <img src={item.product_image} alt={item.product_name} className="h-16 w-16 rounded-lg object-cover" />
                  ) : (
                    <div className="grid h-16 w-16 place-items-center rounded-lg bg-stone-100 text-stone-400">
                      <Package className="h-5 w-5" strokeWidth={1.5} />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.product_name}</p>
                    <p className="text-xs text-stone-500">
                      {[item.concentration, item.volume_ml ? `${item.volume_ml}ml` : null, item.brand_name].filter(Boolean).join(" · ")} × {item.quantity}
                    </p>
                  </div>
                  <div className="whitespace-nowrap text-sm font-semibold">{formatVnd(item.line_total)}</div>
                </li>
              ))}
            </ul>

            <dl className="mt-5 space-y-2 border-t border-stone-200 pt-4 text-sm">
              <Row label="Tạm tính" value={formatVnd(order.subtotal)} />
              <Row label="Vận chuyển" value={Number(order.shipping_fee) === 0 ? "Miễn phí" : formatVnd(order.shipping_fee)} />
              {Number(order.discount_total) > 0 && <Row label="Giảm giá" value={`-${formatVnd(order.discount_total)}`} accent />}
              <div className="flex justify-between border-t border-stone-200 pt-2 text-base font-semibold">
                <dt>Tổng cộng</dt>
                <dd className="text-amber-700">{formatVnd(order.total)}</dd>
              </div>
            </dl>
          </section>

          <aside className="space-y-4">
            <InfoCard icon={<MapPin className="h-4 w-4" />} title="Địa chỉ nhận hàng">
              <p className="font-medium text-stone-900">{order.customer_name}</p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-stone-500">
                <Phone className="h-3 w-3" /> {formatVietnamPhone(order.customer_phone)}
              </p>
              <p className="mt-1.5">{formatShippingAddress(order)}</p>
            </InfoCard>
            <InfoCard icon={<Truck className="h-4 w-4" />} title="Vận chuyển">
              <p>{Number(order.shipping_fee) === 0 ? "Miễn phí vận chuyển" : formatVnd(order.shipping_fee)}</p>
            </InfoCard>
            <InfoCard icon={<CreditCard className="h-4 w-4" />} title="Thanh toán">
              <p>{PAYMENT_METHOD_LABELS[order.payment_method]}</p>
              <p className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${PAYMENT_STATUS_BADGE_CLASS[order.payment_status]}`}>
                {PAYMENT_STATUS_LABELS[order.payment_status]}
              </p>
            </InfoCard>

            <div className="flex flex-col gap-2">
              {canCancel && (
                <button
                  type="button"
                  onClick={() => setCancelOpen(true)}
                  className="rounded-lg border border-red-200 bg-red-50 py-2.5 text-center text-sm font-semibold text-red-700 hover:bg-red-100"
                >
                  Huỷ đơn
                </button>
              )}
              <button className="flex items-center justify-center gap-1.5 rounded-lg bg-stone-900 py-2.5 text-sm font-semibold text-white hover:bg-stone-800">
                <RotateCcw className="h-4 w-4" /> Mua lại
              </button>
              <Link to="/account/orders" className="rounded-lg border border-stone-300 py-2.5 text-center text-sm font-medium hover:bg-white">
                Quay lại danh sách
              </Link>
            </div>
          </aside>
        </div>
      </div>

      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Huỷ đơn hàng này?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn chỉ có thể huỷ đơn khi đơn còn chờ xử lý hoặc đã xác nhận. Sau khi huỷ, hệ thống sẽ hoàn lại tồn kho cho sản phẩm trong đơn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelOrder.isPending}>Không huỷ</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={cancelOrder.isPending}
              onClick={(event) => {
                event.preventDefault();
                confirmCancel();
              }}
            >
              {cancelOrder.isPending && <ButtonSpinner />}
              Huỷ đơn
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AccountLayout>
  );
}

function OrderTracker({ order }: { order: Order }) {
  if (order.status === "cancelled") {
    return (
      <section className="rounded-xl border border-red-100 bg-red-50 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-red-800">Đơn hàng đã huỷ</h2>
            <p className="mt-1 text-xs text-red-700">{order.cancelled_at ? formatDateTime(order.cancelled_at) : "Kho đã được hoàn lại sau khi huỷ."}</p>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${ORDER_STATUS_BADGE_CLASS.cancelled}`}>
            {ORDER_STATUS_LABELS.cancelled}
          </span>
        </div>
      </section>
    );
  }

  const currentIdx = STEP_INDEX[order.status] ?? 0;

  return (
    <section className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-stone-700">Tình trạng đơn hàng</h2>
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${ORDER_STATUS_BADGE_CLASS[order.status]}`}>
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>
      <ol className="grid gap-4 md:grid-cols-5 md:gap-0">
        {TRACKER_STEPS.map((step, index) => {
          const done = index <= currentIdx;
          const active = index === currentIdx;
          const connectorDone = index < currentIdx;

          return (
            <li key={step.id} className="relative flex min-w-0 items-start gap-3 pb-2 last:pb-0 md:block md:px-2 md:pb-0 md:text-center">
              {index < TRACKER_STEPS.length - 1 && (
                <span
                  className={`absolute left-[18px] top-10 h-[calc(100%-1rem)] w-px md:left-[calc(50%+18px)] md:top-[18px] md:h-px md:w-[calc(100%-36px)] ${
                    connectorDone ? "bg-emerald-600" : "bg-stone-200"
                  }`}
                  aria-hidden="true"
                />
              )}
              <div className={`relative z-20 mx-0 grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 md:mx-auto ${done ? "border-emerald-600 bg-emerald-600 text-white" : "border-stone-300 bg-white text-stone-400"}`}>
                {done ? <Check className="h-4 w-4" /> : <span className="text-xs font-semibold">{index + 1}</span>}
              </div>
              <div className="min-w-0 md:mt-3">
                <div className={`text-sm font-medium ${active ? "text-emerald-700" : done ? "text-stone-900" : "text-stone-500"}`}>{step.label}</div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function formatShippingAddress(order: Order) {
  return formatAddressParts([order.shipping_address, order.ward_name, order.province_name]);
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className="text-stone-600">{label}</dt>
      <dd className={accent ? "text-emerald-700" : "text-stone-900"}>{value}</dd>
    </div>
  );
}

function InfoCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 text-sm text-stone-700">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-stone-500">
        {icon} {title}
      </div>
      {children}
    </div>
  );
}

function getApiErrorMessage(error: unknown, fallback: string) {
  const err = error as AxiosError<ApiErrorResponse>;
  const errors = err.response?.data?.errors as Record<string, string[]> | undefined;
  const firstError = errors ? Object.values(errors).flat().find(Boolean) : undefined;

  return firstError ?? err.response?.data?.message ?? err.message ?? fallback;
}
