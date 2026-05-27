<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Api\V1\Admin\UpdateUserRequest;
use App\Services\Interfaces\UserServiceInterface;
use Illuminate\Http\Request;

class UserController extends BaseController
{
    public function __construct(
        protected UserServiceInterface $userService,
    ) {}

    public function index(Request $request)
    {
        $result = $this->userService->getPaginated(
            $request->only(['search', 'role', 'status', 'page', 'per_page'])
        );

        if (! $result['ok']) {
            return api_error('Không thể lấy danh sách người dùng. Vui lòng thử lại sau.', 500);
        }

        return api_success(data: $result['data'], message: 'Lấy danh sách người dùng thành công.');
    }

    public function show(int $user)
    {
        $result = $this->userService->getById($user);

        if (! $result['ok']) {
            return api_error('Không thể lấy chi tiết người dùng. Vui lòng thử lại sau.', 500);
        }

        if (! $result['data']) {
            return api_error('Không tìm thấy người dùng.', 404);
        }

        return api_success(data: $result['data'], message: 'Lấy chi tiết người dùng thành công.');
    }

    public function update(UpdateUserRequest $request, int $user)
    {
        $result = $this->userService->update($user, $request->validated(), (int) $request->user()->id);

        if (! $result['ok']) {
            return api_error('Không thể cập nhật người dùng. Vui lòng thử lại sau.', 500);
        }

        $payload = $result['data'];

        if (! $payload['found']) {
            return api_error('Không tìm thấy người dùng.', 404);
        }

        if (! $payload['updated']) {
            return api_error($payload['message'], 422);
        }

        return api_success(data: $payload['user'], message: 'Cập nhật người dùng thành công.');
    }

    public function destroy(Request $request, int $user)
    {
        $result = $this->userService->delete($user, (int) $request->user()->id);

        if (! $result['ok']) {
            return api_error('Không thể xoá người dùng. Vui lòng thử lại sau.', 500);
        }

        $payload = $result['data'];

        if (! $payload['found']) {
            return api_error('Không tìm thấy người dùng.', 404);
        }

        if (! $payload['deleted']) {
            return api_error($payload['message'], 422);
        }

        return api_success(data: null, message: 'Xoá người dùng thành công.');
    }
}
