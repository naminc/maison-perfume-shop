<?php

namespace App\Http\Controllers\Api\V1\Account;

use App\Http\Controllers\Api\V1\BaseController;
use App\Services\Interfaces\WishlistServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class WishlistController extends BaseController
{
    public function __construct(
        protected WishlistServiceInterface $wishlistService,
    ) {}

    public function index(Request $request)
    {
        $result = $this->wishlistService->getForUser($request->user());

        if (! $result['ok']) {
            return api_error('Không thể lấy danh sách yêu thích. Vui lòng thử lại sau.', 500);
        }

        return api_success(data: $result['data'], message: 'Lấy danh sách yêu thích thành công.');
    }

    public function toggle(Request $request)
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'min:1'],
        ], [
            'product_id.required' => 'Vui lòng chọn sản phẩm.',
            'product_id.integer' => 'Sản phẩm không hợp lệ.',
        ]);

        $result = $this->wishlistService->toggle($request->user(), (int) $validated['product_id']);

        if (! $result['ok']) {
            if (($result['exception'] ?? null) instanceof ValidationException) {
                return api_validation_error($result['exception']->errors());
            }

            return api_error('Không thể cập nhật danh sách yêu thích. Vui lòng thử lại sau.', 500);
        }

        $payload = $result['data'];

        return api_success(
            data: $payload,
            message: $payload['in_wishlist']
                ? 'Đã thêm sản phẩm vào danh sách yêu thích.'
                : 'Đã xoá sản phẩm khỏi danh sách yêu thích.',
        );
    }

    public function destroy(Request $request, int $productId)
    {
        $result = $this->wishlistService->remove($request->user(), $productId);

        if (! $result['ok']) {
            return api_error('Không thể xoá sản phẩm khỏi danh sách yêu thích. Vui lòng thử lại sau.', 500);
        }

        $payload = $result['data'];

        if (! $payload['found']) {
            return api_error('Sản phẩm không có trong danh sách yêu thích.', 404);
        }

        return api_success(data: null, message: 'Đã xoá sản phẩm khỏi danh sách yêu thích.');
    }
}
