<?php

namespace App\Services\Interfaces;

interface AuthServiceInterface
{
    public function register(array $data): array;
    public function login(string $email, string $password): array;
    public function logout(int $userId): array;
}
