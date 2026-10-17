<?php

namespace App\Repositories\Interfaces;

use App\Models\PurchaseOrder;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface PurchaseOrderRepositoryInterface
{
    public function paginate(array $filters): LengthAwarePaginator;

    public function findById(int $id, bool $lock = false): ?PurchaseOrder;

    public function create(array $data, array $items): PurchaseOrder;

    public function update(PurchaseOrder $purchaseOrder, array $data, array $items): PurchaseOrder;

    public function delete(PurchaseOrder $purchaseOrder): bool;

    public function codeExists(string $code): bool;

    public function summary(): array;
}
