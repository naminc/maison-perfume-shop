<?php

namespace App\Http\Requests\Api\V1\Admin;

use App\Enums\CouponStatus;
use App\Enums\CouponType;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class StoreCouponRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code'                => ['required', 'string', 'max:50', 'regex:/^[A-Z0-9_-]+$/', Rule::unique('coupons', 'code')],
            'name'                => ['required', 'string', 'max:255'],
            'description'         => ['nullable', 'string', 'max:1000'],
            'type'                => ['required', 'string', Rule::in(CouponType::values())],
            'value'               => ['nullable', 'numeric', 'min:0'],
            'min_order_amount'    => ['nullable', 'numeric', 'min:0'],
            'max_discount_amount' => ['nullable', 'numeric', 'min:0'],
            'usage_limit'         => ['nullable', 'integer', 'min:1'],
            'per_user_limit'      => ['nullable', 'integer', 'min:1'],
            'starts_at'           => ['nullable', 'date'],
            'expires_at'          => ['nullable', 'date', 'after_or_equal:starts_at'],
            'status'              => ['required', 'string', Rule::in(CouponStatus::values())],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $type = $this->input('type');

            if (in_array($type, [CouponType::Fixed->value, CouponType::Percent->value], true) && $this->input('value') === null) {
                $validator->errors()->add('value', 'Vui lòng nhập giá trị giảm giá.');
            }

            if ($type === CouponType::Percent->value && (float) $this->input('value', 0) > 100) {
                $validator->errors()->add('value', 'Mã giảm theo phần trăm không được lớn hơn 100%.');
            }
        });
    }

    public function messages(): array
    {
        return [
            'code.required'                => 'Vui lòng nhập mã giảm giá.',
            'code.regex'                   => 'Mã giảm giá chỉ được chứa chữ in hoa, số, gạch ngang hoặc gạch dưới.',
            'code.unique'                  => 'Mã giảm giá này đã tồn tại.',
            'code.max'                     => 'Mã giảm giá không được vượt quá 50 ký tự.',
            'name.required'                => 'Vui lòng nhập tên chương trình.',
            'name.max'                     => 'Tên chương trình không được vượt quá 255 ký tự.',
            'description.max'              => 'Mô tả không được vượt quá 1000 ký tự.',
            'type.required'                => 'Vui lòng chọn loại mã giảm giá.',
            'type.in'                      => 'Loại mã giảm giá không hợp lệ.',
            'value.numeric'                => 'Giá trị giảm giá phải là số.',
            'value.min'                    => 'Giá trị giảm giá phải lớn hơn hoặc bằng 0.',
            'min_order_amount.numeric'     => 'Giá trị đơn tối thiểu phải là số.',
            'min_order_amount.min'         => 'Giá trị đơn tối thiểu phải lớn hơn hoặc bằng 0.',
            'max_discount_amount.numeric'  => 'Mức giảm tối đa phải là số.',
            'max_discount_amount.min'      => 'Mức giảm tối đa phải lớn hơn hoặc bằng 0.',
            'usage_limit.integer'          => 'Giới hạn lượt dùng phải là số nguyên.',
            'usage_limit.min'              => 'Giới hạn lượt dùng phải lớn hơn hoặc bằng 1.',
            'per_user_limit.integer'       => 'Giới hạn mỗi khách phải là số nguyên.',
            'per_user_limit.min'           => 'Giới hạn mỗi khách phải lớn hơn hoặc bằng 1.',
            'starts_at.date'               => 'Thời gian bắt đầu không hợp lệ.',
            'expires_at.date'              => 'Thời gian kết thúc không hợp lệ.',
            'expires_at.after_or_equal'    => 'Thời gian kết thúc phải sau hoặc bằng thời gian bắt đầu.',
            'status.required'              => 'Vui lòng chọn trạng thái mã giảm giá.',
            'status.in'                    => 'Trạng thái mã giảm giá không hợp lệ.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $data = $this->all();

        foreach (['code', 'name', 'description', 'type', 'status'] as $field) {
            if (array_key_exists($field, $data) && is_string($data[$field])) {
                $data[$field] = trim($data[$field]);
                $data[$field] = $data[$field] === '' ? null : $data[$field];
            }
        }

        if (isset($data['code']) && is_string($data['code'])) {
            $data['code'] = strtoupper($data['code']);
        }

        foreach (['value', 'min_order_amount', 'max_discount_amount', 'usage_limit', 'per_user_limit', 'starts_at', 'expires_at'] as $field) {
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
