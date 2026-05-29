<?php

namespace App\Repositories\Interfaces;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface UserRepositoryInterface
{
    public function paginate(array $filters): LengthAwarePaginator;
    public function create(array $data): User;
    public function findById(int $id): ?User;
    public function findByEmail(string $email): ?User;
    public function update(User $user, array $data): User;
    public function delete(User $user): bool;
}
