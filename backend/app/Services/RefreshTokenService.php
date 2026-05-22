<?php

namespace App\Services;

use App\Models\RefreshToken;
use App\Models\User;
use Illuminate\Support\Str;

class RefreshTokenService extends BaseService
{
    private const EXPIRY_DAYS = 7;

    /**
     * Create a new refresh token for a user.
     * If family is null, start a new token family (fresh login).
     */
    public function createRefreshToken(User $user, ?string $family = null): string
    {
        $plainToken = Str::random(64);
        $family = $family ?? Str::uuid()->toString();

        RefreshToken::create([
            'user_id'    => $user->id,
            'token'      => hash('sha256', $plainToken),
            'family'     => $family,
            'expires_at' => now()->addDays(self::EXPIRY_DAYS),
        ]);

        return $plainToken;
    }

    /**
     * Rotate: validate old refresh token, revoke it, issue new access + refresh tokens.
     * Detects token reuse and revokes entire family if stolen token is replayed.
     */
    public function refresh(string $plainToken): array
    {
        return $this->executeTransaction(function () use ($plainToken) {
            $hashedToken = hash('sha256', $plainToken);

            $refreshToken = RefreshToken::where('token', $hashedToken)->first();

            if (! $refreshToken) {
                return ['valid' => false, 'message' => 'Refresh token không hợp lệ.'];
            }

            if ($refreshToken->isRevoked()) {
                $this->revokeFamily($refreshToken->family);
                $this->revokeUserAccessTokens($refreshToken->user_id);
                $this->logWarning('Token reuse detected, revoked entire family', [
                    'user_id' => $refreshToken->user_id,
                    'family'  => $refreshToken->family,
                ]);

                return ['valid' => false, 'message' => 'Phiên đăng nhập bị xâm phạm. Vui lòng đăng nhập lại.'];
            }

            if ($refreshToken->isExpired()) {
                return ['valid' => false, 'message' => 'Refresh token đã hết hạn. Vui lòng đăng nhập lại.'];
            }

            $refreshToken->update(['revoked_at' => now()]);

            $user = $refreshToken->user;

            $user->tokens()->where('name', 'auth')->delete();
            $accessToken = $user->createToken('auth')->plainTextToken;
            $newRefreshToken = $this->createRefreshToken($user, $refreshToken->family);

            return [
                'valid'         => true,
                'access_token'  => $accessToken,
                'refresh_token' => $newRefreshToken,
                'expires_in'    => config('sanctum.expiration') * 60,
                'user'          => $user,
            ];
        }, 'refresh');
    }

    /**
     * Revoke all refresh tokens in a family.
     */
    public function revokeFamily(string $family): void
    {
        RefreshToken::where('family', $family)
            ->whereNull('revoked_at')
            ->update(['revoked_at' => now()]);
    }

    /**
     * Revoke all refresh tokens for a user.
     */
    public function revokeAllForUser(int $userId): void
    {
        RefreshToken::where('user_id', $userId)
            ->whereNull('revoked_at')
            ->update(['revoked_at' => now()]);
    }

    private function revokeUserAccessTokens(int $userId): void
    {
        User::find($userId)?->tokens()->delete();
    }
}
