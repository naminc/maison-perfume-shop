<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Api\V1\Admin\StoreStockAdjustmentRequest;
use App\Models\ProductVariant;
use App\Services\Interfaces\InventoryServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class InventoryController extends BaseController
{
    public function __construct(
        protected InventoryServiceInterface $inventoryService,
    ) {}

    public function movements(Request $request)
    {
        $result = $this->inventoryService->getMovements(
            $request->only(['search', 'product_id', 'product_variant_id', 'type', 'date_from', 'date_to', 'page', 'per_page'])
        );

        if (! $result['ok']) {
            return api_error('Không thể lấy lịch sử tồn kho. Vui lòng thử lại sau.', 500);
        }

        return api_success(data: $result['data'], message: 'Lấy lịch sử tồn kho thành công.');
    }

    public function productMovements(Request $request, int $product)
    {
        $result = $this->inventoryService->getProductMovements(
            $product,
            $request->only(['type', 'date_from', 'date_to', 'page', 'per_page'])
        );

        if (! $result['ok']) {
            return api_error('Không thể lấy lịch sử tồn kho. Vui lòng thử lại sau.', 500);
        }

        if (! $result['data']['found']) {
            return api_error('Không tìm thấy sản phẩm.', 404);
        }

        return api_success(data: $result['data'], message: 'Lấy lịch sử tồn kho thành công.');
    }

    public function variantMovements(Request $request, int $variant)
    {
        $result = $this->inventoryService->getVariantMovements(
            $variant,
            $request->only(['type', 'date_from', 'date_to', 'page', 'per_page'])
        );

        if (! $result['ok']) {
            return api_error('Không thể lấy lịch sử tồn kho. Vui lòng thử lại sau.', 500);
        }

        if (! $result['data']['found']) {
            return api_error('Không tìm thấy phiên bản sản phẩm.', 404);
        }

        return api_success(data: $result['data'], message: 'Lấy lịch sử tồn kho thành công.');
    }

    public function adjust(StoreStockAdjustmentRequest $request, int $variant)
    {
        $found = ProductVariant::query()->find($variant);

        if (! $found) {
            return api_error('Không tìm thấy phiên bản sản phẩm.', 404);
        }

        $data = $request->validated();
        $result = $this->inventoryService->adjustStock(
            $found,
            (int) $data['quantity'],
            (string) $data['type'],
            $request->user(),
            $data['note'] ?? null,
            $data['reference'] ?? null,
        );

        if (! $result['ok']) {
            if (($result['exception'] ?? null) instanceof ValidationException) {
                return api_validation_error($result['exception']->errors());
            }

            return api_error('Không thể điều chỉnh tồn kho. Vui lòng thử lại sau.', 500);
        }

        return api_created(data: $result['data'], message: 'Điều chỉnh tồn kho thành công.');
    }
}
