<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\BaseController;
use App\Services\Interfaces\DashboardServiceInterface;
use Illuminate\Http\Request;

class DashboardController extends BaseController
{
    public function __construct(
        protected DashboardServiceInterface $dashboardService,
    ) {}

    public function stats(Request $request)
    {
        $result = $this->dashboardService->getStats(
            $request->only(['period', 'from', 'to'])
        );

        if (! $result['ok']) {
            return api_error('Không thể lấy số liệu tổng quan. Vui lòng thử lại sau.', 500);
        }

        return api_success(data: $result['data'], message: 'Lấy số liệu tổng quan thành công.');
    }
}
