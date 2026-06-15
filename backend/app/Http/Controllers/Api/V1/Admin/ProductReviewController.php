<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Api\V1\Admin\ProductReviewModerationRequest;
use App\Http\Requests\Api\V1\Admin\UpdateProductReviewRequest;
use App\Services\Interfaces\ProductReviewServiceInterface;
use Illuminate\Http\Request;

class ProductReviewController extends BaseController
{
    public function __construct(
        protected ProductReviewServiceInterface $reviewService,
    ) {}

    public function index(Request $request)
    {
        $result = $this->reviewService->getPaginated(
            $request->only(['search', 'status', 'rating', 'product_id', 'page', 'per_page'])
        );

        if (! $result['ok']) {
            return api_error('Không thể lấy danh sách đánh giá. Vui lòng thử lại sau.', 500);
        }

        return api_success(data: $result['data'], message: 'Lấy danh sách đánh giá thành công.');
    }

    public function show(int $productReview)
    {
        $result = $this->reviewService->getById($productReview);

        if (! $result['ok']) {
            return api_error('Không thể lấy chi tiết đánh giá. Vui lòng thử lại sau.', 500);
        }

        if (! $result['data']) {
            return api_error('Không tìm thấy đánh giá.', 404);
        }

        return api_success(data: $result['data'], message: 'Lấy chi tiết đánh giá thành công.');
    }

    public function approve(int $productReview)
    {
        $result = $this->reviewService->approve($productReview);

        if (! $result['ok']) {
            return api_error('Không thể duyệt đánh giá. Vui lòng thử lại sau.', 500);
        }

        $payload = $result['data'];

        if (! $payload['found']) {
            return api_error('Không tìm thấy đánh giá.', 404);
        }

        return api_success(data: $payload['review'], message: 'Đã duyệt đánh giá.');
    }

    public function reject(ProductReviewModerationRequest $request, int $productReview)
    {
        $result = $this->reviewService->reject($productReview, $request->validated('admin_note'));

        if (! $result['ok']) {
            return api_error('Không thể từ chối đánh giá. Vui lòng thử lại sau.', 500);
        }

        $payload = $result['data'];

        if (! $payload['found']) {
            return api_error('Không tìm thấy đánh giá.', 404);
        }

        return api_success(data: $payload['review'], message: 'Đã từ chối đánh giá.');
    }

    public function update(UpdateProductReviewRequest $request, int $productReview)
    {
        $result = $this->reviewService->update($productReview, $request->validated());

        if (! $result['ok']) {
            return api_error('Không thể cập nhật đánh giá. Vui lòng thử lại sau.', 500);
        }

        $payload = $result['data'];

        if (! $payload['found']) {
            return api_error('Không tìm thấy đánh giá.', 404);
        }

        return api_success(data: $payload['review'], message: 'Cập nhật đánh giá thành công.');
    }

    public function destroy(int $productReview)
    {
        $result = $this->reviewService->delete($productReview);

        if (! $result['ok']) {
            return api_error('Không thể xoá đánh giá. Vui lòng thử lại sau.', 500);
        }

        $payload = $result['data'];

        if (! $payload['found']) {
            return api_error('Không tìm thấy đánh giá.', 404);
        }

        return api_success(data: null, message: 'Xoá đánh giá thành công.');
    }
}
