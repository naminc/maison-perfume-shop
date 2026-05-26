<?php

namespace App\Http\Controllers\Api\V1;

use App\Services\Interfaces\SettingServiceInterface;

class SettingController extends BaseController
{
    public function __construct(
        protected SettingServiceInterface $settingService,
    ) {}

    public function publicSettings()
    {
        $result = $this->settingService->getPublic();

        if (! $result['ok']) {
            return api_error('Không thể lấy thông tin website.', 500);
        }

        return api_success(data: $result['data'], message: 'Lấy thông tin website thành công.');
    }

    public function maintenance()
    {
        $result = $this->settingService->getMaintenance();

        if (! $result['ok']) {
            return api_error('Không thể kiểm tra trạng thái bảo trì.', 500);
        }

        return api_success(data: $result['data'], message: 'Lấy trạng thái bảo trì thành công.');
    }
}
