<?php

namespace App\Http\Requests\Api\V1\Admin;

use App\Enums\CategoryStatus;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class StoreCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'        => ['required', 'string', 'max:255'],
            'slug'        => ['nullable', 'string', 'max:255', Rule::unique('categories', 'slug')],
            'description' => ['nullable', 'string'],
            'parent_id'   => ['nullable', 'integer', Rule::exists('categories', 'id')->whereNull('deleted_at')],
            'status'      => ['required', 'string', Rule::in(CategoryStatus::values())],
            'sort_order'  => ['nullable', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'    => 'Vui lòng nhập tên danh mục.',
            'slug.unique'      => 'Slug này đã được sử dụng.',
            'parent_id.exists' => 'Danh mục cha không tồn tại.',
            'status.in'        => 'Trạng thái danh mục không hợp lệ.',
            'sort_order.min'   => 'Thứ tự hiển thị phải lớn hơn hoặc bằng 1.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $data = $this->all();

        foreach (['name', 'slug', 'description', 'status'] as $field) {
            if (array_key_exists($field, $data) && is_string($data[$field])) {
                $data[$field] = trim($data[$field]);
                $data[$field] = $data[$field] === '' ? null : $data[$field];
            }
        }

        if (array_key_exists('parent_id', $data) && ($data['parent_id'] === '' || $data['parent_id'] === 0 || $data['parent_id'] === '0')) {
            $data['parent_id'] = null;
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
