<?php

namespace App\Http\Controllers\Api\V1\Account;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Api\V1\Account\UserAddressRequest;
use App\Services\Interfaces\AddressServiceInterface;
use Illuminate\Http\Request;

class AddressController extends BaseController
{
    public function __construct(
        protected AddressServiceInterface $addressService,
    ) {}

    public function index(Request $request)
    {
        $result = $this->addressService->getAddresses($request->user()->id);

        if (! $result['ok']) {
            return api_error($result['message'], 500);
        }

        return api_success(data: $result['data'], message: 'Lấy danh sách địa chỉ thành công.');
    }

    public function store(UserAddressRequest $request)
    {
        $result = $this->addressService->createAddress(
            $request->user()->id,
            $request->validated()
        );

        if (! $result['ok']) {
            return api_error($result['message'], 500);
        }

        return api_created(data: $result['data'], message: 'Thêm địa chỉ thành công.');
    }

    public function update(UserAddressRequest $request, int $id)
    {
        $result = $this->addressService->updateAddress(
            $request->user()->id,
            $id,
            $request->validated()
        );

        if (! $result['ok']) {
            return api_error($result['message'], 500);
        }

        $payload = $result['data'];

        if (! $payload['found']) {
            return api_error('Không tìm thấy địa chỉ.', 404);
        }

        return api_success(data: $payload['address'], message: 'Cập nhật địa chỉ thành công.');
    }

    public function destroy(Request $request, int $id)
    {
        $result = $this->addressService->deleteAddress(
            $request->user()->id,
            $id
        );

        if (! $result['ok']) {
            return api_error($result['message'], 500);
        }

        if (! $result['data']['found']) {
            return api_error('Không tìm thấy địa chỉ.', 404);
        }

        return api_success(data: null, message: 'Xoá địa chỉ thành công.');
    }

    public function setDefault(Request $request, int $id)
    {
        $result = $this->addressService->setDefaultAddress(
            $request->user()->id,
            $id
        );

        if (! $result['ok']) {
            return api_error($result['message'], 500);
        }

        if (! $result['data']['found']) {
            return api_error('Không tìm thấy địa chỉ.', 404);
        }

        return api_success(data: null, message: 'Đã đặt làm địa chỉ mặc định.');
    }
}
