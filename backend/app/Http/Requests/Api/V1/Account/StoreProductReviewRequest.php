<?php

namespace App\Http\Requests\Api\V1\Account;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class StoreProductReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id'    => ['required', 'integer', Rule::exists('products', 'id')->whereNull('deleted_at')],
            'order_item_id' => ['required', 'integer', Rule::exists('order_items', 'id')],
            'rating'        => ['required', 'integer', 'min:1', 'max:5'],
            'title'         => ['nullable', 'string', 'max:120'],
            'content'       => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'product_id.required'    => 'Sản phẩm đánh giá không hợp lệ.',
            'product_id.exists'      => 'Sản phẩm không tồn tại.',
            'order_item_id.required' => 'Vui lòng chọn sản phẩm trong đơn hàng cần đánh giá.',
            'order_item_id.exists'   => 'Sản phẩm trong đơn hàng không tồn tại.',
            'rating.required'        => 'Vui lòng chọn số sao đánh giá.',
            'rating.integer'         => 'Số sao đánh giá không hợp lệ.',
            'rating.min'             => 'Đánh giá tối thiểu là 1 sao.',
            'rating.max'             => 'Đánh giá tối đa là 5 sao.',
            'title.max'              => 'Tiêu đề đánh giá không được vượt quá 120 ký tự.',
            'content.max'            => 'Nội dung đánh giá không được vượt quá 2000 ký tự.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $data = $this->all();

        foreach (['title', 'content'] as $field) {
            if (array_key_exists($field, $data) && is_string($data[$field])) {
                $data[$field] = trim($data[$field]);
                $data[$field] = $data[$field] === '' ? null : $data[$field];
            }
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
