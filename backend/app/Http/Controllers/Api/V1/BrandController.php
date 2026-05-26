<?php

namespace App\Http\Controllers\Api\V1;

use App\Services\Interfaces\BrandServiceInterface;

class BrandController extends BaseController
{
    public function __construct(
        protected BrandServiceInterface $brandService,
    ) {}

    public function index()
    {
        $result = $this->brandService->getActiveList();

        if (! $result['ok']) {
            return api_error($result['message'], 500);
        }

        return api_success(data: $result['data'], message: 'Lấy thương hiệu thành công.');
    }
}
