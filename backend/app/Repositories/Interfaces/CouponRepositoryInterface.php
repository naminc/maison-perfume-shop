<?php

namespace App\Repositories\Interfaces;

use App\Models\Coupon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface CouponRepositoryInterface
{
    public function paginate(array $filters): LengthAwarePaginator;

    public function findById(int $id): ?Coupon;

    public function findByCode(string $code, bool $lock = false): ?Coupon;

    public function create(array $data): Coupon;

    public function update(Coupon $coupon, array $data): Coupon;

    public function delete(Coupon $coupon): bool;

    public function codeExists(string $code, ?int $ignoreId = null): bool;

    public function incrementUsedCount(Coupon $coupon): void;

    public function decrementUsedCount(Coupon $coupon): void;
}
