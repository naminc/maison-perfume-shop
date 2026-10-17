<?php

namespace App\Repositories;

use App\Models\Product;
use App\Models\Wishlist;
use App\Repositories\Interfaces\WishlistRepositoryInterface;
use Illuminate\Support\Collection;

class WishlistRepository implements WishlistRepositoryInterface
{
    public function __construct(protected Wishlist $model) {}

    public function productsForUser(int $userId): Collection
    {
        $wishlists = $this->model
            ->newQuery()
            ->where('user_id', $userId)
            ->orderByDesc('created_at')
            ->pluck('product_id');

        if ($wishlists->isEmpty()) {
            return collect();
        }

        $products = Product::query()
            ->with(['brand:id,name,slug', 'category:id,name,slug'])
            ->withCount('approvedReviews as rating_count')
            ->withAvg('approvedReviews as rating_average', 'rating')
            ->active()
            ->whereIn('id', $wishlists)
            ->get()
            ->keyBy('id');

        return $wishlists
            ->map(fn ($productId) => $products->get($productId))
            ->filter()
            ->values();
    }

    public function find(int $userId, int $productId): ?Wishlist
    {
        return $this->model
            ->newQuery()
            ->where('user_id', $userId)
            ->where('product_id', $productId)
            ->first();
    }

    public function create(int $userId, int $productId): Wishlist
    {
        return $this->model->firstOrCreate([
            'user_id' => $userId,
            'product_id' => $productId,
        ]);
    }

    public function delete(Wishlist $wishlist): bool
    {
        return (bool) $wishlist->delete();
    }
}
