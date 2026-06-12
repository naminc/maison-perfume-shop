<?php

namespace App\Http\Requests\Api\V1;

use App\Enums\PaymentMethod;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_name'      => ['required', 'string', 'max:255'],
            'customer_phone'     => ['required', 'string', 'max:30'],
            'customer_email'     => ['nullable', 'email', 'max:255'],
            'province_code'      => ['required', 'string', 'max:50', Rule::exists('provinces', 'code')],
            'province_name'      => ['required', 'string', 'max:255'],
            'ward_code'          => [
                'required',
                'string',
                'max:50',
                Rule::exists('wards', 'code')->where(fn ($query) => $query->where('province_code', $this->input('province_code'))),
            ],
            'ward_name'          => ['required', 'string', 'max:255'],
            'shipping_address'   => ['required', 'string', 'max:255'],
            'note'               => ['nullable', 'string', 'max:1000'],
            'payment_method'     => ['required', 'string', Rule::in(PaymentMethod::values())],
            'shipping_method'    => ['required', 'string', Rule::in(['standard', 'express'])],
            'coupon_code'        => ['nullable', 'string', 'max:50'],
            'items'              => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', Rule::exists('products', 'id')->whereNull('deleted_at')],
            'items.*.quantity'   => ['required', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'customer_name.required'      => 'Vui lòng nhập họ tên người nhận.',
            'customer_name.max'           => 'Họ tên người nhận không được vượt quá 255 ký tự.',
            'customer_phone.required'     => 'Vui lòng nhập số điện thoại người nhận.',
            'customer_phone.max'          => 'Số điện thoại không được vượt quá 30 ký tự.',
            'customer_email.email'        => 'Email không hợp lệ.',
            'customer_email.max'          => 'Email không được vượt quá 255 ký tự.',
            'province_code.required'      => 'Vui lòng chọn tỉnh/thành phố.',
            'province_code.exists'        => 'Tỉnh/thành phố không tồn tại.',
            'province_name.required'      => 'Tên tỉnh/thành phố không hợp lệ.',
            'ward_code.required'          => 'Vui lòng chọn phường/xã.',
            'ward_code.exists'            => 'Phường/xã không tồn tại hoặc không thuộc tỉnh/thành phố đã chọn.',
            'ward_name.required'          => 'Tên phường/xã không hợp lệ.',
            'shipping_address.required'   => 'Vui lòng nhập địa chỉ giao hàng.',
            'shipping_address.max'        => 'Địa chỉ giao hàng không được vượt quá 255 ký tự.',
            'note.max'                    => 'Ghi chú không được vượt quá 1000 ký tự.',
            'payment_method.required'     => 'Vui lòng chọn phương thức thanh toán.',
            'payment_method.in'           => 'Phương thức thanh toán không hợp lệ.',
            'shipping_method.required'    => 'Vui lòng chọn phương thức vận chuyển.',
            'shipping_method.in'          => 'Phương thức vận chuyển không hợp lệ.',
            'items.required'              => 'Vui lòng chọn ít nhất một sản phẩm để đặt hàng.',
            'items.array'                 => 'Danh sách sản phẩm không hợp lệ.',
            'items.min'                   => 'Vui lòng chọn ít nhất một sản phẩm để đặt hàng.',
            'items.*.product_id.required' => 'Sản phẩm trong đơn hàng không hợp lệ.',
            'items.*.product_id.exists'   => 'Sản phẩm trong đơn hàng không tồn tại.',
            'items.*.quantity.required'   => 'Vui lòng nhập số lượng sản phẩm.',
            'items.*.quantity.integer'    => 'Số lượng sản phẩm phải là số nguyên.',
            'items.*.quantity.min'        => 'Số lượng sản phẩm phải lớn hơn hoặc bằng 1.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $data = $this->all();

        foreach ([
            'customer_name',
            'customer_phone',
            'customer_email',
            'province_code',
            'province_name',
            'ward_code',
            'ward_name',
            'shipping_address',
            'note',
            'payment_method',
            'shipping_method',
            'coupon_code',
        ] as $field) {
            if (array_key_exists($field, $data) && is_string($data[$field])) {
                $data[$field] = trim($data[$field]);
                $data[$field] = $data[$field] === '' ? null : $data[$field];
            }
        }

        if (isset($data['coupon_code']) && is_string($data['coupon_code'])) {
            $data['coupon_code'] = strtoupper($data['coupon_code']);
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
