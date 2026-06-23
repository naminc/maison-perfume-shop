<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\ValidateCouponRequest;
use App\Services\Interfaces\CouponServiceInterface;
use Illuminate\Validation\ValidationException;

class CouponController extends BaseController
{
    public function __construct(
        protected CouponServiceInterface $couponService,
    ) {}

    public function validateCoupon(ValidateCouponRequest $request)
    {
        $result = $this->couponService->validateForCheckout(
            $request->user(),
            $request->validated()
        );

        if (! $result['ok']) {
            if (($result['exception'] ?? null) instanceof ValidationException) {
                return api_validation_error($result['exception']->errors());
            }

            return api_error('Không thể kiểm tra mã giảm giá. Vui lòng thử lại sau.', 500);
        }

        return api_success(data: $result['data'], message: 'Áp dụng mã giảm giá thành công.');
    }
}
