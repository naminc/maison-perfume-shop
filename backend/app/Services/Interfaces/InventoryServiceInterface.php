<?php

namespace App\Services\Interfaces;

use App\Models\Order;
use App\Models\ProductVariant;
use App\Models\PurchaseOrder;
use App\Models\StockMovement;
use App\Models\User;

interface InventoryServiceInterface
{
    public function getMovements(array $filters): array;

    public function getProductMovements(int $productId, array $filters): array;

    public function getVariantMovements(int $variantId, array $filters): array;

    public function adjustStock(ProductVariant $variant, int $quantity, string $type, ?User $user, ?string $note, ?string $reference = null): array;

    public function decreaseForOrder(ProductVariant $variant, int $quantity, Order $order): StockMovement;

    public function restoreForCancelledOrder(ProductVariant $variant, int $quantity, Order $order): StockMovement;

    public function importForPurchaseOrder(ProductVariant $variant, int $quantity, PurchaseOrder $purchaseOrder, User $user): StockMovement;
}
