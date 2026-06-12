<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\StoreOrderRequest;
use App\Services\Interfaces\OrderServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class OrderController extends BaseController
{
    public function __construct(
        protected OrderServiceInterface $orderService,
    ) {}

    public function store(StoreOrderRequest $request)
    {
        $result = $this->orderService->createFromCheckout(
            $request->user(),
            $request->validated()
        );

        if (! $result['ok']) {
            if (($result['exception'] ?? null) instanceof ValidationException) {
                return api_validation_error($result['exception']->errors());
            }

            return api_error('Không thể tạo đơn hàng. Vui lòng thử lại sau.', 500);
        }

        return api_created(data: $result['data'], message: 'Đặt hàng thành công.');
    }

    public function myOrders(Request $request)
    {
        $result = $this->orderService->getUserOrders(
            $request->user(),
            $request->only(['search', 'status', 'payment_status', 'page', 'per_page'])
        );

        if (! $result['ok']) {
            return api_error('Không thể lấy danh sách đơn hàng. Vui lòng thử lại sau.', 500);
        }

        return api_success(data: $result['data'], message: 'Lấy danh sách đơn hàng thành công.');
    }

    public function show(Request $request, string $order)
    {
        $result = $this->orderService->getUserOrder($request->user(), $order);

        if (! $result['ok']) {
            return api_error('Không thể lấy chi tiết đơn hàng. Vui lòng thử lại sau.', 500);
        }

        $payload = $result['data'];

        if (! $payload['found']) {
            return api_error('Không tìm thấy đơn hàng.', 404);
        }

        return api_success(data: $payload['order'], message: 'Lấy chi tiết đơn hàng thành công.');
    }
}
