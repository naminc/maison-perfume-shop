<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class ValidateCouponRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code'               => ['required', 'string', 'max:50'],
            'shipping_method'    => ['required', 'string', Rule::in(['standard', 'express'])],
            'items'              => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', Rule::exists('products', 'id')->whereNull('deleted_at')],
            'items.*.quantity'   => ['required', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'code.required'              => 'Vui lòng nhập mã giảm giá.',
            'code.max'                   => 'Mã giảm giá không được vượt quá 50 ký tự.',
            'shipping_method.required'   => 'Vui lòng chọn phương thức vận chuyển.',
            'shipping_method.in'         => 'Phương thức vận chuyển không hợp lệ.',
            'items.required'             => 'Vui lòng chọn ít nhất một sản phẩm để áp dụng mã giảm giá.',
            'items.array'                => 'Danh sách sản phẩm không hợp lệ.',
            'items.min'                  => 'Vui lòng chọn ít nhất một sản phẩm để áp dụng mã giảm giá.',
            'items.*.product_id.exists'  => 'Sản phẩm trong giỏ hàng không tồn tại.',
            'items.*.quantity.required'  => 'Số lượng sản phẩm không hợp lệ.',
            'items.*.quantity.integer'   => 'Số lượng sản phẩm phải là số nguyên.',
            'items.*.quantity.min'       => 'Số lượng sản phẩm phải lớn hơn hoặc bằng 1.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $data = $this->all();

        foreach (['code', 'shipping_method'] as $field) {
            if (array_key_exists($field, $data) && is_string($data[$field])) {
                $data[$field] = trim($data[$field]);
                $data[$field] = $data[$field] === '' ? null : $data[$field];
            }
        }

        if (isset($data['code']) && is_string($data['code'])) {
            $data['code'] = strtoupper($data['code']);
        }

        $this->merge($data);
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(
            api_validation_error($validator->errors())
        );
    }
}
