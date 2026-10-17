<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Api\V1\Admin\StoreSupplierRequest;
use App\Http\Requests\Api\V1\Admin\UpdateSupplierRequest;
use App\Services\Interfaces\SupplierServiceInterface;
use Illuminate\Http\Request;

class SupplierController extends BaseController
{
    public function __construct(protected SupplierServiceInterface $service) {}

    public function index(Request $request)
    {
        $r = $this->service->getPaginated($request->only(['search', 'status', 'page', 'per_page']));

        return $r['ok'] ? api_success(data: $r['data']) : api_error('Không thể lấy danh sách nhà cung cấp.', 500);
    }

    public function store(StoreSupplierRequest $request)
    {
        $r = $this->service->create($request->validated());

        return $r['ok'] ? api_created(data: $r['data'], message: 'Thêm nhà cung cấp thành công.') : api_error('Không thể thêm nhà cung cấp.', 500);
    }

    public function show(int $supplier)
    {
        $r = $this->service->getById($supplier);

        return ! $r['ok'] ? api_error('Không thể lấy nhà cung cấp.', 500) : ($r['data'] ? api_success(data: $r['data']) : api_error('Không tìm thấy nhà cung cấp.', 404));
    }

    public function update(UpdateSupplierRequest $request, int $supplier)
    {
        $r = $this->service->update($supplier, $request->validated());

        return ! $r['ok'] ? api_error('Không thể cập nhật nhà cung cấp.', 500) : ($r['data']['found'] ? api_success(data: $r['data']['supplier'], message: 'Cập nhật nhà cung cấp thành công.') : api_error('Không tìm thấy nhà cung cấp.', 404));
    }

    public function destroy(int $supplier)
    {
        $r = $this->service->delete($supplier);

        return ! $r['ok'] ? api_error('Không thể xoá nhà cung cấp.', 500) : ($r['data']['found'] ? api_success(message: 'Xoá nhà cung cấp thành công.') : api_error('Không tìm thấy nhà cung cấp.', 404));
    }
}
