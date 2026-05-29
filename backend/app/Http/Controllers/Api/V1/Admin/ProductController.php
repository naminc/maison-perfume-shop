<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Api\V1\Admin\StoreProductRequest;
use App\Http\Requests\Api\V1\Admin\UpdateProductRequest;
use App\Services\Interfaces\ProductServiceInterface;
use Illuminate\Http\Request;

class ProductController extends BaseController
{
    public function __construct(
        protected ProductServiceInterface $productService,
    ) {}

    public function index(Request $request)
    {
        $result = $this->productService->getPaginated(
            $request->only(['search', 'status', 'gender', 'brand_id', 'category_id', 'is_featured', 'page', 'per_page'])
        );

        if (! $result['ok']) {
            return api_error('Không thể lấy danh sách sản phẩm. Vui lòng thử lại sau.', 500);
        }

        return api_success(data: $result['data'], message: 'Lấy danh sách sản phẩm thành công.');
    }

    public function store(StoreProductRequest $request)
    {
        $result = $this->productService->create($request->validated());

        if (! $result['ok']) {
            return api_error('Không thể thêm sản phẩm. Vui lòng thử lại sau.', 500);
        }

        return api_created(data: $result['data'], message: 'Thêm sản phẩm thành công.');
    }

    public function show(int $product)
    {
        $result = $this->productService->getById($product);

        if (! $result['ok']) {
            return api_error('Không thể lấy chi tiết sản phẩm. Vui lòng thử lại sau.', 500);
        }

        if (! $result['data']) {
            return api_error('Không tìm thấy sản phẩm.', 404);
        }

        return api_success(data: $result['data'], message: 'Lấy chi tiết sản phẩm thành công.');
    }

    public function update(UpdateProductRequest $request, int $product)
    {
        $result = $this->productService->update($product, $request->validated());

        if (! $result['ok']) {
            return api_error('Không thể cập nhật sản phẩm. Vui lòng thử lại sau.', 500);
        }

        $payload = $result['data'];

        if (! $payload['found']) {
            return api_error('Không tìm thấy sản phẩm.', 404);
        }

        return api_success(data: $payload['product'], message: 'Cập nhật sản phẩm thành công.');
    }

    public function destroy(int $product)
    {
        $result = $this->productService->delete($product);

        if (! $result['ok']) {
            return api_error('Không thể xoá sản phẩm. Vui lòng thử lại sau.', 500);
        }

        $payload = $result['data'];

        if (! $payload['found']) {
            return api_error('Không tìm thấy sản phẩm.', 404);
        }

        return api_success(data: null, message: 'Xoá sản phẩm thành công.');
    }
}
