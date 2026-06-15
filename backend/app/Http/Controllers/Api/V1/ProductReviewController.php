<?php

namespace App\Http\Controllers\Api\V1;

use App\Services\Interfaces\ProductReviewServiceInterface;
use Illuminate\Http\Request;

class ProductReviewController extends BaseController
{
    public function __construct(
        protected ProductReviewServiceInterface $reviewService,
    ) {}

    public function index(Request $request, string $slug)
    {
        $result = $this->reviewService->getApprovedByProductSlug(
            $slug,
            $request->only(['page', 'per_page'])
        );

        if (! $result['ok']) {
            return api_error('Không thể lấy danh sách đánh giá. Vui lòng thử lại sau.', 500);
        }

        $payload = $result['data'];

        if (! $payload['found']) {
            return api_error('Không tìm thấy sản phẩm.', 404);
        }

        return api_success(data: $payload['reviews'], message: 'Lấy danh sách đánh giá thành công.');
    }

    public function summary(string $slug)
    {
        $result = $this->reviewService->getSummaryByProductSlug($slug);

        if (! $result['ok']) {
            return api_error('Không thể lấy thống kê đánh giá. Vui lòng thử lại sau.', 500);
        }

        $payload = $result['data'];

        if (! $payload['found']) {
            return api_error('Không tìm thấy sản phẩm.', 404);
        }

        return api_success(data: $payload['summary'], message: 'Lấy thống kê đánh giá thành công.');
    }
}
