<?php

namespace App\Http\Requests\Api\V1\Admin;

use Illuminate\Validation\Rule;

class UpdateCouponRequest extends StoreCouponRequest
{
    public function rules(): array
    {
        $couponId = (int) $this->route('coupon');
        $rules = parent::rules();
        $rules['code'] = ['required', 'string', 'max:50', 'regex:/^[A-Z0-9_-]+$/', Rule::unique('coupons', 'code')->ignore($couponId)];

        return $rules;
    }
}
