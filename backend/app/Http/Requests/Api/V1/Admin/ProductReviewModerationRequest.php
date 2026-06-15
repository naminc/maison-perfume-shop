<?php

namespace App\Http\Requests\Api\V1\Admin;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class ProductReviewModerationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'admin_note' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'admin_note.max' => 'Ghi chú quản trị không được vượt quá 1000 ký tự.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $adminNote = $this->input('admin_note');

        if (is_string($adminNote)) {
            $adminNote = trim($adminNote);
            $this->merge(['admin_note' => $adminNote === '' ? null : $adminNote]);
        }
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(
            api_validation_error($validator->errors())
        );
    }
}
