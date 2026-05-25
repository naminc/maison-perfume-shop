<?php

namespace App\Http\Controllers\Api\V1\Account;

use App\Http\Controllers\Api\V1\BaseController;
use App\Services\LoginSessionService;
use Illuminate\Http\Request;

class SessionController extends BaseController
{
    public function __construct(
        protected LoginSessionService $loginSessionService,
    ) {}

    private function currentSessionId(Request $request): ?int
    {
        $tokenSessionId = (int) ($request->user()->currentAccessToken()?->login_session_id ?? 0);
        $headerSessionId = (int) $request->header('X-Session-Id');

        return $tokenSessionId ?: ($headerSessionId ?: null);
    }

    public function index(Request $request)
    {
        $request->validate([
            'page'     => ['integer', 'min:1'],
            'per_page' => ['integer', 'min:1', 'max:20'],
        ]);

        $currentSessionId = $this->currentSessionId($request);

        $result = $this->loginSessionService->getSessionsForUser(
            userId:           $request->user()->id,
            currentSessionId: $currentSessionId,
            page:             (int) $request->query('page', 1),
            perPage:          (int) $request->query('per_page', 5),
        );

        return api_success(data: $result, message: 'Lấy danh sách phiên đăng nhập thành công.');
    }

    public function destroy(Request $request, int $session)
    {
        $currentSessionId = $this->currentSessionId($request);

        $result = $this->loginSessionService->revokeSession(
            userId:           $request->user()->id,
            sessionId:        $session,
            currentSessionId: $currentSessionId,
        );

        if (! $result['ok']) {
            return api_error($result['message'], 500);
        }

        $payload = $result['data'];

        if (! $payload['revoked']) {
            return api_error($payload['message'], 404);
        }

        return api_success(data: [
            'revoked_current' => $payload['revoked_current'],
        ], message: 'Đã đăng xuất phiên đăng nhập.');
    }

    public function revokeOthers(Request $request)
    {
        $currentSessionId = $this->currentSessionId($request);

        if (! $currentSessionId) {
            return api_error('Không xác định được phiên đăng nhập hiện tại.', 400);
        }

        $result = $this->loginSessionService->revokeOtherSessions(
            userId:           $request->user()->id,
            currentSessionId: $currentSessionId,
        );

        if (! $result['ok']) {
            return api_error($result['message'], 500);
        }

        if (! ($result['data']['revoked'] ?? false)) {
            return api_error($result['data']['message'] ?? 'Phiên đăng nhập hiện tại không hợp lệ.', 400);
        }

        return api_success(data: $result['data'], message: 'Đã đăng xuất tất cả thiết bị khác.');
    }

    public function revokeAll(Request $request)
    {
        $result = $this->loginSessionService->revokeAllSessions($request->user()->id);

        if (! $result['ok']) {
            return api_error($result['message'], 500);
        }

        return api_success(data: $result['data'], message: 'Đã đăng xuất tất cả phiên đăng nhập.');
    }
}
