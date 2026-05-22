<?php

namespace App\Http\Requests\Api\V1\Auth;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:100'],
            'email'     => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'phone'     => ['nullable', 'string', 'max:15'],
            'password'  => ['required', 'string', 'min:6', 'confirmed'],
        ];
    }

    public function messages(): array
    {
        return [
            'full_name.required'  => 'Họ tên không được để trống.',
            'full_name.max'       => 'Họ tên không được vượt quá :max ký tự.',
            'email.required'      => 'Email không được để trống.',
            'email.email'         => 'Email không đúng định dạng.',
            'email.unique'        => 'Email đã được sử dụng.',
            'phone.max'           => 'Số điện thoại không được vượt quá :max ký tự.',
            'password.required'   => 'Mật khẩu không được để trống.',
            'password.min'        => 'Mật khẩu phải có ít nhất :min ký tự.',
            'password.confirmed'  => 'Xác nhận mật khẩu không khớp.',
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(
            api_validation_error($validator->errors())
        );
    }
}
