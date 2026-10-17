<?php

namespace App\Repositories\Interfaces;

use App\Models\Wishlist;
use Illuminate\Support\Collection;

interface WishlistRepositoryInterface
{
    public function productsForUser(int $userId): Collection;

    public function find(int $userId, int $productId): ?Wishlist;

    public function create(int $userId, int $productId): Wishlist;

    public function delete(Wishlist $wishlist): bool;
}
