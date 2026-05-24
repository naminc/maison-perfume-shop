<?php

namespace App\Repositories\Interfaces;

use App\Models\UserAddress;
use Illuminate\Database\Eloquent\Collection;

interface AddressRepositoryInterface
{
    public function getAllByUser(int $userId): Collection;
    public function findByIdAndUser(int $id, int $userId): ?UserAddress;
    public function create(array $data): UserAddress;
    public function update(UserAddress $address, array $data): UserAddress;
    public function delete(UserAddress $address): bool;
    public function countByUser(int $userId): int;
    public function clearDefaultForUser(int $userId): void;
}
