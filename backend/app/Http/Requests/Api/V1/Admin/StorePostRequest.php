<?php

namespace App\Http\Requests\Api\V1\Admin;

use App\Enums\PostStatus;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class StorePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'excerpt' => ['nullable', 'string', 'max:1000'],
            'content' => ['required', 'string'],
            'cover_image' => ['nullable', 'string', 'url', 'max:255'],
            'category' => ['nullable', 'string', 'max:100'],
            'status' => ['required', 'string', Rule::in(PostStatus::values())],
            'published_at' => ['nullable', 'date'],
            'read_minutes' => ['nullable', 'integer', 'min:1', 'max:120'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Vui lòng nhập tiêu đề bài viết.',
            'title.max' => 'Tiêu đề không được vượt quá 255 ký tự.',
            'excerpt.max' => 'Mô tả ngắn không được vượt quá 1000 ký tự.',
            'content.required' => 'Vui lòng nhập nội dung bài viết.',
            'cover_image.url' => 'Ảnh bìa phải là một đường dẫn hợp lệ.',
            'cover_image.max' => 'Đường dẫn ảnh bìa không được vượt quá 255 ký tự.',
            'category.max' => 'Chuyên mục không được vượt quá 100 ký tự.',
            'status.required' => 'Vui lòng chọn trạng thái bài viết.',
            'status.in' => 'Trạng thái bài viết không hợp lệ.',
            'published_at.date' => 'Thời gian xuất bản không hợp lệ.',
            'read_minutes.integer' => 'Thời gian đọc phải là số nguyên.',
            'read_minutes.min' => 'Thời gian đọc tối thiểu 1 phút.',
            'read_minutes.max' => 'Thời gian đọc tối đa 120 phút.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $data = $this->all();

        foreach (['title', 'slug', 'excerpt', 'cover_image', 'category', 'status'] as $field) {
            if (array_key_exists($field, $data) && is_string($data[$field])) {
                $data[$field] = trim($data[$field]);
                $data[$field] = $data[$field] === '' ? null : $data[$field];
            }
        }

        foreach (['published_at', 'read_minutes'] as $field) {
            if (array_key_exists($field, $data) && $data[$field] === '') {
                $data[$field] = null;
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
