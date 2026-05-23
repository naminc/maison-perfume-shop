<?php

namespace App\Http\Controllers\Api\V1\Account;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Api\V1\Account\ChangePasswordRequest;
use App\Services\Interfaces\AuthServiceInterface;

class PasswordController extends BaseController
{
    public function __construct(
        protected AuthServiceInterface $authService,
    ) {}

    public function change(ChangePasswordRequest $request)
    {
        $result = $this->authService->changePassword(
            $request->user()->id,
            $request->validated()
        );

        if (! $result['ok']) {
            return api_error($result['message'], 500);
        }

        $payload = $result['data'];
        if (! $payload['changed']) {
            return api_error($payload['message'], 422, [
                'current_password' => [$payload['message']],
            ]);
        }

        return api_success(null, $payload['message']);
    }
}
