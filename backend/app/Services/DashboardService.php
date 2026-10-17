<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\ProductReviewStatus;
use App\Enums\ProductStatus;
use App\Enums\UserRole;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductReview;
use App\Models\User;
use App\Services\Interfaces\DashboardServiceInterface;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

class DashboardService extends BaseService implements DashboardServiceInterface
{
    private const LOW_STOCK_THRESHOLD = 5;
    private const TOP_PRODUCTS_LIMIT = 5;
    private const RECENT_ORDERS_LIMIT = 5;
    private const LOW_STOCK_LIMIT = 8;
    private const MAX_CUSTOM_RANGE_DAYS = 366;

    public function getStats(array $filters): array
    {
        return $this->executeSafe(function () use ($filters) {
            [$from, $to] = $this->resolveRange($filters);

            return [
                'range' => [
                    'from' => $from->toDateString(),
                    'to' => $to->toDateString(),
                ],
                'summary' => $this->summary($from, $to),
                'orders_by_status' => $this->ordersByStatus($from, $to),
                'revenue_by_day' => $this->revenueByDay($from, $to),
                'top_products' => $this->topProducts($from, $to),
                'recent_orders' => $this->recentOrders(),
                'low_stock_products' => $this->lowStockProducts(),
            ];
        }, 'getStats');
    }

    /**
     * @return array{0: CarbonImmutable, 1: CarbonImmutable}
     */
    private function resolveRange(array $filters): array
    {
        $today = CarbonImmutable::now()->startOfDay();
        $period = (string) ($filters['period'] ?? '7d');

        if ($period === 'custom') {
            $from = $this->parseDate($filters['from'] ?? null) ?? $today->subDays(6);
            $to = $this->parseDate($filters['to'] ?? null) ?? $today;

            if ($from->greaterThan($to)) {
                [$from, $to] = [$to, $from];
            }

            if ($from->diffInDays($to) > self::MAX_CUSTOM_RANGE_DAYS) {
                $from = $to->subDays(self::MAX_CUSTOM_RANGE_DAYS);
            }

            return [$from, $to];
        }

        return match ($period) {
            'today' => [$today, $today],
            '30d' => [$today->subDays(29), $today],
            default => [$today->subDays(6), $today],
        };
    }

    private function parseDate(mixed $value): ?CarbonImmutable
    {
        if (! is_string($value) || trim($value) === '') {
            return null;
        }

        try {
            return CarbonImmutable::parse($value)->startOfDay();
        } catch (\Throwable) {
            return null;
        }
    }

    private function summary(CarbonImmutable $from, CarbonImmutable $to): array
    {
        $revenueQuery = $this->revenueOrdersQuery($from, $to);

        $aggregate = $revenueQuery
            ->selectRaw('COALESCE(SUM(total), 0) AS revenue, COUNT(*) AS orders_count')
            ->first();

        return [
            'revenue' => (float) ($aggregate->revenue ?? 0),
            'orders_count' => (int) ($aggregate->orders_count ?? 0),
            'new_customers' => User::query()
                ->where('role', UserRole::User->value)
                ->whereBetween('created_at', [$from, $to->endOfDay()])
                ->count(),
            'pending_reviews' => ProductReview::query()
                ->where('status', ProductReviewStatus::Pending->value)
                ->count(),
        ];
    }

    private function ordersByStatus(CarbonImmutable $from, CarbonImmutable $to): array
    {
        $rows = Order::query()
            ->whereBetween('created_at', [$from, $to->endOfDay()])
            ->selectRaw('status, COUNT(*) AS total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $result = [];

        foreach (OrderStatus::values() as $status) {
            $result[$status] = (int) ($rows[$status] ?? 0);
        }

        return $result;
    }

    private function revenueByDay(CarbonImmutable $from, CarbonImmutable $to): array
    {
        $rows = $this->revenueOrdersQuery($from, $to)
            ->selectRaw('DATE(created_at) AS day, COALESCE(SUM(total), 0) AS revenue, COUNT(*) AS orders_count')
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->keyBy('day');

        $result = [];

        for ($day = $from; $day->lessThanOrEqualTo($to); $day = $day->addDay()) {
            $key = $day->toDateString();
            $row = $rows->get($key);

            $result[] = [
                'date' => $key,
                'revenue' => (float) ($row->revenue ?? 0),
                'orders_count' => (int) ($row->orders_count ?? 0),
            ];
        }

        return $result;
    }

    private function topProducts(CarbonImmutable $from, CarbonImmutable $to): array
    {
        return OrderItem::query()
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->whereNull('orders.deleted_at')
            ->where('orders.status', '!=', OrderStatus::Cancelled->value)
            ->whereBetween('orders.created_at', [$from, $to->endOfDay()])
            ->groupBy('order_items.product_id', 'order_items.product_name', 'order_items.product_slug', 'order_items.product_image')
            ->selectRaw('order_items.product_id, order_items.product_name, order_items.product_slug, order_items.product_image')
            ->selectRaw('SUM(order_items.quantity) AS total_quantity, COALESCE(SUM(order_items.line_total), 0) AS total_revenue')
            ->orderByDesc(DB::raw('SUM(order_items.quantity)'))
            ->limit(self::TOP_PRODUCTS_LIMIT)
            ->get()
            ->map(fn ($row) => [
                'product_id' => $row->product_id !== null ? (int) $row->product_id : null,
                'product_name' => $row->product_name,
                'product_slug' => $row->product_slug,
                'product_image' => $row->product_image,
                'total_quantity' => (int) $row->total_quantity,
                'total_revenue' => (float) $row->total_revenue,
            ])
            ->all();
    }

    private function recentOrders(): array
    {
        return Order::query()
            ->orderByDesc('created_at')
            ->limit(self::RECENT_ORDERS_LIMIT)
            ->get()
            ->map(fn (Order $order) => [
                'id' => $order->id,
                'order_code' => $order->order_code,
                'customer_name' => $order->customer_name,
                'status' => $order->status?->value,
                'payment_status' => $order->payment_status?->value,
                'total' => (float) $order->total,
                'created_at' => $order->created_at?->toISOString(),
            ])
            ->all();
    }

    private function lowStockProducts(): array
    {
        return Product::query()
            ->where('status', ProductStatus::Active->value)
            ->where('stock', '<=', self::LOW_STOCK_THRESHOLD)
            ->orderBy('stock')
            ->limit(self::LOW_STOCK_LIMIT)
            ->get()
            ->map(fn (Product $product) => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'sku' => $product->sku,
                'image' => $product->image,
                'stock' => (int) $product->stock,
            ])
            ->all();
    }

    private function revenueOrdersQuery(CarbonImmutable $from, CarbonImmutable $to)
    {
        return Order::query()
            ->where('status', '!=', OrderStatus::Cancelled->value)
            ->whereBetween('created_at', [$from, $to->endOfDay()]);
    }
}
