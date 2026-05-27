<?php

namespace App\Http\Requests\Api\V1\Admin;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = (int) $this->route('user');

        return [
            'full_name' => ['required', 'string', 'max:255'],
            'email'     => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($userId)],
            'phone'     => ['nullable', 'string', 'max:20', 'regex:/^(0\d{9,10}|\+84\d{9,10})$/'],
            'role'      => ['required', 'string', Rule::in(UserRole::values())],
            'status'    => ['required', 'string', Rule::in(UserStatus::values())],
        ];
    }

    public function messages(): array
    {
        return [
            'full_name.required' => 'Vui lòng nhập họ tên người dùng.',
            'full_name.max'      => 'Họ tên không được vượt quá 255 ký tự.',
            'email.required'     => 'Vui lòng nhập email.',
            'email.email'        => 'Email không hợp lệ.',
            'email.unique'       => 'Email này đã được sử dụng.',
            'phone.regex'        => 'Số điện thoại không hợp lệ.',
            'phone.max'          => 'Số điện thoại không được vượt quá 20 ký tự.',
            'role.required'      => 'Vui lòng chọn vai trò.',
            'role.in'            => 'Vai trò không hợp lệ.',
            'status.required'    => 'Vui lòng chọn trạng thái.',
            'status.in'          => 'Trạng thái không hợp lệ.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $data = $this->all();

        foreach (['full_name', 'email', 'phone', 'role', 'status'] as $field) {
            if (! array_key_exists($field, $data) || ! is_string($data[$field])) {
                continue;
            }

            $value = trim($data[$field]);

            if ($field === 'phone') {
                $value = preg_replace('/[\s.-]+/', '', $value);
            }

            $data[$field] = $value === '' ? null : $value;
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
