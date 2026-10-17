import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  LayoutDashboard,
  MessageSquare,
  PackageOpen,
  ReceiptText,
  RefreshCw,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ORDER_STATUS_BADGE_CLASS, ORDER_STATUS_LABELS } from "@/constants/order";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { formatDateTime } from "@/lib/date-time";
import { formatVnd } from "@/lib/product-utils";
import type { DashboardPeriod, DashboardStatsParams } from "@/types/admin/dashboard";
import type { OrderStatus } from "@/types/order";

const PERIOD_OPTIONS: Array<{ value: DashboardPeriod; label: string }> = [
  { value: "today", label: "Hôm nay" },
  { value: "7d", label: "7 ngày" },
  { value: "30d", label: "30 ngày" },
  { value: "custom", label: "Tùy chọn" },
];

const STATUS_ORDER: OrderStatus[] = ["pending", "confirmed", "processing", "shipping", "completed", "cancelled"];

export default function Dashboard() {
  const [period, setPeriod] = useState<DashboardPeriod>("7d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const params = useMemo<DashboardStatsParams>(() => {
    if (period === "custom" && customFrom && customTo) {
      return { period, from: customFrom, to: customTo };
    }

    return { period: period === "custom" ? "7d" : period };
  }, [customFrom, customTo, period]);

  const statsQuery = useAdminDashboard(params);
  const stats = statsQuery.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Bảng điều khiển</h1>
          <p className="text-sm text-muted-foreground">
            {stats ? `Số liệu từ ${formatRangeDate(stats.range.from)} đến ${formatRangeDate(stats.range.to)}` : "Tổng quan hoạt động bán hàng của shop."}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          disabled={statsQuery.isFetching}
          onClick={() => statsQuery.refetch()}
        >
          <RefreshCw className={`h-4 w-4 ${statsQuery.isFetching ? "animate-spin" : ""}`} />
          Làm mới
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex rounded-lg border border-input bg-white p-0.5">
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setPeriod(option.value)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  period === option.value ? "bg-stone-900 text-white" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          {period === "custom" && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <input
                type="date"
                value={customFrom}
                max={customTo || undefined}
                onChange={(event) => setCustomFrom(event.target.value)}
                className="h-9 rounded-md border border-input bg-white px-3 text-sm"
                aria-label="Từ ngày"
              />
              <span className="text-muted-foreground">đến</span>
              <input
                type="date"
                value={customTo}
                min={customFrom || undefined}
                onChange={(event) => setCustomTo(event.target.value)}
                className="h-9 rounded-md border border-input bg-white px-3 text-sm"
                aria-label="Đến ngày"
              />
              {(!customFrom || !customTo) && (
                <span className="text-xs text-muted-foreground">Chọn đủ 2 mốc để áp dụng (đang hiển thị 7 ngày).</span>
              )}
            </div>
          )}
        </div>
      </Card>

      {statsQuery.isLoading ? (
        <DashboardSkeleton />
      ) : statsQuery.isError ? (
        <EmptyState
          icon={LayoutDashboard}
          title="Không thể tải số liệu"
          description="Vui lòng thử lại sau."
          actionLabel="Thử lại"
          onAction={() => statsQuery.refetch()}
        />
      ) : stats ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={TrendingUp}
              label="Doanh thu"
              value={formatVnd(stats.summary.revenue)}
              hint="Không tính đơn đã huỷ"
            />
            <StatCard
              icon={ReceiptText}
              label="Đơn hàng"
              value={String(stats.summary.orders_count)}
              hint="Trong khoảng thời gian đã chọn"
            />
            <StatCard
              icon={UserPlus}
              label="Khách hàng mới"
              value={String(stats.summary.new_customers)}
              hint="Tài khoản đăng ký mới"
            />
            <StatCard
              icon={MessageSquare}
              label="Đánh giá chờ duyệt"
              value={String(stats.summary.pending_reviews)}
              hint={<Link to="/admin/product-reviews" className="text-amber-700 hover:underline">Xem danh sách</Link>}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-foreground">Doanh thu theo ngày</h2>
              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.revenue_by_day} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
                    <defs>
                      <linearGradient id="dashboardRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#b45309" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#b45309" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatShortDate}
                      tick={{ fontSize: 12, fill: "#78716c" }}
                      tickLine={false}
                      axisLine={{ stroke: "#e7e5e4" }}
                      minTickGap={24}
                    />
                    <YAxis
                      tickFormatter={formatCompactVnd}
                      tick={{ fontSize: 12, fill: "#78716c" }}
                      tickLine={false}
                      axisLine={false}
                      width={56}
                    />
                    <Tooltip content={<RevenueTooltip />} cursor={{ stroke: "#a8a29e", strokeDasharray: "3 3" }} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#b45309"
                      strokeWidth={2}
                      fill="url(#dashboardRevenue)"
                      activeDot={{ r: 4, strokeWidth: 2, stroke: "#ffffff" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="text-sm font-semibold text-foreground">Đơn hàng theo trạng thái</h2>
              <ul className="mt-4 space-y-3">
                {STATUS_ORDER.map((status) => (
                  <li key={status} className="flex items-center justify-between gap-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${ORDER_STATUS_BADGE_CLASS[status]}`}>
                      {ORDER_STATUS_LABELS[status]}
                    </span>
                    <span className="text-sm font-semibold text-foreground">{stats.orders_by_status[status] ?? 0}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between px-5 pt-5">
                <h2 className="text-sm font-semibold text-foreground">Đơn hàng gần nhất</h2>
                <Link to="/admin/orders" className="text-sm text-amber-700 hover:underline">Xem tất cả</Link>
              </div>
              {stats.recent_orders.length === 0 ? (
                <p className="px-5 py-8 text-sm text-muted-foreground">Chưa có đơn hàng nào.</p>
              ) : (
                <div className="mt-3 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mã đơn</TableHead>
                        <TableHead>Khách hàng</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Tổng tiền</TableHead>
                        <TableHead>Thời gian</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.recent_orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>
                            <Link to="/admin/orders" className="font-medium text-foreground hover:text-amber-700">
                              #{order.order_code}
                            </Link>
                          </TableCell>
                          <TableCell className="text-sm">{order.customer_name}</TableCell>
                          <TableCell>
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${ORDER_STATUS_BADGE_CLASS[order.status]}`}>
                              {ORDER_STATUS_LABELS[order.status]}
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-sm font-medium">{formatVnd(order.total)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{formatDateTime(order.created_at)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>

            <div className="space-y-4">
              <Card className="p-5">
                <h2 className="text-sm font-semibold text-foreground">Top sản phẩm bán chạy</h2>
                {stats.top_products.length === 0 ? (
                  <p className="mt-4 text-sm text-muted-foreground">Chưa có dữ liệu bán hàng.</p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {stats.top_products.map((product, index) => (
                      <li key={`${product.product_id}-${index}`} className="flex items-center gap-3">
                        <span className="w-5 text-sm font-semibold text-muted-foreground">{index + 1}</span>
                        {product.product_image ? (
                          <img src={product.product_image} alt={product.product_name} className="h-10 w-10 rounded-md object-cover" />
                        ) : (
                          <span className="grid h-10 w-10 place-items-center rounded-md bg-stone-100 text-stone-400">
                            <PackageOpen className="h-5 w-5" />
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-foreground">{product.product_name}</div>
                          <div className="text-xs text-muted-foreground">
                            Đã bán {product.total_quantity} · {formatVnd(product.total_revenue)}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              <Card className="p-5">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  Sắp hết hàng
                </h2>
                {stats.low_stock_products.length === 0 ? (
                  <p className="mt-4 text-sm text-muted-foreground">Tồn kho đang ổn định.</p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {stats.low_stock_products.map((product) => (
                      <li key={product.id} className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-foreground">{product.name}</div>
                          {product.sku && <div className="text-xs text-muted-foreground">{product.sku}</div>}
                        </div>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${product.stock === 0 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
                          Còn {product.stock}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
  hint?: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-amber-50 text-amber-700">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="truncate text-xl font-semibold text-foreground">{value}</div>
        </div>
      </div>
      {hint && <div className="mt-2 text-xs text-muted-foreground">{hint}</div>}
    </Card>
  );
}

function RevenueTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ payload: { revenue: number; orders_count: number } }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const point = payload[0].payload;

  return (
    <div className="rounded-lg border border-border bg-white px-3 py-2 text-sm shadow-md">
      <div className="font-medium text-foreground">{formatShortDate(label ?? "")}</div>
      <div className="mt-1 text-muted-foreground">Doanh thu: <span className="font-medium text-foreground">{formatVnd(point.revenue)}</span></div>
      <div className="text-muted-foreground">Đơn hàng: <span className="font-medium text-foreground">{point.orders_count}</span></div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="p-5">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="mt-3 h-4 w-24" />
            <Skeleton className="mt-2 h-6 w-32" />
          </Card>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card className="p-5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-4 h-64 w-full" />
        </Card>
        <Card className="p-5">
          <Skeleton className="h-4 w-40" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-6 w-full" />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function formatShortDate(value: string) {
  if (!value) return "";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

function formatRangeDate(value: string) {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("vi-VN");
}

function formatCompactVnd(value: number) {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} tỷ`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} tr`;
  if (value >= 1_000) return `${Math.round(value / 1_000)} k`;

  return String(value);
}
