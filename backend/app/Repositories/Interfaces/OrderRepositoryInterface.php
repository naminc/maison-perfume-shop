<?php

namespace App\Repositories\Interfaces;

use App\Models\Order;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface OrderRepositoryInterface
{
    public function paginate(array $filters): LengthAwarePaginator;
    public function paginateByUser(int $userId, array $filters): LengthAwarePaginator;
    public function findById(int $id): ?Order;
    public function findByCode(string $code): ?Order;
    public function create(array $data): Order;
    public function update(Order $order, array $data): Order;
    public function delete(Order $order): bool;
    public function generateOrderCode(): string;
    public function getOrderWithItems(Order $order): Order;
}
