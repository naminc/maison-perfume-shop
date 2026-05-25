<?php

namespace App\Services;

use App\Models\RefreshToken;
use App\Models\User;
use Illuminate\Support\Str;
use Laravel\Sanctum\PersonalAccessToken;

class RefreshTokenService extends BaseService
{
    private const EXPIRY_DAYS = 7;
    private const REVOKED_BY_ROTATION = 'rotation';
    private const REVOKED_BY_SESSION = 'session';
    private const REVOKED_BY_SECURITY = 'security';

    /**
     * Create a new refresh token for a user.
     * If family is null, start a new token family (fresh login).
     */
    public function createRefreshToken(User $user, ?string $family = null, ?int $loginSessionId = null): string
    {
        $plainToken = Str::random(64);
        $family = $family ?? Str::uuid()->toString();

        RefreshToken::create([
            'user_id'          => $user->id,
            'login_session_id' => $loginSessionId,
            'token'            => hash('sha256', $plainToken),
            'family'           => $family,
            'expires_at'       => now()->addDays(self::EXPIRY_DAYS),
        ]);

        return $plainToken;
    }

    public function createAccessToken(User $user, ?int $loginSessionId = null): string
    {
        $token = $user->createToken('auth');

        if ($loginSessionId) {
            $token->accessToken->forceFill([
                'login_session_id' => $loginSessionId,
            ])->save();
        }

        return $token->plainTextToken;
    }

    public function attachTokensToSession(string $accessToken, string $refreshToken, int $loginSessionId): void
    {
        $accessTokenId = Str::before($accessToken, '|');

        if (ctype_digit($accessTokenId)) {
            PersonalAccessToken::whereKey((int) $accessTokenId)
                ->update(['login_session_id' => $loginSessionId]);
        }

        RefreshToken::where('token', hash('sha256', $refreshToken))
            ->update(['login_session_id' => $loginSessionId]);
    }

    /**
     * Rotate: validate old refresh token, revoke it, issue new access + refresh tokens.
     * Detects token reuse and revokes all user sessions if a stolen token is replayed.
     */
    public function refresh(string $plainToken, ?int $loginSessionId = null): array
    {
        return $this->executeTransaction(function () use ($plainToken, $loginSessionId) {
            $hashedToken = hash('sha256', $plainToken);

            $refreshToken = RefreshToken::where('token', $hashedToken)->first();

            if (! $refreshToken) {
                return ['valid' => false, 'message' => 'Refresh token không hợp lệ.'];
            }

            if ($refreshToken->isRevoked()) {
                if ($refreshToken->revoked_reason === self::REVOKED_BY_ROTATION) {
                    $this->revokeAllForUser($refreshToken->user_id, self::REVOKED_BY_SECURITY);
                    $this->revokeUserAccessTokens($refreshToken->user_id);
                    $this->revokeUserLoginSessions($refreshToken->user_id);
                    $this->logWarning('Token reuse detected, revoked all user sessions', [
                        'user_id' => $refreshToken->user_id,
                        'family'  => $refreshToken->family,
                    ]);

                    return ['valid' => false, 'message' => 'Phiên đăng nhập bị xâm phạm. Vui lòng đăng nhập lại.'];
                }

                return ['valid' => false, 'message' => 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'];
            }

            if ($refreshToken->isExpired()) {
                return ['valid' => false, 'message' => 'Refresh token đã hết hạn. Vui lòng đăng nhập lại.'];
            }

            if (! $refreshToken->login_session_id && $loginSessionId) {
                $refreshToken->update(['login_session_id' => $loginSessionId]);
                $refreshToken->login_session_id = $loginSessionId;
            }

            $refreshToken->update([
                'revoked_at'     => now(),
                'revoked_reason' => self::REVOKED_BY_ROTATION,
            ]);

            $user = $refreshToken->user;

            $this->revokeUserAccessTokensForSessionIds($user->id, [$refreshToken->login_session_id]);
            $accessToken = $this->createAccessToken($user, $refreshToken->login_session_id);
            $newRefreshToken = $this->createRefreshToken(
                $user,
                $refreshToken->family,
                $refreshToken->login_session_id,
            );

            return [
                'valid'         => true,
                'access_token'  => $accessToken,
                'refresh_token' => $newRefreshToken,
                'expires_in'    => config('sanctum.expiration') * 60,
                'session_id'    => $refreshToken->login_session_id,
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
            ->update([
                'revoked_at'     => now(),
                'revoked_reason' => self::REVOKED_BY_SESSION,
            ]);
    }

    /**
     * Revoke all refresh tokens for a user.
     */
    public function revokeAllForUser(int $userId, string $reason = self::REVOKED_BY_SESSION): void
    {
        RefreshToken::where('user_id', $userId)
            ->whereNull('revoked_at')
            ->update([
                'revoked_at'     => now(),
                'revoked_reason' => $reason,
            ]);
    }

    public function revokeForSessionIds(int $userId, array $sessionIds): void
    {
        $sessionIds = array_values(array_filter($sessionIds));

        if ($sessionIds === []) {
            return;
        }

        RefreshToken::where('user_id', $userId)
            ->whereIn('login_session_id', $sessionIds)
            ->whereNull('revoked_at')
            ->update([
                'revoked_at'     => now(),
                'revoked_reason' => self::REVOKED_BY_SESSION,
            ]);

        $this->revokeUserAccessTokensForSessionIds($userId, $sessionIds);
    }

    private function revokeUserAccessTokens(int $userId): void
    {
        User::find($userId)?->tokens()->delete();
    }

    private function revokeUserAccessTokensForSessionIds(int $userId, array $sessionIds): void
    {
        $sessionIds = array_values(array_filter($sessionIds));

        if ($sessionIds === []) {
            return;
        }

        PersonalAccessToken::query()
            ->where('tokenable_type', User::class)
            ->where('tokenable_id', $userId)
            ->whereIn('login_session_id', $sessionIds)
            ->delete();
    }

    private function revokeUserLoginSessions(int $userId): void
    {
        \App\Models\LoginSession::where('user_id', $userId)
            ->whereNull('revoked_at')
            ->update(['revoked_at' => now(), 'is_current' => false]);
    }
}
