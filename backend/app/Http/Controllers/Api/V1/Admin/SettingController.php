<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Api\V1\Admin\UpdateSettingsRequest;
use App\Services\Interfaces\SettingServiceInterface;

class SettingController extends BaseController
{
    public function __construct(
        protected SettingServiceInterface $settingService,
    ) {}

    public function index()
    {
        $result = $this->settingService->getAllGrouped();

        if (! $result['ok']) {
            return api_error($result['message'], 500);
        }

        return api_success(data: $result['data'], message: 'Lấy cấu hình hệ thống thành công.');
    }

    public function update(UpdateSettingsRequest $request)
    {
        $result = $this->settingService->updateBulk($request->validated());

        if (! $result['ok']) {
            return api_error($result['message'], 500);
        }

        return api_success(data: $result['data'], message: 'Cập nhật cấu hình hệ thống thành công.');
    }
}
