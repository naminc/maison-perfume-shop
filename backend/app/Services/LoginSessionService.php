<?php

namespace App\Services;

use App\Models\LoginSession;
use Illuminate\Http\Request;

class LoginSessionService extends BaseService
{
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
}
