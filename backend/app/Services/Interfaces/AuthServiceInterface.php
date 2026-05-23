<?php

namespace App\Services\Interfaces;

interface AuthServiceInterface
{
    public function register(array $data): array;
    public function login(string $email, string $password): array;
    public function forgotPassword(string $email): array;
    public function resetPassword(array $credentials): array;
    public function changePassword(int $userId, array $data): array;
    public function logout(int $userId): array;
}
