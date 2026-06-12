import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Package, Search } from "lucide-react";
import AccountLayout from "@/layouts/AccountLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ACCOUNT_ORDER_PAGE_SIZE,
  ORDER_STATUS_BADGE_CLASS,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_BADGE_CLASS,
  PAYMENT_STATUS_LABELS,
} from "@/constants/order";
import { useMyOrders } from "@/hooks/useOrders";
import { formatDateTime } from "@/lib/date-time";
import { formatVnd } from "@/lib/product-utils";
import type { Order, OrderStatusFilter } from "@/types/order";

const TABS: Array<{ id: OrderStatusFilter; label: string }> = [
  { id: "all", label: "Tất cả" },
  { id: "pending", label: "Chờ xử lý" },
  { id: "shipping", label: "Đang giao" },
  { id: "completed", label: "Hoàn thành" },
  { id: "cancelled", label: "Đã huỷ" },
];

export default function Orders() {
  const [tab, setTab] = useState<OrderStatusFilter>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  const params = useMemo(
    () => ({
      search: debouncedSearch,
      status: tab,
      page,
      per_page: ACCOUNT_ORDER_PAGE_SIZE,
    }),
    [debouncedSearch, page, tab],
  );
  const ordersQuery = useMyOrders(params);
  const orders = ordersQuery.data?.data ?? [];
  const pagination = ordersQuery.data;

  const updateTab = (next: OrderStatusFilter) => {
    setTab(next);
    setPage(1);
  };

  return (
    <AccountLayout title="Đơn hàng của tôi" subtitle="Theo dõi và quản lý tất cả đơn hàng của bạn.">
      <div className="rounded-xl border border-stone-200 bg-white p-4">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="-mx-1 flex min-w-0 gap-1 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {TABS.map((item) => (
              <button
                key={item.id}
                onClick={() => updateTab(item.id)}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  tab === item.id ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm mã đơn..."
              className="h-10 rounded-lg border-input bg-stone-50 pl-9"
            />
          </div>
        </div>
      </div>

      {ordersQuery.isLoading ? (
        <OrderListSkeleton />
      ) : ordersQuery.isError ? (
        <EmptyBox title="Không thể tải đơn hàng" description="Vui lòng thử lại sau." />
      ) : orders.length === 0 ? (
        <EmptyBox title="Không có đơn hàng nào" description="Thử thay đổi bộ lọc hoặc tiếp tục mua sắm." />
      ) : (
        <>
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-stone-500">
              Hiển thị{" "}
              <span className="font-medium text-stone-900">{pagination?.from ?? 0}-{pagination?.to ?? 0}</span>
              {" "}trong <span className="font-medium text-stone-900">{pagination?.total ?? 0}</span> đơn hàng
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || ordersQuery.isFetching}
              >
                Trước
              </Button>
              <span className="min-w-16 text-center text-sm text-stone-500">
                {pagination?.current_page ?? page}/{pagination?.last_page ?? 1}
              </span>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPage((current) => Math.min(pagination?.last_page ?? current, current + 1))}
                disabled={!pagination || page >= pagination.last_page || ordersQuery.isFetching}
              >
                Sau
              </Button>
            </div>
          </div>
        </>
      )}
    </AccountLayout>
  );
}

function OrderCard({ order }: { order: Order }) {
  const items = order.items ?? [];
  const visibleItems = items.slice(0, 3);

  return (
    <article className="rounded-xl border border-stone-200 bg-white">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="font-semibold">#{order.order_code}</span>
          <span className="text-xs text-stone-500">{formatDateTime(order.created_at)}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${ORDER_STATUS_BADGE_CLASS[order.status]}`}>
            {ORDER_STATUS_LABELS[order.status]}
          </span>
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${PAYMENT_STATUS_BADGE_CLASS[order.payment_status]}`}>
            {PAYMENT_STATUS_LABELS[order.payment_status]}
          </span>
        </div>
      </header>

      <div className="space-y-3 px-5 py-4">
        {visibleItems.length === 0 ? (
          <p className="text-sm text-stone-500">Đơn hàng chưa có dữ liệu sản phẩm.</p>
        ) : (
          visibleItems.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              {item.product_image ? (
                <img src={item.product_image} alt={item.product_name} className="h-14 w-14 rounded-lg object-cover" />
              ) : (
                <div className="grid h-14 w-14 place-items-center rounded-lg bg-stone-100 text-stone-400">
                  <Package className="h-5 w-5" strokeWidth={1.5} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.product_name}</p>
                <p className="text-xs text-stone-500">x{item.quantity}</p>
              </div>
            </div>
          ))
        )}
        {items.length > visibleItems.length && (
          <p className="text-xs text-stone-500">+{items.length - visibleItems.length} sản phẩm khác</p>
        )}
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 bg-stone-50/60 px-5 py-3">
        <div className="text-sm text-stone-500">
          Tổng tiền: <span className="text-base font-semibold text-stone-900">{formatVnd(order.total)}</span>
        </div>
        <Link to={`/account/orders/${order.order_code}`} className="flex items-center gap-1 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800">
          Chi tiết <ChevronRight className="h-4 w-4" />
        </Link>
      </footer>
    </article>
  );
}

function EmptyBox({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white py-16 text-center">
      <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-stone-100">
        <Package className="h-7 w-7 text-stone-400" />
      </div>
      <h2 className="text-lg font-medium">{title}</h2>
      <p className="mt-1 text-sm text-stone-500">{description}</p>
    </div>
  );
}

function OrderListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="h-40 animate-pulse rounded-xl border border-stone-200 bg-white" />
      ))}
    </div>
  );
}
