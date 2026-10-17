<?php

namespace App\Repositories\Interfaces;

use App\Models\StockMovement;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface StockMovementRepositoryInterface
{
    public function paginate(array $filters): LengthAwarePaginator;

    public function getByProduct(int $productId, array $filters): LengthAwarePaginator;

    public function create(array $data): StockMovement;

    public function findById(int $id): ?StockMovement;
}
