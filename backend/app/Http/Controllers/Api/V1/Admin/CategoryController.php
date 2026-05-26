<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Api\V1\Admin\StoreCategoryRequest;
use App\Http\Requests\Api\V1\Admin\UpdateCategoryRequest;
use App\Services\Interfaces\CategoryServiceInterface;
use Illuminate\Http\Request;

class CategoryController extends BaseController
{
    public function __construct(
        protected CategoryServiceInterface $categoryService,
    ) {}

    public function index(Request $request)
    {
        $result = $this->categoryService->getPaginated(
            $request->only(['search', 'status', 'parent_id', 'page', 'per_page'])
        );

        if (! $result['ok']) {
            return api_error('Không thể lấy danh sách danh mục. Vui lòng thử lại sau.', 500);
        }

        return api_success(data: $result['data'], message: 'Lấy danh sách danh mục thành công.');
    }

    public function store(StoreCategoryRequest $request)
    {
        $result = $this->categoryService->create($request->validated());

        if (! $result['ok']) {
            return api_error('Không thể thêm danh mục. Vui lòng thử lại sau.', 500);
        }

        return api_created(data: $result['data'], message: 'Thêm danh mục thành công.');
    }

    public function show(int $category)
    {
        $result = $this->categoryService->getById($category);

        if (! $result['ok']) {
            return api_error('Không thể lấy chi tiết danh mục. Vui lòng thử lại sau.', 500);
        }

        if (! $result['data']) {
            return api_error('Không tìm thấy danh mục.', 404);
        }

        return api_success(data: $result['data'], message: 'Lấy chi tiết danh mục thành công.');
    }

    public function update(UpdateCategoryRequest $request, int $category)
    {
        $result = $this->categoryService->update($category, $request->validated());

        if (! $result['ok']) {
            return api_error('Không thể cập nhật danh mục. Vui lòng thử lại sau.', 500);
        }

        $payload = $result['data'];

        if (! $payload['found']) {
            return api_error('Không tìm thấy danh mục.', 404);
        }

        if (! $payload['updated']) {
            return api_error($payload['message'], 422);
        }

        return api_success(data: $payload['category'], message: 'Cập nhật danh mục thành công.');
    }

    public function destroy(int $category)
    {
        $result = $this->categoryService->delete($category);

        if (! $result['ok']) {
            return api_error('Không thể xoá danh mục. Vui lòng thử lại sau.', 500);
        }

        $payload = $result['data'];

        if (! $payload['found']) {
            return api_error('Không tìm thấy danh mục.', 404);
        }

        if (! $payload['deleted']) {
            return api_error($payload['message'], 422);
        }

        return api_success(data: null, message: 'Xoá danh mục thành công.');
    }
}
