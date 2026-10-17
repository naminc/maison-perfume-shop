<?php

namespace App\Http\Requests\Api\V1\Admin;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class StorePurchaseOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'supplier_id' => ['required', 'integer', Rule::exists('suppliers', 'id')->whereNull('deleted_at')],
            'discount' => ['nullable', 'numeric', 'min:0'], 'shipping_fee' => ['nullable', 'numeric', 'min:0'],
            'reference' => ['nullable', 'string', 'max:255'], 'note' => ['nullable', 'string', 'max:1000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', Rule::exists('products', 'id')->whereNull('deleted_at')],
            'items.*.product_variant_id' => ['required', 'integer', 'distinct', Rule::exists('product_variants', 'id')->whereNull('deleted_at')],
            'items.*.quantity' => ['required', 'integer', 'min:1'], 'items.*.unit_cost' => ['required', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'supplier_id.required' => 'Vui lòng chọn nhà cung cấp.', 'supplier_id.exists' => 'Nhà cung cấp không tồn tại hoặc đã bị xoá.',
            'items.required' => 'Vui lòng thêm ít nhất một sản phẩm.', 'items.min' => 'Vui lòng thêm ít nhất một sản phẩm.',
            'items.*.product_id.exists' => 'Sản phẩm không tồn tại hoặc đã bị xoá.',
            'items.*.product_variant_id.distinct' => 'Không được chọn trùng phiên bản sản phẩm.',
            'items.*.quantity.min' => 'Số lượng phải lớn hơn hoặc bằng 1.', 'items.*.unit_cost.min' => 'Giá nhập phải lớn hơn hoặc bằng 0.',
            'discount.min' => 'Chiết khấu phải lớn hơn hoặc bằng 0.', 'shipping_fee.min' => 'Phí vận chuyển phải lớn hơn hoặc bằng 0.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $data = $this->all();
        foreach (['reference', 'note'] as $field) {
            if (isset($data[$field]) && is_string($data[$field])) {
                $data[$field] = trim($data[$field]) ?: null;
            }
        }
        foreach (['discount', 'shipping_fee'] as $field) {
            if (($data[$field] ?? null) === '') {
                $data[$field] = 0;
            }
        }
        $this->merge($data);
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(api_validation_error($validator->errors()));
    }
}
