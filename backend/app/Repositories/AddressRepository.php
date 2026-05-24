<?php

namespace App\Repositories;

use App\Models\UserAddress;
use App\Repositories\Interfaces\AddressRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class AddressRepository implements AddressRepositoryInterface
{
    public function __construct(protected UserAddress $model) {}

    public function getAllByUser(int $userId): Collection
    {
        return $this->model
            ->where('user_id', $userId)
            ->orderByDesc('is_default')
            ->orderByDesc('updated_at')
            ->get();
    }

    public function findByIdAndUser(int $id, int $userId): ?UserAddress
    {
        return $this->model->where('id', $id)->where('user_id', $userId)->first();
    }

    public function create(array $data): UserAddress
    {
        return $this->model->create($data);
    }

    public function update(UserAddress $address, array $data): UserAddress
    {
        $address->update($data);
        return $address->fresh();
    }

    public function delete(UserAddress $address): bool
    {
        return $address->delete();
    }

    public function countByUser(int $userId): int
    {
        return $this->model->where('user_id', $userId)->count();
    }

    public function clearDefaultForUser(int $userId): void
    {
        $this->model
            ->where('user_id', $userId)
            ->where('is_default', true)
            ->update(['is_default' => false]);
    }
}
