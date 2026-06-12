<?php

namespace App\Http\Requests\Api\V1\Admin;

use App\Enums\OrderStatus;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class UpdateOrderStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'string', Rule::in(OrderStatus::values())],
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'Vui lòng chọn trạng thái đơn hàng.',
            'status.in'       => 'Trạng thái đơn hàng không hợp lệ.',
        ];
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->status)) {
            $this->merge(['status' => trim($this->status)]);
        }
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(
            api_validation_error($validator->errors())
        );
    }
}
