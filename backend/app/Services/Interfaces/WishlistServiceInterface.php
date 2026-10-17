<?php

namespace App\Services\Interfaces;

use App\Models\User;

interface WishlistServiceInterface
{
    public function getForUser(User $user): array;

    public function toggle(User $user, int $productId): array;

    public function remove(User $user, int $productId): array;
}
