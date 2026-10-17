<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Api\V1\Admin\StorePurchaseOrderRequest;
use App\Http\Requests\Api\V1\Admin\UpdatePurchaseOrderRequest;
use App\Http\Requests\Api\V1\Admin\UpdatePurchaseOrderStatusRequest;
use App\Services\Interfaces\PurchaseOrderServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class PurchaseOrderController extends BaseController
{
    public function __construct(protected PurchaseOrderServiceInterface $service) {}

    public function index(Request $request)
    {
        $r = $this->service->getPaginated($request->only(['search', 'supplier_id', 'status', 'date_from', 'date_to', 'page', 'per_page']));

        return $r['ok'] ? api_success(data: $r['data']) : api_error('Không thể lấy danh sách phiếu nhập.', 500);
    }

    public function summary()
    {
        $r = $this->service->getSummary();

        return $r['ok'] ? api_success(data: $r['data']) : api_error('Không thể lấy thống kê phiếu nhập.', 500);
    }

    public function store(StorePurchaseOrderRequest $request)
    {
        return $this->writeResult($this->service->create($request->validated(), $request->user()), true);
    }

    public function show(int $purchaseOrder)
    {
        $r = $this->service->getById($purchaseOrder);

        return ! $r['ok'] ? api_error('Không thể lấy phiếu nhập.', 500) : ($r['data'] ? api_success(data: $r['data']) : api_error('Không tìm thấy phiếu nhập.', 404));
    }

    public function update(UpdatePurchaseOrderRequest $request, int $purchaseOrder)
    {
        return $this->writeResult($this->service->update($purchaseOrder, $request->validated()));
    }

    public function updateStatus(UpdatePurchaseOrderStatusRequest $request, int $purchaseOrder)
    {
        return $this->writeResult($this->service->updateStatus($purchaseOrder, $request->validated('status'), $request->user()));
    }

    public function destroy(int $purchaseOrder)
    {
        $r = $this->service->delete($purchaseOrder);
        if (! $r['ok']) {
            return $this->failure($r);
        }

        return $r['data']['found'] ? api_success(message: 'Xoá phiếu nhập thành công.') : api_error('Không tìm thấy phiếu nhập.', 404);
    }

    private function writeResult(array $result, bool $created = false)
    {
        if (! $result['ok']) {
            return $this->failure($result);
        }
        $data = $result['data'];
        if (is_array($data) && array_key_exists('found', $data)) {
            if (! $data['found']) {
                return api_error('Không tìm thấy phiếu nhập.', 404);
            }
            $data = $data['purchase_order'];
        }

        return $created ? api_created(data: $data, message: 'Tạo phiếu nhập thành công.') : api_success(data: $data, message: 'Cập nhật phiếu nhập thành công.');
    }

    private function failure(array $result)
    {
        return ($result['exception'] ?? null) instanceof ValidationException
            ? api_validation_error($result['exception']->errors())
            : api_error('Không thể xử lý phiếu nhập.', 500);
    }
}
