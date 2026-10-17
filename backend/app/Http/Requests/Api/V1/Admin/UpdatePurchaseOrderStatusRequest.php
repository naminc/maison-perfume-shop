<?php

namespace App\Http\Requests\Api\V1\Admin;

use App\Enums\PurchaseOrderStatus;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class UpdatePurchaseOrderStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return ['status' => ['required', Rule::in(PurchaseOrderStatus::values())]];
    }

    public function messages(): array
    {
        return ['status.required' => 'Vui lòng chọn trạng thái.', 'status.in' => 'Trạng thái phiếu nhập không hợp lệ.'];
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(api_validation_error($validator->errors()));
    }
}
