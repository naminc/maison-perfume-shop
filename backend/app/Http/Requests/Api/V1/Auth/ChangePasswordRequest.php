<?php

namespace App\Http\Requests\Api\V1\Auth;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class ChangePasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'current_password'          => ['required', 'string'],
            'new_password'              => ['required', 'string', 'min:6', 'confirmed'],
            'new_password_confirmation' => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'current_password.required'          => 'Vui lòng nhập mật khẩu hiện tại.',
            'new_password.required'              => 'Vui lòng nhập mật khẩu mới.',
            'new_password.min'                   => 'Mật khẩu mới phải có ít nhất :min ký tự.',
            'new_password.confirmed'             => 'Xác nhận mật khẩu mới không khớp.',
            'new_password_confirmation.required' => 'Vui lòng xác nhận mật khẩu mới.',
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(
            api_validation_error($validator->errors())
        );
    }
}
