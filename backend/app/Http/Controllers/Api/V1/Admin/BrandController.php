<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Api\V1\Admin\StoreBrandRequest;
use App\Http\Requests\Api\V1\Admin\UpdateBrandRequest;
use App\Services\Interfaces\BrandServiceInterface;
use Illuminate\Http\Request;

class BrandController extends BaseController
{
    public function __construct(
        protected BrandServiceInterface $brandService,
    ) {}

    public function index(Request $request)
    {
        $result = $this->brandService->getPaginated(
            $request->only(['search', 'status', 'page', 'per_page'])
        );

        if (! $result['ok']) {
            return api_error('Không thể lấy danh sách thương hiệu. Vui lòng thử lại sau.', 500);
        }

        return api_success(data: $result['data'], message: 'Lấy danh sách thương hiệu thành công.');
    }

    public function store(StoreBrandRequest $request)
    {
        $result = $this->brandService->create($request->validated());

        if (! $result['ok']) {
            return api_error('Không thể thêm thương hiệu. Vui lòng thử lại sau.', 500);
        }

        return api_created(data: $result['data'], message: 'Thêm thương hiệu thành công.');
    }

    public function show(int $brand)
    {
        $result = $this->brandService->getById($brand);

        if (! $result['ok']) {
            return api_error('Không thể lấy chi tiết thương hiệu. Vui lòng thử lại sau.', 500);
        }

        if (! $result['data']) {
            return api_error('Không tìm thấy thương hiệu.', 404);
        }

        return api_success(data: $result['data'], message: 'Lấy chi tiết thương hiệu thành công.');
    }

    public function update(UpdateBrandRequest $request, int $brand)
    {
        $result = $this->brandService->update($brand, $request->validated());

        if (! $result['ok']) {
            return api_error('Không thể cập nhật thương hiệu. Vui lòng thử lại sau.', 500);
        }

        $payload = $result['data'];

        if (! $payload['found']) {
            return api_error('Không tìm thấy thương hiệu.', 404);
        }

        return api_success(data: $payload['brand'], message: 'Cập nhật thương hiệu thành công.');
    }

    public function destroy(int $brand)
    {
        $result = $this->brandService->delete($brand);

        if (! $result['ok']) {
            return api_error('Không thể xoá thương hiệu. Vui lòng thử lại sau.', 500);
        }

        $payload = $result['data'];

        if (! $payload['found']) {
            return api_error('Không tìm thấy thương hiệu.', 404);
        }

        return api_success(data: null, message: 'Xoá thương hiệu thành công.');
    }
}
