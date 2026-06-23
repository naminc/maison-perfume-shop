<?php

namespace App\Services;

use App\Enums\CouponStatus;
use App\Enums\CouponType;
use App\Enums\OrderStatus;
use App\Enums\ProductStatus;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Repositories\Interfaces\CouponRepositoryInterface;
use App\Services\Interfaces\CouponServiceInterface;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class CouponService extends BaseService implements CouponServiceInterface
{
    private const STANDARD_SHIPPING_METHOD = 'standard';
    private const EXPRESS_SHIPPING_METHOD = 'express';
    private const FREE_SHIPPING_THRESHOLD = 500000;
    private const STANDARD_SHIPPING_FEE = 30000;
    private const EXPRESS_SHIPPING_FEE = 60000;

    public function __construct(
        protected CouponRepositoryInterface $couponRepository,
    ) {}

    public function getPaginated(array $filters): array
    {
        return $this->executeSafe(function () use ($filters) {
            return $this->couponRepository->paginate($filters);
        }, 'getPaginated');
    }

    public function getById(int $id): array
    {
        return $this->executeSafe(function () use ($id) {
            return $this->couponRepository->findById($id);
        }, 'getById');
    }

    public function create(array $data): array
    {
        return $this->executeTransaction(function () use ($data) {
            return $this->couponRepository->create($this->preparePayload($data));
        }, 'create');
    }

    public function update(int $id, array $data): array
    {
        return $this->executeTransaction(function () use ($id, $data) {
            $coupon = $this->couponRepository->findById($id);

            if (! $coupon) {
                return ['found' => false];
            }

            return [
                'found' => true,
                'coupon' => $this->couponRepository->update($coupon, $this->preparePayload($data)),
            ];
        }, 'update');
    }

    public function delete(int $id): array
    {
        return $this->executeTransaction(function () use ($id) {
            $coupon = $this->couponRepository->findById($id);

            if (! $coupon) {
                return ['found' => false];
            }

            $this->couponRepository->delete($coupon);

            return ['found' => true, 'deleted' => true];
        }, 'delete');
    }

    public function validateForCheckout(User $user, array $payload): array
    {
        return $this->executeSafe(function () use ($user, $payload) {
            $items = $this->normalizeItems($payload['items'] ?? []);
            $products = $this->productsForItems($items);
            $subtotal = $this->calculateSubtotal($items, $products);
            $shippingFee = $this->calculateShippingFee((string) ($payload['shipping_method'] ?? self::STANDARD_SHIPPING_METHOD), $subtotal);
            $preview = $this->previewForOrder($user, (string) $payload['code'], $subtotal, $shippingFee);

            return [
                'coupon' => $this->couponPayload($preview['coupon']),
                'subtotal' => $subtotal,
                'shipping_fee' => $shippingFee,
                'discount_total' => $preview['discount_total'],
                'total' => max(0, $subtotal + $shippingFee - $preview['discount_total']),
            ];
        }, 'validateForCheckout');
    }

    public function previewForOrder(User $user, ?string $code, float $subtotal, float $shippingFee, bool $lock = false): array
    {
        $code = $this->normalizeCode($code);

        if (! $code) {
            return [
                'coupon' => null,
                'coupon_code' => null,
                'discount_total' => 0.0,
            ];
        }

        $coupon = $this->couponRepository->findByCode($code, $lock);

        if (! $coupon) {
            throw ValidationException::withMessages([
                'coupon_code' => ['Mã giảm giá không tồn tại.'],
            ]);
        }

        $this->assertCouponCanBeUsed($coupon, $user, $subtotal);

        return [
            'coupon' => $coupon,
            'coupon_code' => $coupon->code,
            'discount_total' => $this->calculateDiscount($coupon, $subtotal, $shippingFee),
        ];
    }

    public function markAsUsed(Coupon $coupon): void
    {
        $this->couponRepository->incrementUsedCount($coupon);
    }

    public function restoreUsageByCode(?string $code): void
    {
        $code = $this->normalizeCode($code);

        if (! $code) {
            return;
        }

        $coupon = $this->couponRepository->findByCode($code, true);

        if ($coupon) {
            $this->couponRepository->decrementUsedCount($coupon);
        }
    }

    private function preparePayload(array $data): array
    {
        $type = (string) $data['type'];

        return [
            'code' => $this->normalizeCode($data['code'] ?? '') ?? '',
            'name' => trim((string) $data['name']),
            'description' => $this->nullableString($data['description'] ?? null),
            'type' => $type,
            'value' => $type === CouponType::FreeShipping->value ? null : $this->nullableFloat($data['value'] ?? null),
            'min_order_amount' => max(0, (float) ($data['min_order_amount'] ?? 0)),
            'max_discount_amount' => $type === CouponType::Percent->value ? $this->nullableFloat($data['max_discount_amount'] ?? null) : null,
            'usage_limit' => $this->nullableInt($data['usage_limit'] ?? null),
            'per_user_limit' => $this->nullableInt($data['per_user_limit'] ?? null),
            'starts_at' => $data['starts_at'] ?? null,
            'expires_at' => $data['expires_at'] ?? null,
            'status' => $data['status'] ?? CouponStatus::Active->value,
        ];
    }

    private function assertCouponCanBeUsed(Coupon $coupon, User $user, float $subtotal): void
    {
        if ($coupon->status !== CouponStatus::Active) {
            throw ValidationException::withMessages([
                'coupon_code' => ['Mã giảm giá đang tạm tắt.'],
            ]);
        }

        if (! $coupon->isStarted()) {
            throw ValidationException::withMessages([
                'coupon_code' => ['Mã giảm giá chưa đến thời gian sử dụng.'],
            ]);
        }

        if ($coupon->isExpired()) {
            throw ValidationException::withMessages([
                'coupon_code' => ['Mã giảm giá đã hết hạn.'],
            ]);
        }

        if (! $coupon->hasUsageLeft()) {
            throw ValidationException::withMessages([
                'coupon_code' => ['Mã giảm giá đã hết lượt sử dụng.'],
            ]);
        }

        if ($subtotal < (float) $coupon->min_order_amount) {
            throw ValidationException::withMessages([
                'coupon_code' => ['Đơn hàng chưa đạt giá trị tối thiểu để dùng mã này.'],
            ]);
        }

        if ($coupon->per_user_limit !== null && $this->userUsageCount($coupon, $user) >= $coupon->per_user_limit) {
            throw ValidationException::withMessages([
                'coupon_code' => ['Bạn đã dùng hết lượt của mã giảm giá này.'],
            ]);
        }
    }

    private function calculateDiscount(Coupon $coupon, float $subtotal, float $shippingFee): float
    {
        $type = $this->enumValue($coupon->type);

        if ($type === CouponType::FreeShipping->value) {
            return max(0, $shippingFee);
        }

        if ($type === CouponType::Fixed->value) {
            return min($subtotal, max(0, (float) $coupon->value));
        }

        if ($type === CouponType::Percent->value) {
            $discount = round($subtotal * max(0, (float) $coupon->value) / 100);

            if ($coupon->max_discount_amount !== null) {
                $discount = min($discount, (float) $coupon->max_discount_amount);
            }

            return min($subtotal, $discount);
        }

        return 0.0;
    }

    private function userUsageCount(Coupon $coupon, User $user): int
    {
        return Order::query()
            ->where('user_id', $user->id)
            ->where('coupon_code', $coupon->code)
            ->where('status', '!=', OrderStatus::Cancelled->value)
            ->count();
    }

    private function normalizeItems(array $items): array
    {
        $normalized = [];

        foreach ($items as $item) {
            $productId = (int) ($item['product_id'] ?? 0);
            $quantity = (int) ($item['quantity'] ?? 0);

            if ($productId <= 0 || $quantity <= 0) {
                continue;
            }

            $normalized[$productId] = ($normalized[$productId] ?? 0) + $quantity;
        }

        if ($normalized === []) {
            throw ValidationException::withMessages([
                'items' => ['Vui lòng chọn ít nhất một sản phẩm để áp dụng mã giảm giá.'],
            ]);
        }

        return $normalized;
    }

    private function productsForItems(array $items): Collection
    {
        return Product::query()
            ->whereIn('id', array_keys($items))
            ->get()
            ->keyBy('id');
    }

    private function calculateSubtotal(array $items, Collection $products): float
    {
        $subtotal = 0.0;

        foreach ($items as $productId => $quantity) {
            /** @var Product|null $product */
            $product = $products->get($productId);

            if (! $product) {
                throw ValidationException::withMessages([
                    'items' => ["Sản phẩm #{$productId} không tồn tại."],
                ]);
            }

            if ($this->enumValue($product->status) !== ProductStatus::Active->value) {
                throw ValidationException::withMessages([
                    'items' => ["Sản phẩm {$product->name} đang tạm ẩn."],
                ]);
            }

            if ($product->stock < $quantity) {
                throw ValidationException::withMessages([
                    'items' => ["Sản phẩm {$product->name} chỉ còn {$product->stock} sản phẩm trong kho."],
                ]);
            }

            $subtotal += (float) ($product->sale_price ?? $product->price) * $quantity;
        }

        return $subtotal;
    }

    private function calculateShippingFee(string $shippingMethod, float $subtotal): float
    {
        if ($shippingMethod === self::EXPRESS_SHIPPING_METHOD) {
            return self::EXPRESS_SHIPPING_FEE;
        }

        if ($subtotal >= self::FREE_SHIPPING_THRESHOLD) {
            return 0.0;
        }

        return self::STANDARD_SHIPPING_FEE;
    }

    private function couponPayload(?Coupon $coupon): ?array
    {
        if (! $coupon) {
            return null;
        }

        return [
            'id' => $coupon->id,
            'code' => $coupon->code,
            'name' => $coupon->name,
            'description' => $coupon->description,
            'type' => $this->enumValue($coupon->type),
            'value' => $coupon->value,
            'min_order_amount' => $coupon->min_order_amount,
            'max_discount_amount' => $coupon->max_discount_amount,
        ];
    }

    private function normalizeCode(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $value = strtoupper(trim($value));

        return $value === '' ? null : $value;
    }

    private function nullableString(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $value = trim($value);

        return $value === '' ? null : $value;
    }

    private function nullableFloat(mixed $value): ?float
    {
        if ($value === null || $value === '') {
            return null;
        }

        return (float) $value;
    }

    private function nullableInt(mixed $value): ?int
    {
        if ($value === null || $value === '' || $value === 0 || $value === '0') {
            return null;
        }

        return (int) $value;
    }

    private function enumValue(mixed $value): string
    {
        return $value instanceof \BackedEnum ? (string) $value->value : (string) $value;
    }
}
