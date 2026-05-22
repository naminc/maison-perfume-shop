<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Repositories\Interfaces\UserRepositoryInterface;
use App\Services\Interfaces\AuthServiceInterface;
use Illuminate\Support\Facades\Hash;

class AuthService extends BaseService implements AuthServiceInterface
{
    public function __construct(
        protected UserRepositoryInterface $userRepository,
        protected RefreshTokenService $refreshTokenService,
    ) {}

    public function register(array $data): array
    {
        return $this->executeTransaction(function () use ($data) {
            $user = $this->userRepository->create([
                'full_name' => $data['full_name'],
                'email'     => $data['email'],
                'phone'     => $data['phone'] ?? null,
                'password'  => $data['password'],
                'role'      => UserRole::User,
                'status'    => UserStatus::Active,
            ]);

            $accessToken  = $user->createToken('auth')->plainTextToken;
            $refreshToken = $this->refreshTokenService->createRefreshToken($user);

            return [
                'access_token'  => $accessToken,
                'refresh_token' => $refreshToken,
                'token_type'    => 'Bearer',
                'expires_in'    => config('sanctum.expiration') * 60,
                'user'          => $user,
            ];
        }, 'register');
    }

    public function login(string $email, string $password): array
    {
        return $this->executeTransaction(function () use ($email, $password) {
            $user = $this->userRepository->findByEmail($email);

            if (! $user || ! Hash::check($password, $user->password)) {
                return ['authenticated' => false, 'message' => 'Email hoặc mật khẩu không chính xác.'];
            }

            if ($user->status === UserStatus::Banned) {
                return ['authenticated' => false, 'message' => 'Tài khoản đã bị khóa.'];
            }

            if ($user->status === UserStatus::Inactive) {
                return ['authenticated' => false, 'message' => 'Tài khoản chưa được kích hoạt.'];
            }

            $user->tokens()->where('name', 'auth')->delete();
            $this->refreshTokenService->revokeAllForUser($user->id);

            $accessToken  = $user->createToken('auth')->plainTextToken;
            $refreshToken = $this->refreshTokenService->createRefreshToken($user);

            return [
                'authenticated' => true,
                'access_token'  => $accessToken,
                'refresh_token' => $refreshToken,
                'token_type'    => 'Bearer',
                'expires_in'    => config('sanctum.expiration') * 60,
                'user'          => $user,
            ];
        }, 'login');
    }

    public function logout(int $userId): array
    {
        return $this->executeSafe(function () use ($userId) {
            $user = $this->userRepository->findById($userId);

            if (! $user) {
                return true;
            }
            $user->tokens()->delete();
            $this->refreshTokenService->revokeAllForUser($userId);

            return true;
        }, 'logout');
    }
}
