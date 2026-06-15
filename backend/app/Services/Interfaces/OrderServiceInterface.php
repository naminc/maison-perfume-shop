<?php

namespace App\Services\Interfaces;

use App\Models\User;

interface OrderServiceInterface
{
    public function createFromCheckout(User $user, array $payload): array;
    public function getUserOrders(User $user, array $filters): array;
    public function getUserOrder(User $user, string $order): array;
    public function cancelUserOrder(User $user, string $order): array;
    public function getPaginated(array $filters): array;
    public function getByIdOrCode(string $order): array;
    public function updateStatus(string $order, array $data): array;
    public function delete(string $order): array;
}
