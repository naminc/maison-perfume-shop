<?php

namespace App\Http\Requests\Api\V1\Admin;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class UpdateSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'store_name'       => ['required', 'string', 'max:120'],
            'domain'           => ['nullable', 'string', 'url', 'max:255'],
            'contact_email'    => ['required', 'string', 'email', 'max:255'],
            'phone'            => ['nullable', 'string', 'max:20', 'regex:/^(0\d{9,10}|\+84\d{9,10})$/'],
            'address'          => ['nullable', 'string', 'max:500'],
            'logo'             => ['nullable', 'string', 'url', 'max:255'],
            'icon'             => ['nullable', 'string', 'url', 'max:255'],
            'facebook_url'     => ['nullable', 'string', 'url', 'max:255'],
            'instagram_url'    => ['nullable', 'string', 'url', 'max:255'],
            'meta_title'       => ['nullable', 'string', 'max:70'],
            'meta_description' => ['nullable', 'string', 'max:160'],
            'maintenance_enabled' => ['nullable', 'boolean'],
            'maintenance_message' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'store_name.required'    => 'Vui lòng nhập tên shop.',
            'store_name.max'         => 'Tên shop không được vượt quá :max ký tự.',
            'contact_email.required' => 'Vui lòng nhập email liên hệ.',
            'contact_email.email'    => 'Email liên hệ không hợp lệ.',
            'phone.regex'           => 'Số điện thoại không hợp lệ.',
            '*.url'                  => 'Đường dẫn không hợp lệ.',
            'maintenance_message.max' => 'Thông báo bảo trì không được vượt quá :max ký tự.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $data = $this->all();

        foreach ($data as $key => $value) {
            if (! is_string($value)) {
                continue;
            }

            $value = trim($value);

            if ($key === 'phone') {
                $value = preg_replace('/[\s.-]+/', '', $value);
            }

            $data[$key] = $value === '' ? null : $value;
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
