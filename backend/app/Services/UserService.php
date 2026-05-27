<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\LoginSession;
use App\Repositories\Interfaces\UserRepositoryInterface;
use App\Services\Interfaces\UserServiceInterface;

class UserService extends BaseService implements UserServiceInterface
{
    public function __construct(
        protected UserRepositoryInterface $userRepository,
        protected RefreshTokenService $refreshTokenService,
    ) {}

    public function getPaginated(array $filters): array
    {
        return $this->executeSafe(function () use ($filters) {
            return $this->userRepository->paginate($filters);
        }, 'getPaginated');
    }

    public function getById(int $id): array
    {
        return $this->executeSafe(function () use ($id) {
            return $this->userRepository->findById($id);
        }, 'getById');
    }

    public function update(int $id, array $data, int $actorId): array
    {
        return $this->executeTransaction(function () use ($id, $data, $actorId) {
            $user = $this->userRepository->findById($id);

            if (! $user) {
                return ['found' => false];
            }

            $payload = $this->preparePayload($data);

            if ($user->id === $actorId && $this->wouldDemoteCurrentAdmin($user->role, $payload['role'])) {
                return [
                    'found'   => true,
                    'updated' => false,
                    'message' => 'Bạn không thể tự hạ quyền quản trị viên của chính mình.',
                ];
            }

            if ($user->id === $actorId && $payload['status'] !== UserStatus::Active->value) {
                return [
                    'found'   => true,
                    'updated' => false,
                    'message' => 'Bạn không thể tự khoá tài khoản đang đăng nhập.',
                ];
            }

            $updatedUser = $this->userRepository->update($user, $payload);

            if ($payload['status'] !== UserStatus::Active->value) {
                $this->revokeUserAuthentication($updatedUser->id);
            }

            return [
                'found'   => true,
                'updated' => true,
                'user'    => $updatedUser,
            ];
        }, 'update');
    }

    public function delete(int $id, int $actorId): array
    {
        return $this->executeTransaction(function () use ($id, $actorId) {
            $user = $this->userRepository->findById($id);

            if (! $user) {
                return ['found' => false];
            }

            if ($user->id === $actorId) {
                return [
                    'found'   => true,
                    'deleted' => false,
                    'message' => 'Bạn không thể tự xoá tài khoản đang đăng nhập.',
                ];
            }

            $this->revokeUserAuthentication($user->id);
            $this->userRepository->delete($user);

            return ['found' => true, 'deleted' => true];
        }, 'delete');
    }

    private function preparePayload(array $data): array
    {
        return [
            'full_name' => trim((string) $data['full_name']),
            'email'     => strtolower(trim((string) $data['email'])),
            'phone'     => $this->normalizeNullableString($data['phone'] ?? null),
            'role'      => $data['role'],
            'status'    => $data['status'],
        ];
    }

    private function normalizeNullableString(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $value = trim($value);

        return $value === '' ? null : $value;
    }

    private function wouldDemoteCurrentAdmin(mixed $currentRole, string $nextRole): bool
    {
        $currentRoleValue = $currentRole instanceof UserRole ? $currentRole->value : (string) $currentRole;

        return $currentRoleValue === UserRole::Admin->value && $nextRole !== UserRole::Admin->value;
    }

    private function revokeUserAuthentication(int $userId): void
    {
        $user = $this->userRepository->findById($userId);

        $user?->tokens()->delete();
        $this->refreshTokenService->revokeAllForUser($userId);

        LoginSession::where('user_id', $userId)
            ->whereNull('revoked_at')
            ->update(['revoked_at' => now(), 'is_current' => false]);
    }
}
