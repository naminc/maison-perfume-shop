<?php

namespace App\Http\Requests\Api\V1\Admin;

use App\Enums\StockMovementType;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class StoreStockAdjustmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', 'string', Rule::in([
                StockMovementType::Import->value,
                StockMovementType::Export->value,
                StockMovementType::Adjustment->value,
            ])],
            'quantity' => ['required', 'integer', 'not_in:0'],
            'reference' => ['nullable', 'string', 'max:255'],
            'note' => [
                Rule::requiredIf(fn () => $this->input('type') === StockMovementType::Adjustment->value),
                'nullable',
                'string',
                'max:1000',
            ],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if (in_array($this->input('type'), [StockMovementType::Import->value, StockMovementType::Export->value], true)
                && (int) $this->input('quantity') <= 0) {
                $validator->errors()->add('quantity', 'Số lượng nhập hoặc xuất kho phải lớn hơn 0.');
            }
        });
    }

    public function messages(): array
    {
        return [
            'type.required' => 'Vui lòng chọn loại điều chỉnh kho.',
            'type.in' => 'Loại điều chỉnh kho không hợp lệ.',
            'quantity.required' => 'Vui lòng nhập số lượng.',
            'quantity.integer' => 'Số lượng phải là số nguyên.',
            'quantity.not_in' => 'Số lượng thay đổi phải khác 0.',
            'reference.max' => 'Mã tham chiếu không được vượt quá 255 ký tự.',
            'note.required' => 'Vui lòng nhập lý do điều chỉnh tồn kho.',
            'note.max' => 'Ghi chú không được vượt quá 1000 ký tự.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $data = $this->all();

        foreach (['type', 'reference', 'note'] as $field) {
            if (array_key_exists($field, $data) && is_string($data[$field])) {
                $data[$field] = trim($data[$field]);
                $data[$field] = $data[$field] === '' ? null : $data[$field];
            }
        }

        $this->merge($data);
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(api_validation_error($validator->errors()));
    }
}
