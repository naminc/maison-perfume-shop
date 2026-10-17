<?php

namespace App\Services\Interfaces;

use App\Models\Order;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\User;

interface InventoryServiceInterface
{
    public function getMovements(array $filters): array;

    public function getProductMovements(int $productId, array $filters): array;

    public function adjustStock(Product $product, int $quantity, string $type, ?User $user, ?string $note, ?string $reference = null): array;

    public function decreaseForOrder(Product $product, int $quantity, Order $order): StockMovement;

    public function restoreForCancelledOrder(Product $product, int $quantity, Order $order): StockMovement;
}
