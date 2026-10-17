<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Api\V1\Admin\UpdateContactRequest;
use App\Services\Interfaces\ContactServiceInterface;
use Illuminate\Http\Request;

class ContactController extends BaseController
{
    public function __construct(
        protected ContactServiceInterface $contactService,
    ) {}

    public function index(Request $request)
    {
        $result = $this->contactService->getPaginated(
            $request->only(['search', 'status', 'page', 'per_page'])
        );

        if (! $result['ok']) {
            return api_error('Không thể lấy danh sách liên hệ. Vui lòng thử lại sau.', 500);
        }

        return api_success(data: $result['data'], message: 'Lấy danh sách liên hệ thành công.');
    }

    public function show(int $contact)
    {
        $result = $this->contactService->getById($contact);

        if (! $result['ok']) {
            return api_error('Không thể lấy chi tiết liên hệ. Vui lòng thử lại sau.', 500);
        }

        if (! $result['data']) {
            return api_error('Không tìm thấy liên hệ.', 404);
        }

        return api_success(data: $result['data'], message: 'Lấy chi tiết liên hệ thành công.');
    }

    public function update(UpdateContactRequest $request, int $contact)
    {
        $result = $this->contactService->update($contact, $request->validated());

        if (! $result['ok']) {
            return api_error('Không thể cập nhật liên hệ. Vui lòng thử lại sau.', 500);
        }

        $payload = $result['data'];

        if (! $payload['found']) {
            return api_error('Không tìm thấy liên hệ.', 404);
        }

        return api_success(data: $payload['contact'], message: 'Cập nhật liên hệ thành công.');
    }

    public function destroy(int $contact)
    {
        $result = $this->contactService->delete($contact);

        if (! $result['ok']) {
            return api_error('Không thể xoá liên hệ. Vui lòng thử lại sau.', 500);
        }

        $payload = $result['data'];

        if (! $payload['found']) {
            return api_error('Không tìm thấy liên hệ.', 404);
        }

        return api_success(data: null, message: 'Xoá liên hệ thành công.');
    }
}
