<?php

namespace App\Http\Controllers\Api\V1\Account;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Api\V1\Account\StoreProductReviewRequest;
use App\Services\Interfaces\ProductReviewServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ProductReviewController extends BaseController
{
    public function __construct(
        protected ProductReviewServiceInterface $reviewService,
    ) {}

    public function index(Request $request)
    {
        $result = $this->reviewService->getMyReviews(
            $request->user(),
            $request->only(['search', 'status', 'rating', 'page', 'per_page'])
        );

        if (! $result['ok']) {
            return api_error('Không thể lấy danh sách đánh giá. Vui lòng thử lại sau.', 500);
        }

        return api_success(data: $result['data'], message: 'Lấy danh sách đánh giá thành công.');
    }

    public function reviewableItems(Request $request)
    {
        $result = $this->reviewService->getReviewableItems($request->user());

        if (! $result['ok']) {
            return api_error('Không thể lấy sản phẩm có thể đánh giá. Vui lòng thử lại sau.', 500);
        }

        return api_success(data: $result['data'], message: 'Lấy sản phẩm có thể đánh giá thành công.');
    }

    public function store(StoreProductReviewRequest $request)
    {
        $result = $this->reviewService->createReview(
            $request->user(),
            $request->validated()
        );

        if (! $result['ok']) {
            if (($result['exception'] ?? null) instanceof ValidationException) {
                return api_validation_error($result['exception']->errors());
            }

            return api_error('Không thể tạo đánh giá. Vui lòng thử lại sau.', 500);
        }

        return api_created(data: $result['data'], message: 'Đánh giá đã được gửi và đang chờ duyệt.');
    }
}
