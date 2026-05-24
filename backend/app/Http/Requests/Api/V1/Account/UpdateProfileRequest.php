<?php

namespace App\Http\Requests\Api\V1\Account;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:100'],
            'phone'     => ['nullable', 'string', 'max:15', 'regex:/^(0\d{9,10}|\+84\d{9,10})$/'],
            'email'     => [
                'required',
                'string',
                'email',
                'max:255',
                'unique:users,email,' . $this->user()->id,
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'full_name.required' => 'Họ tên không được để trống.',
            'email.required'     => 'Email không được để trống.',
            'email.email'        => 'Email không đúng định dạng.',
            'email.unique'       => 'Email đã được sử dụng.',
            'phone.regex'        => 'Số điện thoại không hợp lệ.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $phone = $this->input('phone');

        if (is_string($phone)) {
            $normalizedPhone = preg_replace('/[\s.-]+/', '', trim($phone));

            $this->merge([
                'phone' => $normalizedPhone === '' ? null : $normalizedPhone,
            ]);
        }
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(
            api_validation_error($validator->errors())
        );
    }
}
