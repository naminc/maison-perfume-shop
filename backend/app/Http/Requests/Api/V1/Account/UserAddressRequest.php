<?php

namespace App\Http\Requests\Api\V1\Account;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class UserAddressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'receiver_name'    => ['required', 'string', 'max:100'],
            'receiver_phone'   => ['required', 'string', 'max:20'],
            'province_code'    => ['required', 'string', 'max:10'],
            'province_name'    => ['required', 'string', 'max:100'],
            'ward_code'        => ['required', 'string', 'max:10'],
            'ward_name'        => ['required', 'string', 'max:100'],
            'specific_address' => ['required', 'string', 'max:255'],
            'address_type'     => ['sometimes', 'string', 'in:home,office,other'],
            'is_default'       => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'receiver_name.required'    => 'Vui lòng nhập tên người nhận.',
            'receiver_phone.required'   => 'Vui lòng nhập số điện thoại.',
            'province_code.required'    => 'Vui lòng chọn Tỉnh/Thành phố.',
            'ward_code.required'        => 'Vui lòng chọn Phường/Xã.',
            'specific_address.required' => 'Vui lòng nhập địa chỉ cụ thể.',
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(
            api_validation_error($validator->errors())
        );
    }
}
