<?php

namespace App\Http\Controllers\Api\V1;

use App\Services\Interfaces\CategoryServiceInterface;

class CategoryController extends BaseController
{
    public function __construct(
        protected CategoryServiceInterface $categoryService,
    ) {}

    public function index()
    {
        $result = $this->categoryService->getActiveTree();

        if (! $result['ok']) {
            return api_error($result['message'], 500);
        }

        return api_success(data: $result['data'], message: 'Lấy danh mục thành công.');
    }
}
