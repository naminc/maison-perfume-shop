<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Api\V1\Auth\LoginRequest;
use App\Http\Requests\Api\V1\Auth\RegisterRequest;
use App\Services\Interfaces\AuthServiceInterface;
use App\Services\RefreshTokenService;
use Illuminate\Http\Request;

class AuthController extends BaseController
{
    public function __construct(
        protected AuthServiceInterface $authService,
        protected RefreshTokenService $refreshTokenService,
    ) {}

    public function register(RegisterRequest $request)
    {
        $result = $this->authService->register($request->validated());

        if (! $result['ok']) {
            return api_error($result['message'], 500);
        }

        $payload = $result['data'];

        return api_created([
            'access_token'  => $payload['access_token'],
            'refresh_token' => $payload['refresh_token'],
            'token_type'    => $payload['token_type'],
            'expires_in'    => $payload['expires_in'],
            'user'          => $payload['user'],
        ], 'Đăng ký thành công.');
    }

    public function login(LoginRequest $request)
    {
        $result = $this->authService->login(
            $request->email,
            $request->password
        );

        if (! $result['ok']) {
            return api_error($result['message'], 500);
        }

        $payload = $result['data'];

        if (! $payload['authenticated']) {
            return api_error($payload['message'], 401);
        }

        return api_success([
            'access_token'  => $payload['access_token'],
            'refresh_token' => $payload['refresh_token'],
            'token_type'    => $payload['token_type'],
            'expires_in'    => $payload['expires_in'],
            'user'          => $payload['user'],
        ], 'Đăng nhập thành công.');
    }

    public function refresh(Request $request)
    {
        $request->validate([
            'refresh_token' => ['required', 'string'],
        ]);

        $result = $this->refreshTokenService->refresh($request->refresh_token);

        if (! $result['ok']) {
            return api_error($result['message'], 500);
        }

        $payload = $result['data'];

        if (! $payload['valid']) {
            return api_error($payload['message'], 401);
        }

        return api_success([
            'access_token'  => $payload['access_token'],
            'refresh_token' => $payload['refresh_token'],
            'token_type'    => 'Bearer',
            'expires_in'    => $payload['expires_in'],
        ], 'Token refreshed.');
    }

    public function logout(Request $request)
    {
        $result = $this->authService->logout($request->user()->id);

        if (! $result['ok']) {
            return api_error($result['message'], 500);
        }

        return api_success(null, 'Đăng xuất thành công.');
    }

    public function me(Request $request)
    {
        return api_success($request->user());
    }
}
