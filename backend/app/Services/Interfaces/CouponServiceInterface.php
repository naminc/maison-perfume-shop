<?php

namespace App\Services\Interfaces;

use App\Models\Coupon;
use App\Models\User;

interface CouponServiceInterface
{
    public function getPaginated(array $filters): array;

    public function getById(int $id): array;

    public function create(array $data): array;

    public function update(int $id, array $data): array;

    public function delete(int $id): array;

    public function validateForCheckout(User $user, array $payload): array;

    public function previewForOrder(User $user, ?string $code, float $subtotal, float $shippingFee, bool $lock = false): array;

    public function markAsUsed(Coupon $coupon): void;

    public function restoreUsageByCode(?string $code): void;
}
