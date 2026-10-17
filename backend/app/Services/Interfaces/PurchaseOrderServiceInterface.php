<?php

namespace App\Services\Interfaces;

use App\Models\User;

interface PurchaseOrderServiceInterface
{
    public function getPaginated(array $filters): array;

    public function getById(int $id): array;

    public function getSummary(): array;

    public function create(array $data, User $user): array;

    public function update(int $id, array $data): array;

    public function updateStatus(int $id, string $status, User $user): array;

    public function delete(int $id): array;
}
