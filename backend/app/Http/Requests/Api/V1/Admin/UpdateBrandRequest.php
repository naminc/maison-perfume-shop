<?php

namespace App\Http\Requests\Api\V1\Admin;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class UpdateBrandRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $brandId = (int) $this->route('brand');

        return [
            'name'        => ['required', 'string', 'max:255'],
            'slug'        => ['nullable', 'string', 'max:255', Rule::unique('brands', 'slug')->ignore($brandId)],
            'description' => ['nullable', 'string'],
            'logo'        => ['nullable', 'string', 'url', 'max:255'],
            'website'     => ['nullable', 'string', 'url', 'max:255'],
            'status'      => ['required', 'string', Rule::in(['active', 'inactive'])],
            'sort_order'  => ['nullable', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'   => 'Vui lòng nhập tên thương hiệu.',
            'name.max'        => 'Tên thương hiệu không được vượt quá 255 ký tự.',
            'slug.unique'     => 'Slug này đã được sử dụng.',
            'slug.max'        => 'Slug không được vượt quá 255 ký tự.',
            'logo.url'        => 'Logo phải là một đường dẫn hợp lệ.',
            'logo.max'        => 'Đường dẫn logo không được vượt quá 255 ký tự.',
            'website.url'     => 'Website phải là một đường dẫn hợp lệ.',
            'website.max'     => 'Đường dẫn website không được vượt quá 255 ký tự.',
            'status.required' => 'Vui lòng chọn trạng thái thương hiệu.',
            'status.in'       => 'Trạng thái thương hiệu không hợp lệ.',
            'sort_order.min'  => 'Thứ tự hiển thị phải lớn hơn hoặc bằng 1.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $data = $this->all();

        foreach (['name', 'slug', 'description', 'logo', 'website', 'status'] as $field) {
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
