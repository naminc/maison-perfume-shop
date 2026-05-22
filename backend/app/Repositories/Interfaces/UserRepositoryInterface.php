<?php

namespace App\Repositories\Interfaces;

use App\Models\User;

interface UserRepositoryInterface
{
    public function create(array $data): User;
    public function findById(int $id): ?User;
    public function findByEmail(string $email): ?User;
}
