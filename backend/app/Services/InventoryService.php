<?php

namespace App\Services;

use App\Enums\StockMovementType;
use App\Models\Order;
use App\Models\Product;
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
                'product' => $product->load('brand:id,name'),
                'movements' => $this->stockMovementRepository->getByProduct($productId, $filters),
            ];
        }, 'getProductMovements');
    }

    public function adjustStock(Product $product, int $quantity, string $type, ?User $user, ?string $note, ?string $reference = null): array
    {
        return $this->executeTransaction(function () use ($product, $quantity, $type, $user, $note, $reference) {
            $delta = match ($type) {
                StockMovementType::Import->value => abs($quantity),
                StockMovementType::Export->value => -abs($quantity),
                StockMovementType::Adjustment->value => $quantity,
                default => throw ValidationException::withMessages(['type' => ['Loại điều chỉnh tồn kho không hợp lệ.']]),
            };

            return $this->applyMovement($product, $delta, $type, $user, null, $reference, $note);
        }, 'adjustStock');
    }

    public function decreaseForOrder(Product $product, int $quantity, Order $order): StockMovement
    {
        return $this->applyMovement(
            $product,
            -abs($quantity),
            StockMovementType::Order->value,
            $order->user,
            $order,
            $order->order_code,
            'Xuất kho cho đơn hàng.',
        );
    }

    public function restoreForCancelledOrder(Product $product, int $quantity, Order $order): StockMovement
    {
        return $this->applyMovement(
            $product,
            abs($quantity),
            StockMovementType::OrderCancelled->value,
            $order->user,
            $order,
            $order->order_code,
            'Hoàn kho do huỷ đơn hàng.',
        );
    }

    private function applyMovement(
        Product $product,
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

        return DB::transaction(function () use ($product, $quantity, $type, $user, $order, $reference, $note) {
            $lockedProduct = Product::withTrashed()->lockForUpdate()->find($product->id);

            if (! $lockedProduct) {
                throw ValidationException::withMessages(['product' => ['Sản phẩm không tồn tại.']]);
            }

            $stockBefore = (int) $lockedProduct->stock;
            $stockAfter = $stockBefore + $quantity;

            if ($stockAfter < 0) {
                throw ValidationException::withMessages([
                    'quantity' => ["Tồn kho hiện tại chỉ còn {$stockBefore}, không đủ để xuất ".abs($quantity).' sản phẩm.'],
                ]);
            }

            $lockedProduct->forceFill(['stock' => $stockAfter])->save();

            return $this->stockMovementRepository->create([
                'product_id' => $lockedProduct->id,
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
