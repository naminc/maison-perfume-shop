<?php

namespace App\Http\Controllers\Api\V1\Account;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Api\V1\Account\UpdateProfileRequest;
use Illuminate\Http\Request;

class ProfileController extends BaseController
{
    public function show(Request $request)
    {
        return api_success(data: $request->user(), message: 'Lấy thông tin người dùng thành công.');
    }

    public function update(UpdateProfileRequest $request)
    {
        $user = $request->user();
        $user->update($request->validated());

        return api_success(data: $user->fresh(), message: 'Cập nhật thông tin thành công.');
    }
}
