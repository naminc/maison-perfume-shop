<?php

namespace App\Services;

use App\Enums\StockMovementType;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\PurchaseOrder;
use App\Models\StockMovement;
use App\Models\User;
use App\Repositories\Interfaces\StockMovementRepositoryInterface;
use App\Services\Interfaces\InventoryServiceInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class InventoryService extends BaseService implements InventoryServiceInterface
{
    public function __construct(
        protected StockMovementRepositoryInterface $stockMovementRepository,
    ) {}

    public function getMovements(array $filters): array
    {
        return $this->executeSafe(fn () => $this->stockMovementRepository->paginate($filters), 'getMovements');
    }

    public function getProductMovements(int $productId, array $filters): array
    {
        return $this->executeSafe(function () use ($productId, $filters) {
            $product = Product::query()->find($productId);

            if (! $product) {
                return ['found' => false];
            }

            return [
                'found' => true,
                'product' => $product->load(['brand:id,name', 'variants']),
                'movements' => $this->stockMovementRepository->getByProduct($productId, $filters),
            ];
        }, 'getProductMovements');
    }

    public function getVariantMovements(int $variantId, array $filters): array
    {
        return $this->executeSafe(function () use ($variantId, $filters) {
            $variant = ProductVariant::query()->with('product:id,name,slug,image')->find($variantId);

            if (! $variant) {
                return ['found' => false];
            }

            return [
                'found' => true,
                'variant' => $variant,
                'movements' => $this->stockMovementRepository->getByVariant($variantId, $filters),
            ];
        }, 'getVariantMovements');
    }

    public function adjustStock(ProductVariant $variant, int $quantity, string $type, ?User $user, ?string $note, ?string $reference = null): array
    {
        return $this->executeTransaction(function () use ($variant, $quantity, $type, $user, $note, $reference) {
            $delta = match ($type) {
                StockMovementType::Import->value => abs($quantity),
                StockMovementType::Export->value => -abs($quantity),
                StockMovementType::Adjustment->value => $quantity,
                default => throw ValidationException::withMessages(['type' => ['Loại điều chỉnh tồn kho không hợp lệ.']]),
            };

            return $this->applyMovement($variant, $delta, $type, $user, null, $reference, $note);
        }, 'adjustStock');
    }

    public function decreaseForOrder(ProductVariant $variant, int $quantity, Order $order): StockMovement
    {
        return $this->applyMovement(
            $variant,
            -abs($quantity),
            StockMovementType::Order->value,
            $order->user,
            $order,
            $order->order_code,
            'Xuất kho cho đơn hàng.',
        );
    }

    public function restoreForCancelledOrder(ProductVariant $variant, int $quantity, Order $order): StockMovement
    {
        return $this->applyMovement(
            $variant,
            abs($quantity),
            StockMovementType::OrderCancelled->value,
            $order->user,
            $order,
            $order->order_code,
            'Hoàn kho do huỷ đơn hàng.',
        );
    }

    public function importForPurchaseOrder(ProductVariant $variant, int $quantity, PurchaseOrder $purchaseOrder, User $user): StockMovement
    {
        return $this->applyMovement(
            $variant,
            abs($quantity),
            StockMovementType::Import->value,
            $user,
            null,
            $purchaseOrder->code,
            'Nhập kho từ phiếu nhập '.$purchaseOrder->code.'.',
        );
    }

    private function applyMovement(
        ProductVariant $variant,
        int $quantity,
        string $type,
        ?User $user,
        ?Order $order,
        ?string $reference,
        ?string $note,
    ): StockMovement {
        if ($quantity === 0) {
            throw ValidationException::withMessages(['quantity' => ['Số lượng thay đổi phải khác 0.']]);
        }

        return DB::transaction(function () use ($variant, $quantity, $type, $user, $order, $reference, $note) {
            $lockedVariant = ProductVariant::withTrashed()->lockForUpdate()->find($variant->id);

            if (! $lockedVariant) {
                throw ValidationException::withMessages(['product_variant' => ['Phiên bản sản phẩm không tồn tại.']]);
            }

            $stockBefore = (int) $lockedVariant->stock;
            $stockAfter = $stockBefore + $quantity;

            if ($stockAfter < 0) {
                throw ValidationException::withMessages([
                    'quantity' => ["Tồn kho hiện tại chỉ còn {$stockBefore}, không đủ để xuất ".abs($quantity).' sản phẩm.'],
                ]);
            }

            $lockedVariant->forceFill(['stock' => $stockAfter])->save();

            return $this->stockMovementRepository->create([
                'product_id' => $lockedVariant->product_id,
                'product_variant_id' => $lockedVariant->id,
                'order_id' => $order?->id,
                'user_id' => $user?->id,
                'type' => $type,
                'quantity' => $quantity,
                'stock_before' => $stockBefore,
                'stock_after' => $stockAfter,
                'reference' => $this->nullableString($reference),
                'note' => $this->nullableString($note),
            ]);
        });
    }

    private function nullableString(?string $value): ?string
    {
        $value = trim((string) $value);

        return $value === '' ? null : $value;
    }
}
