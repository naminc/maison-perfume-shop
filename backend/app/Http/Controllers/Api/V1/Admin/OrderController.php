<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Api\V1\Admin\UpdateOrderStatusRequest;
use App\Services\Interfaces\OrderServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class OrderController extends BaseController
{
    public function __construct(
        protected OrderServiceInterface $orderService,
    ) {}

    public function index(Request $request)
    {
        $result = $this->orderService->getPaginated(
            $request->only(['search', 'status', 'payment_status', 'payment_method', 'date_from', 'date_to', 'page', 'per_page'])
        );

        if (! $result['ok']) {
            return api_error('Không thể lấy danh sách đơn hàng. Vui lòng thử lại sau.', 500);
        }

        return api_success(data: $result['data'], message: 'Lấy danh sách đơn hàng thành công.');
    }

    public function show(string $order)
    {
        $result = $this->orderService->getByIdOrCode($order);

        if (! $result['ok']) {
            return api_error('Không thể lấy chi tiết đơn hàng. Vui lòng thử lại sau.', 500);
        }

        if (! $result['data']) {
            return api_error('Không tìm thấy đơn hàng.', 404);
        }

        return api_success(data: $result['data'], message: 'Lấy chi tiết đơn hàng thành công.');
    }

    public function updateStatus(UpdateOrderStatusRequest $request, string $order)
    {
        $result = $this->orderService->updateStatus($order, $request->validated());

        if (! $result['ok']) {
            if (($result['exception'] ?? null) instanceof ValidationException) {
                return api_validation_error($result['exception']->errors());
            }

            return api_error('Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại sau.', 500);
        }

        $payload = $result['data'];

        if (! $payload['found']) {
            return api_error('Không tìm thấy đơn hàng.', 404);
        }

        return api_success(data: $payload['order'], message: 'Cập nhật trạng thái đơn hàng thành công.');
    }

    public function destroy(string $order)
    {
        $result = $this->orderService->delete($order);

        if (! $result['ok']) {
            return api_error('Không thể xoá đơn hàng. Vui lòng thử lại sau.', 500);
        }

        $payload = $result['data'];

        if (! $payload['found']) {
            return api_error('Không tìm thấy đơn hàng.', 404);
        }

        return api_success(data: null, message: 'Xoá đơn hàng thành công.');
    }
}
