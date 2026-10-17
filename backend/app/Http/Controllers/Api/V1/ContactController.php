<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\StoreContactRequest;
use App\Services\Interfaces\ContactServiceInterface;

class ContactController extends BaseController
{
    public function __construct(
        protected ContactServiceInterface $contactService,
    ) {}

    public function store(StoreContactRequest $request)
    {
        $result = $this->contactService->create($request->validated());

        if (! $result['ok']) {
            return api_error('Không thể gửi liên hệ. Vui lòng thử lại sau.', 500);
        }

        return api_success(
            data: null,
            message: 'Đã nhận được tin nhắn của bạn. Maison sẽ phản hồi trong vòng 24 giờ.',
            status: 201,
        );
    }
}
