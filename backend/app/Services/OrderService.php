<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\ProductStatus;
use App\Models\Order;
use App\Models\Product;
use App\Models\Province;
use App\Models\User;
use App\Models\Ward;
use App\Notifications\Order\OrderPlacedNotification;
use App\Notifications\Order\OrderStatusUpdatedNotification;
use App\Repositories\Interfaces\OrderRepositoryInterface;
use App\Services\Interfaces\CouponServiceInterface;
use App\Services\Interfaces\OrderServiceInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\ValidationException;
use Throwable;

class OrderService extends BaseService implements OrderServiceInterface
{
    private const STANDARD_SHIPPING_METHOD = 'standard';
    private const EXPRESS_SHIPPING_METHOD = 'express';
    private const FREE_SHIPPING_THRESHOLD = 500000;
    private const STANDARD_SHIPPING_FEE = 30000;
    private const EXPRESS_SHIPPING_FEE = 60000;

    private const STATUS_TRANSITIONS = [
        'pending'    => ['confirmed', 'cancelled'],
        'confirmed'  => ['processing', 'cancelled'],
        'processing' => ['shipping'],
        'shipping'   => ['completed'],
        'completed'  => [],
        'cancelled'  => [],
    ];

    public function __construct(
        protected OrderRepositoryInterface $orderRepository,
        protected CouponServiceInterface $couponService,
    ) {}

    public function createFromCheckout(User $user, array $payload): array
    {
        $result = $this->executeTransaction(function () use ($user, $payload) {
            $items = $this->normalizeItems($payload['items'] ?? []);
            $products = $this->lockProductsForItems($items);
            $province = Province::query()->find((string) $payload['province_code']);
            $ward = Ward::query()
                ->where('code', (string) $payload['ward_code'])
                ->where('province_code', (string) $payload['province_code'])
                ->first();

            [$orderItems, $subtotal] = $this->buildOrderItems($items, $products);
            $shippingFee = $this->calculateShippingFee($payload['shipping_method'] ?? self::STANDARD_SHIPPING_METHOD, $subtotal);
            $couponPreview = $this->couponService->previewForOrder(
                $user,
                $payload['coupon_code'] ?? null,
                $subtotal,
                $shippingFee,
                true,
            );
            $couponCode = $couponPreview['coupon_code'];
            $discountTotal = $couponPreview['discount_total'];
            $total = max(0, $subtotal + $shippingFee - $discountTotal);

            $order = $this->orderRepository->create([
                'user_id'          => $user->id,
                'order_code'       => $this->orderRepository->generateOrderCode(),
                'customer_name'    => trim((string) $payload['customer_name']),
                'customer_email'   => $this->nullableString($payload['customer_email'] ?? null),
                'customer_phone'   => trim((string) $payload['customer_phone']),
                'province_code'    => $province?->code,
                'province_name'    => $province?->full_name,
                'ward_code'        => $ward?->code,
                'ward_name'        => $this->formatWardDisplayName($ward, $province),
                'shipping_address' => trim((string) $payload['shipping_address']),
                'note'             => $this->nullableString($payload['note'] ?? null),
                'payment_method'   => $payload['payment_method'] ?? PaymentMethod::Cod->value,
                'payment_status'   => PaymentStatus::Unpaid->value,
                'status'           => OrderStatus::Pending->value,
                'subtotal'         => $subtotal,
                'discount_total'   => $discountTotal,
                'shipping_fee'     => $shippingFee,
                'total'            => $total,
                'coupon_code'      => $couponCode,
            ]);

            $order->items()->createMany($orderItems);

            foreach ($items as $productId => $quantity) {
                $products->get($productId)->decrement('stock', $quantity);
            }

            if ($couponPreview['coupon']) {
                $this->couponService->markAsUsed($couponPreview['coupon']);
            }

            return $this->orderRepository->getOrderWithItems($order);
        }, 'createFromCheckout');

        if ($result['ok']) {
            $this->notifyOrderPlaced($result['data']);
        }

        return $result;
    }

    private function formatWardDisplayName(?Ward $ward, ?Province $province): ?string
    {
        if (! $ward) {
            return null;
        }

        $wardName = trim($ward->full_name ?: $ward->name);
        $provinceName = trim((string) ($province?->full_name ?? ''));
        $suffix = ", {$provinceName}";

        if ($provinceName !== '' && str_ends_with($wardName, $suffix)) {
            return trim(substr($wardName, 0, -strlen($suffix)));
        }

        return $wardName;
    }

    public function getUserOrders(User $user, array $filters): array
    {
        return $this->executeSafe(function () use ($user, $filters) {
            return $this->orderRepository->paginateByUser($user->id, $filters);
        }, 'getUserOrders');
    }

    public function getUserOrder(User $user, string $order): array
    {
        return $this->executeSafe(function () use ($user, $order) {
            $found = $this->resolveOrder($order);

            if (! $found || $found->user_id !== $user->id) {
                return ['found' => false];
            }

            return ['found' => true, 'order' => $found];
        }, 'getUserOrder');
    }

    public function cancelUserOrder(User $user, string $order): array
    {
        $statusChanged = false;

        $result = $this->executeTransaction(function () use ($user, $order, &$statusChanged) {
            $found = $this->resolveLockedOrder($order);

            if (! $found) {
                return ['found' => false, 'forbidden' => false];
            }

            if ($found->user_id !== $user->id) {
                return ['found' => true, 'forbidden' => true];
            }

            $statusChanged = $this->statusValue($found) !== OrderStatus::Cancelled->value;

            return [
                'found' => true,
                'forbidden' => false,
                'order' => $this->transitionOrder($found, OrderStatus::Cancelled->value),
            ];
        }, 'cancelUserOrder');

        if ($result['ok'] && $statusChanged && ($result['data']['found'] ?? false) && ! ($result['data']['forbidden'] ?? false)) {
            $this->notifyOrderStatusUpdated($result['data']['order']);
        }

        return $result;
    }

    public function getPaginated(array $filters): array
    {
        return $this->executeSafe(function () use ($filters) {
            return $this->orderRepository->paginate($filters);
        }, 'getPaginated');
    }

    public function getByIdOrCode(string $order): array
    {
        return $this->executeSafe(function () use ($order) {
            return $this->resolveOrder($order);
        }, 'getByIdOrCode');
    }

    public function updateStatus(string $order, array $data): array
    {
        $statusChanged = false;

        $result = $this->executeTransaction(function () use ($order, $data, &$statusChanged) {
            $found = $this->resolveLockedOrder($order);

            if (! $found) {
                return ['found' => false];
            }

            $nextStatus = (string) $data['status'];
            $statusChanged = $this->statusValue($found) !== $nextStatus;

            return [
                'found' => true,
                'order' => $this->transitionOrder($found, $nextStatus),
            ];
        }, 'updateStatus');

        if ($result['ok'] && $statusChanged && ($result['data']['found'] ?? false)) {
            $this->notifyOrderStatusUpdated($result['data']['order']);
        }

        return $result;
    }

    public function delete(string $order): array
    {
        return $this->executeTransaction(function () use ($order) {
            $found = $this->resolveOrder($order);

            if (! $found) {
                return ['found' => false];
            }

            $this->orderRepository->delete($found);

            return ['found' => true, 'deleted' => true];
        }, 'delete');
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
                'items' => 'Vui lòng chọn ít nhất một sản phẩm để đặt hàng.',
            ]);
        }

        return $normalized;
    }

    private function lockProductsForItems(array $items): Collection
    {
        return Product::query()
            ->with(['brand:id,name', 'category:id,name'])
            ->whereIn('id', array_keys($items))
            ->lockForUpdate()
            ->get()
            ->keyBy('id');
    }

    private function buildOrderItems(array $items, Collection $products): array
    {
        $orderItems = [];
        $subtotal = 0.0;

        foreach ($items as $productId => $quantity) {
            /** @var Product|null $product */
            $product = $products->get($productId);

            if (! $product) {
                throw ValidationException::withMessages([
                    'items' => "Sản phẩm #{$productId} không tồn tại.",
                ]);
            }

            if ($this->statusValue($product) !== ProductStatus::Active->value) {
                throw ValidationException::withMessages([
                    'items' => "Sản phẩm {$product->name} đang tạm ẩn.",
                ]);
            }

            if ($product->stock < $quantity) {
                throw ValidationException::withMessages([
                    'items' => "Sản phẩm {$product->name} chỉ còn {$product->stock} sản phẩm trong kho.",
                ]);
            }

            $unitPrice = (float) ($product->sale_price ?? $product->price);
            $originalPrice = (float) $product->price;
            $lineTotal = $unitPrice * $quantity;
            $subtotal += $lineTotal;

            $orderItems[] = [
                'product_id'     => $product->id,
                'product_name'   => $product->name,
                'product_slug'   => $product->slug,
                'product_sku'    => $product->sku,
                'product_image'  => $product->image,
                'brand_name'     => $product->brand?->name,
                'category_name'  => $product->category?->name,
                'volume_ml'      => $product->volume_ml,
                'concentration'  => $product->concentration,
                'unit_price'     => $unitPrice,
                'original_price' => $originalPrice,
                'quantity'       => $quantity,
                'line_total'     => $lineTotal,
            ];
        }

        return [$orderItems, $subtotal];
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

    private function restoreStock(Order $order): void
    {
        foreach ($order->items as $item) {
            if (! $item->product_id) {
                continue;
            }

            Product::withTrashed()
                ->whereKey($item->product_id)
                ->lockForUpdate()
                ->increment('stock', $item->quantity);
        }
    }

    private function transitionOrder(Order $order, string $nextStatus): Order
    {
        $currentStatus = $this->statusValue($order);

        if ($currentStatus === $nextStatus) {
            return $this->orderRepository->getOrderWithItems($order);
        }

        if (! in_array($nextStatus, self::STATUS_TRANSITIONS[$currentStatus] ?? [], true)) {
            throw ValidationException::withMessages([
                'status' => 'Không thể chuyển trạng thái đơn hàng theo luồng này.',
            ]);
        }

        $updateData = ['status' => $nextStatus];

        if ($nextStatus === OrderStatus::Cancelled->value) {
            $this->restoreStock($order);
            $this->couponService->restoreUsageByCode($order->coupon_code);
            $updateData['cancelled_at'] = now();
        }

        if ($nextStatus === OrderStatus::Completed->value) {
            $updateData['completed_at'] = now();

            if ($this->paymentMethodValue($order) === PaymentMethod::Cod->value) {
                $updateData['payment_status'] = PaymentStatus::Paid->value;
            }
        }

        return $this->orderRepository->update($order, $updateData);
    }

    private function notifyOrderPlaced(Order $order): void
    {
        $this->notifyOrderRecipient($order, new OrderPlacedNotification($order), 'notifyOrderPlaced');
    }

    private function notifyOrderStatusUpdated(Order $order): void
    {
        $this->notifyOrderRecipient($order, new OrderStatusUpdatedNotification($order), 'notifyOrderStatusUpdated');
    }

    private function notifyOrderRecipient(Order $order, object $notification, string $context): void
    {
        $email = $this->orderRecipientEmail($order);

        if (! $email) {
            $this->logWarning('Skip order email notification because recipient email is missing or invalid.', [
                'order_id' => $order->id,
                'order_code' => $order->order_code,
                'context' => $context,
            ]);

            return;
        }

        try {
            Notification::route('mail', $email)->notify($notification);
        } catch (Throwable $e) {
            $this->logError($e, $context);
        }
    }

    private function orderRecipientEmail(Order $order): ?string
    {
        $order->loadMissing(['user:id,email']);

        foreach ([$order->customer_email, $order->user?->email] as $email) {
            if (is_string($email) && filter_var($email, FILTER_VALIDATE_EMAIL)) {
                return $email;
            }
        }

        return null;
    }

    private function resolveOrder(string $order): ?Order
    {
        if (ctype_digit($order)) {
            return $this->orderRepository->findById((int) $order);
        }

        return $this->orderRepository->findByCode($order);
    }

    private function resolveLockedOrder(string $order): ?Order
    {
        return Order::query()
            ->with(['items'])
            ->when(ctype_digit($order), fn ($query) => $query->whereKey((int) $order), fn ($query) => $query->where('order_code', $order))
            ->lockForUpdate()
            ->first();
    }

    private function nullableString(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $value = trim($value);

        return $value === '' ? null : $value;
    }

    private function statusValue(object $model): string
    {
        return $this->enumValue($model->status);
    }

    private function paymentMethodValue(Order $order): string
    {
        return $this->enumValue($order->payment_method);
    }

    private function enumValue(mixed $value): string
    {
        return $value instanceof \BackedEnum ? (string) $value->value : (string) $value;
    }
}
