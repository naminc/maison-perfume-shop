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

    public function index(Request $request)
    {
        $request->validate([
            'page'     => ['integer', 'min:1'],
            'per_page' => ['integer', 'min:1', 'max:20'],
        ]);

        $currentSessionId = (int) $request->header('X-Session-Id');

        $result = $this->loginSessionService->getSessionsForUser(
            userId:           $request->user()->id,
            currentSessionId: $currentSessionId ?: null,
            page:             (int) $request->query('page', 1),
            perPage:          (int) $request->query('per_page', 5),
        );

        return api_success(data: $result, message: 'Lấy danh sách phiên đăng nhập thành công.');
    }
}
