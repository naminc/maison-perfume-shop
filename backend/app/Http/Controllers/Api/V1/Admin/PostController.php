<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Api\V1\Admin\StorePostRequest;
use App\Http\Requests\Api\V1\Admin\UpdatePostRequest;
use App\Services\Interfaces\PostServiceInterface;
use Illuminate\Http\Request;

class PostController extends BaseController
{
    public function __construct(
        protected PostServiceInterface $postService,
    ) {}

    public function index(Request $request)
    {
        $result = $this->postService->getPaginated(
            $request->only(['search', 'status', 'category', 'page', 'per_page'])
        );

        if (! $result['ok']) {
            return api_error('Không thể lấy danh sách bài viết. Vui lòng thử lại sau.', 500);
        }

        return api_success(data: $result['data'], message: 'Lấy danh sách bài viết thành công.');
    }

    public function show(int $post)
    {
        $result = $this->postService->getById($post);

        if (! $result['ok']) {
            return api_error('Không thể lấy chi tiết bài viết. Vui lòng thử lại sau.', 500);
        }

        if (! $result['data']) {
            return api_error('Không tìm thấy bài viết.', 404);
        }

        return api_success(data: $result['data'], message: 'Lấy chi tiết bài viết thành công.');
    }

    public function store(StorePostRequest $request)
    {
        $result = $this->postService->create($request->validated());

        if (! $result['ok']) {
            return api_error('Không thể tạo bài viết. Vui lòng thử lại sau.', 500);
        }

        return api_success(data: $result['data'], message: 'Tạo bài viết thành công.', status: 201);
    }

    public function update(UpdatePostRequest $request, int $post)
    {
        $result = $this->postService->update($post, $request->validated());

        if (! $result['ok']) {
            return api_error('Không thể cập nhật bài viết. Vui lòng thử lại sau.', 500);
        }

        $payload = $result['data'];

        if (! $payload['found']) {
            return api_error('Không tìm thấy bài viết.', 404);
        }

        return api_success(data: $payload['post'], message: 'Cập nhật bài viết thành công.');
    }

    public function destroy(int $post)
    {
        $result = $this->postService->delete($post);

        if (! $result['ok']) {
            return api_error('Không thể xoá bài viết. Vui lòng thử lại sau.', 500);
        }

        $payload = $result['data'];

        if (! $payload['found']) {
            return api_error('Không tìm thấy bài viết.', 404);
        }

        return api_success(data: null, message: 'Xoá bài viết thành công.');
    }
}
