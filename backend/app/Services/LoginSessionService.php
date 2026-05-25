<?php

namespace App\Services;

use App\Models\LoginSession;
use Illuminate\Http\Request;

class LoginSessionService extends BaseService
{
    public function __construct(
        protected RefreshTokenService $refreshTokenService,
    ) {}

    /**
     * Parse User-Agent thành device / platform / browser dạng đọc được.
     */
    private function parseUserAgent(string $ua): array
    {
        $browser  = 'Unknown';
        $platform = 'Unknown';
        $device   = 'Desktop';

        // Platform
        if (preg_match('/iPhone/i', $ua)) {
            $platform = 'iOS';
            $device = 'iPhone';
        } elseif (preg_match('/iPad/i', $ua)) {
            $platform = 'iPadOS';
            $device = 'iPad';
        } elseif (preg_match('/Android/i', $ua)) {
            $platform = 'Android';
            $device = preg_match('/Mobile/i', $ua) ? 'Android Phone' : 'Android Tablet';
        } elseif (preg_match('/Macintosh/i', $ua)) {
            $platform = 'macOS';
            $device = 'Mac';
        } elseif (preg_match('/Windows/i', $ua)) {
            $platform = 'Windows';
            $device = 'Windows PC';
        } elseif (preg_match('/Linux/i', $ua)) {
            $platform = 'Linux';
            $device = 'Linux PC';
        }

        // Browser — thứ tự quan trọng: các token đặc thù phải check trước
        if (preg_match('/Edg\//i', $ua))            $browser = 'Edge';
        elseif (preg_match('/EdgA\//i', $ua))       $browser = 'Edge';          // Edge trên Android
        elseif (preg_match('/OPR|Opera/i', $ua))    $browser = 'Opera';
        elseif (preg_match('/OPiOS/i', $ua))        $browser = 'Opera';         // Opera iOS
        elseif (preg_match('/CriOS/i', $ua))        $browser = 'Chrome';        // Chrome iOS
        elseif (preg_match('/FxiOS/i', $ua))        $browser = 'Firefox';       // Firefox iOS
        elseif (preg_match('/Chrome/i', $ua))       $browser = 'Chrome';
        elseif (preg_match('/Firefox/i', $ua))      $browser = 'Firefox';
        elseif (preg_match('/Safari/i', $ua))       $browser = 'Safari';

        return compact('device', 'platform', 'browser');
    }

    /**
     * Ghi 1 phiên đăng nhập mới.
     */
    public function recordSession(int $userId, Request $request): LoginSession
    {
        $ua     = $request->userAgent() ?? '';
        $parsed = $this->parseUserAgent($ua);

        return LoginSession::create([
            'user_id'        => $userId,
            'ip_address'     => $request->ip(),
            'user_agent'     => mb_substr($ua, 0, 255),
            'device'         => $parsed['device'],
            'platform'       => $parsed['platform'],
            'browser'        => $parsed['browser'],
            'is_current'     => true,
            'last_active_at' => now(),
        ]);
    }

    /**
     * Lấy danh sách phiên đăng nhập của user có phân trang.
     */
    public function getSessionsForUser(
        int $userId,
        ?int $currentSessionId = null,
        int $page    = 1,
        int $perPage = 5,
    ): array {
        $paginator = LoginSession::where('user_id', $userId)
            ->whereNull('revoked_at')
            ->orderByDesc('last_active_at')
            ->paginate(perPage: $perPage, page: $page);

        $items = collect($paginator->items())->map(function ($session) use ($currentSessionId) {
            $session->is_current = $currentSessionId && $session->id === $currentSessionId;
            return $session;
        });

        return [
            'items' => $items->toArray(),
            'meta'  => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
            ],
        ];
    }

    public function revokeSession(int $userId, int $sessionId, ?int $currentSessionId = null): array
    {
        return $this->executeTransaction(function () use ($userId, $sessionId, $currentSessionId) {
            $session = LoginSession::where('user_id', $userId)
                ->whereKey($sessionId)
                ->whereNull('revoked_at')
                ->first();

            if (! $session) {
                return [
                    'revoked'         => false,
                    'revoked_current' => false,
                    'message'         => 'Phiên đăng nhập không tồn tại hoặc đã bị đăng xuất.',
                ];
            }

            $session->update([
                'revoked_at' => now(),
                'is_current' => false,
            ]);

            $this->refreshTokenService->revokeForSessionIds($userId, [$session->id]);

            return [
                'revoked'         => true,
                'revoked_current' => $currentSessionId && $session->id === $currentSessionId,
            ];
        }, 'revokeSession');
    }

    public function revokeOtherSessions(int $userId, int $currentSessionId): array
    {
        return $this->executeTransaction(function () use ($userId, $currentSessionId) {
            $currentSessionExists = LoginSession::where('user_id', $userId)
                ->whereKey($currentSessionId)
                ->whereNull('revoked_at')
                ->exists();

            if (! $currentSessionExists) {
                return [
                    'revoked' => false,
                    'message' => 'Phiên đăng nhập hiện tại không hợp lệ.',
                ];
            }

            $sessionIds = LoginSession::where('user_id', $userId)
                ->where('id', '!=', $currentSessionId)
                ->whereNull('revoked_at')
                ->pluck('id')
                ->all();

            if ($sessionIds === []) {
                return ['revoked' => true, 'revoked_count' => 0];
            }

            LoginSession::where('user_id', $userId)
                ->whereIn('id', $sessionIds)
                ->update([
                    'revoked_at' => now(),
                    'is_current' => false,
                ]);

            $this->refreshTokenService->revokeForSessionIds($userId, $sessionIds);

            return ['revoked' => true, 'revoked_count' => count($sessionIds)];
        }, 'revokeOtherSessions');
    }

    public function revokeAllSessions(int $userId): array
    {
        return $this->executeTransaction(function () use ($userId) {
            $sessionIds = LoginSession::where('user_id', $userId)
                ->whereNull('revoked_at')
                ->pluck('id')
                ->all();

            if ($sessionIds === []) {
                return ['revoked_count' => 0];
            }

            LoginSession::where('user_id', $userId)
                ->whereIn('id', $sessionIds)
                ->update([
                    'revoked_at' => now(),
                    'is_current' => false,
                ]);

            $this->refreshTokenService->revokeForSessionIds($userId, $sessionIds);

            return ['revoked_count' => count($sessionIds)];
        }, 'revokeAllSessions');
    }
}
