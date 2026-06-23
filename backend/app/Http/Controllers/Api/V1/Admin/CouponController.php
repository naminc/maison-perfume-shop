<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Api\V1\Admin\StoreCouponRequest;
use App\Http\Requests\Api\V1\Admin\UpdateCouponRequest;
use App\Services\Interfaces\CouponServiceInterface;
use Illuminate\Http\Request;

class CouponController extends BaseController
{
    public function __construct(
        protected CouponServiceInterface $couponService,
    ) {}

    public function index(Request $request)
    {
        $result = $this->couponService->getPaginated(
            $request->only(['search', 'status', 'type', 'page', 'per_page'])
        );

        if (! $result['ok']) {
            return api_error('Không thể lấy danh sách mã giảm giá. Vui lòng thử lại sau.', 500);
        }

        return api_success(data: $result['data'], message: 'Lấy danh sách mã giảm giá thành công.');
    }

    public function store(StoreCouponRequest $request)
    {
        $result = $this->couponService->create($request->validated());

        if (! $result['ok']) {
            return api_error('Không thể thêm mã giảm giá. Vui lòng thử lại sau.', 500);
        }

        return api_created(data: $result['data'], message: 'Thêm mã giảm giá thành công.');
    }

    public function show(int $coupon)
    {
        $result = $this->couponService->getById($coupon);

        if (! $result['ok']) {
            return api_error('Không thể lấy chi tiết mã giảm giá. Vui lòng thử lại sau.', 500);
        }

        if (! $result['data']) {
            return api_error('Không tìm thấy mã giảm giá.', 404);
        }

        return api_success(data: $result['data'], message: 'Lấy chi tiết mã giảm giá thành công.');
    }

    public function update(UpdateCouponRequest $request, int $coupon)
    {
        $result = $this->couponService->update($coupon, $request->validated());

        if (! $result['ok']) {
            return api_error('Không thể cập nhật mã giảm giá. Vui lòng thử lại sau.', 500);
        }

        $payload = $result['data'];

        if (! $payload['found']) {
            return api_error('Không tìm thấy mã giảm giá.', 404);
        }

        return api_success(data: $payload['coupon'], message: 'Cập nhật mã giảm giá thành công.');
    }

    public function destroy(int $coupon)
    {
        $result = $this->couponService->delete($coupon);

        if (! $result['ok']) {
            return api_error('Không thể xoá mã giảm giá. Vui lòng thử lại sau.', 500);
        }

        $payload = $result['data'];

        if (! $payload['found']) {
            return api_error('Không tìm thấy mã giảm giá.', 404);
        }

        return api_success(data: null, message: 'Xoá mã giảm giá thành công.');
    }
}
