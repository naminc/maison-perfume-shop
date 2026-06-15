<?php

namespace App\Http\Requests\Api\V1\Admin;

use App\Enums\ProductReviewStatus;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class UpdateProductReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'rating'     => ['required', 'integer', 'min:1', 'max:5'],
            'title'      => ['nullable', 'string', 'max:120'],
            'content'    => ['nullable', 'string', 'max:2000'],
            'status'     => ['required', 'string', Rule::in(ProductReviewStatus::values())],
            'admin_note' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'rating.required' => 'Vui lòng chọn số sao đánh giá.',
            'rating.min'      => 'Đánh giá tối thiểu là 1 sao.',
            'rating.max'      => 'Đánh giá tối đa là 5 sao.',
            'title.max'       => 'Tiêu đề đánh giá không được vượt quá 120 ký tự.',
            'content.max'     => 'Nội dung đánh giá không được vượt quá 2000 ký tự.',
            'status.required' => 'Vui lòng chọn trạng thái đánh giá.',
            'status.in'       => 'Trạng thái đánh giá không hợp lệ.',
            'admin_note.max'  => 'Ghi chú quản trị không được vượt quá 1000 ký tự.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $data = $this->all();

        foreach (['title', 'content', 'status', 'admin_note'] as $field) {
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
