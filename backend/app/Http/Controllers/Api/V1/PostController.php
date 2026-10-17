<?php

namespace App\Http\Controllers\Api\V1;

use App\Services\Interfaces\PostServiceInterface;
use Illuminate\Http\Request;

class PostController extends BaseController
{
    public function __construct(
        protected PostServiceInterface $postService,
    ) {}

    public function index(Request $request)
    {
        $result = $this->postService->getPublishedList(
            $request->only(['category', 'page', 'per_page'])
        );

        if (! $result['ok']) {
            return api_error('Không thể lấy danh sách bài viết. Vui lòng thử lại sau.', 500);
        }

        return api_success(data: $result['data'], message: 'Lấy danh sách bài viết thành công.');
    }

    public function show(string $slug)
    {
        $result = $this->postService->getPublishedBySlug($slug);

        if (! $result['ok']) {
            return api_error('Không thể lấy chi tiết bài viết. Vui lòng thử lại sau.', 500);
        }

        if (! $result['data']) {
            return api_error('Không tìm thấy bài viết.', 404);
        }

        return api_success(data: $result['data'], message: 'Lấy chi tiết bài viết thành công.');
    }
}
