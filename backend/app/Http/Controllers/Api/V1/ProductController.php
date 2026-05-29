<?php

namespace App\Http\Controllers\Api\V1;

use App\Services\Interfaces\ProductServiceInterface;
use Illuminate\Http\Request;

class ProductController extends BaseController
{
    public function __construct(
        protected ProductServiceInterface $productService,
    ) {}

    public function index(Request $request)
    {
        $result = $this->productService->getActiveList(
            $request->only(['search', 'gender', 'brand_id', 'category_id', 'is_featured', 'page', 'per_page'])
        );

        if (! $result['ok']) {
            return api_error($result['message'], 500);
        }

        return api_success(data: $result['data'], message: 'Lấy danh sách sản phẩm thành công.');
    }

    public function show(string $slug)
    {
        $result = $this->productService->getBySlug($slug);

        if (! $result['ok']) {
            return api_error($result['message'], 500);
        }

        if (! $result['data']) {
            return api_error('Không tìm thấy sản phẩm.', 404);
        }

        return api_success(data: $result['data'], message: 'Lấy chi tiết sản phẩm thành công.');
    }
}
