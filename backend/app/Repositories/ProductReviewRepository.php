<?php

namespace App\Repositories;

use App\Enums\OrderStatus;
use App\Enums\ProductReviewStatus;
use App\Models\OrderItem;
use App\Models\ProductReview;
use App\Repositories\Interfaces\ProductReviewRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class ProductReviewRepository implements ProductReviewRepositoryInterface
{
    public function __construct(protected ProductReview $model) {}

    public function paginateAdmin(array $filters): LengthAwarePaginator
    {
        $perPage = $this->resolvePerPage($filters);

        return $this->baseFilteredQuery($filters)
            ->with(['product:id,name,slug,image', 'user:id,full_name,email', 'order:id,order_code', 'orderItem:id,product_name'])
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function paginatePublicByProduct(int $productId, array $filters): LengthAwarePaginator
    {
        $perPage = $this->resolvePerPage($filters, 6);

        return $this->model
            ->newQuery()
            ->approved()
            ->forProduct($productId)
            ->with(['user:id,full_name'])
            ->orderByDesc('approved_at')
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function paginateByUser(int $userId, array $filters): LengthAwarePaginator
    {
        $perPage = $this->resolvePerPage($filters);

        return $this->baseFilteredQuery($filters)
            ->where('user_id', $userId)
            ->with(['product:id,name,slug,image', 'order:id,order_code', 'orderItem:id,product_name'])
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function findById(int $id): ?ProductReview
    {
        return $this->model
            ->newQuery()
            ->with(['product:id,name,slug,image', 'user:id,full_name,email', 'order:id,order_code', 'orderItem:id,product_name'])
            ->find($id);
    }

    public function create(array $data): ProductReview
    {
        return $this->model
            ->create($data)
            ->fresh(['product:id,name,slug,image', 'user:id,full_name,email', 'order:id,order_code', 'orderItem:id,product_name']);
    }

    public function update(ProductReview $review, array $data): ProductReview
    {
        $review->update($data);

        return $review->fresh(['product:id,name,slug,image', 'user:id,full_name,email', 'order:id,order_code', 'orderItem:id,product_name']);
    }

    public function delete(ProductReview $review): bool
    {
        return (bool) $review->delete();
    }

    public function hasUserReviewedOrderItem(int $userId, int $orderItemId): bool
    {
        return $this->model
            ->newQuery()
            ->withTrashed()
            ->where('user_id', $userId)
            ->where('order_item_id', $orderItemId)
            ->exists();
    }

    public function getReviewableOrderItem(int $userId, int $orderItemId, int $productId): ?OrderItem
    {
        return OrderItem::query()
            ->with(['order:id,user_id,status,order_code', 'product:id,name,slug,image'])
            ->whereKey($orderItemId)
            ->where('product_id', $productId)
            ->whereHas('order', function ($query) use ($userId) {
                $query
                    ->where('user_id', $userId)
                    ->where('status', OrderStatus::Completed->value);
            })
            ->first();
    }

    public function getReviewableItems(int $userId): array
    {
        return OrderItem::query()
            ->with(['order:id,user_id,status,order_code,completed_at,created_at', 'product:id,name,slug,image'])
            ->whereNotNull('product_id')
            ->whereHas('order', function ($query) use ($userId) {
                $query
                    ->where('user_id', $userId)
                    ->where('status', OrderStatus::Completed->value);
            })
            ->whereDoesntHave('review', fn ($query) => $query->where('user_id', $userId))
            ->orderByDesc(
                DB::raw('(select created_at from orders where orders.id = order_items.order_id limit 1)')
            )
            ->get()
            ->map(fn (OrderItem $item) => [
                'order_item_id' => $item->id,
                'order_id'      => $item->order_id,
                'order_code'    => $item->order?->order_code,
                'product_id'    => $item->product_id,
                'product_name'  => $item->product_name,
                'product_slug'  => $item->product_slug,
                'product_image' => $item->product_image ?: $item->product?->image,
                'brand_name'    => $item->brand_name,
                'quantity'      => $item->quantity,
                'completed_at'  => $item->order?->completed_at ?? $item->order?->created_at,
            ])
            ->values()
            ->all();
    }

    public function getProductRatingSummary(int $productId): array
    {
        $rows = $this->model
            ->newQuery()
            ->approved()
            ->where('product_id', $productId)
            ->selectRaw('count(*) as rating_count, avg(rating) as rating_average')
            ->first();

        return [
            'rating_average' => $rows?->rating_average ? round((float) $rows->rating_average, 1) : 0.0,
            'rating_count'   => (int) ($rows?->rating_count ?? 0),
        ];
    }

    private function baseFilteredQuery(array $filters)
    {
        return $this->model
            ->newQuery()
            ->when(! empty($filters['search']), function ($query) use ($filters) {
                $search = trim((string) $filters['search']);

                $query->where(function ($query) use ($search) {
                    $query
                        ->where('title', 'like', "%{$search}%")
                        ->orWhere('content', 'like', "%{$search}%")
                        ->orWhereHas('product', fn ($query) => $query->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('user', fn ($query) => $query->where('full_name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"));
                });
            })
            ->when(! empty($filters['status']) && in_array($filters['status'], ProductReviewStatus::values(), true), function ($query) use ($filters) {
                $query->where('status', $filters['status']);
            })
            ->when(! empty($filters['rating']), function ($query) use ($filters) {
                $query->where('rating', (int) $filters['rating']);
            })
            ->when(! empty($filters['product_id']), fn ($query) => $query->where('product_id', (int) $filters['product_id']));
    }

    private function resolvePerPage(array $filters, int $default = 10): int
    {
        $perPage = (int) ($filters['per_page'] ?? $default);

        return max(1, min($perPage, 100));
    }
}
