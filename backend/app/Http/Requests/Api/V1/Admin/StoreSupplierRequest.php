<?php

namespace App\Http\Requests\Api\V1\Admin;

use App\Enums\SupplierStatus;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class StoreSupplierRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:50', 'regex:/^[A-Z0-9_-]+$/', Rule::unique('suppliers', 'code')],
            'contact_name' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'regex:/^[0-9+().\s-]{8,30}$/'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'tax_code' => ['nullable', 'string', 'max:50'],
            'note' => ['nullable', 'string', 'max:1000'],
            'status' => ['required', Rule::in(SupplierStatus::values())],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Vui lòng nhập tên nhà cung cấp.', 'name.max' => 'Tên nhà cung cấp không được vượt quá 255 ký tự.',
            'code.regex' => 'Mã chỉ được chứa chữ in hoa, số, gạch ngang hoặc gạch dưới.', 'code.unique' => 'Mã nhà cung cấp đã tồn tại.',
            'phone.regex' => 'Số điện thoại không hợp lệ.', 'email.email' => 'Email không hợp lệ.',
            'status.required' => 'Vui lòng chọn trạng thái.', 'status.in' => 'Trạng thái không hợp lệ.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $data = $this->all();
        foreach (['name', 'code', 'contact_name', 'phone', 'email', 'address', 'tax_code', 'note', 'status'] as $field) {
            if (isset($data[$field]) && is_string($data[$field])) {
                $data[$field] = trim($data[$field]) ?: null;
            }
        }
        if (! empty($data['code'])) {
            $data['code'] = strtoupper($data['code']);
        }
        $this->merge($data);
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(api_validation_error($validator->errors()));
    }
}
