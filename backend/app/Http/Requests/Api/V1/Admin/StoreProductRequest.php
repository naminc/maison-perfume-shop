<?php

namespace App\Http\Requests\Api\V1\Admin;

use App\Enums\ProductGender;
use App\Enums\ProductStatus;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'brand_id'          => ['nullable', 'integer', Rule::exists('brands', 'id')->whereNull('deleted_at')],
            'category_id'       => ['nullable', 'integer', Rule::exists('categories', 'id')->whereNull('deleted_at')],
            'name'              => ['required', 'string', 'max:255'],
            'slug'              => ['nullable', 'string', 'max:255', Rule::unique('products', 'slug')],
            'sku'               => ['nullable', 'string', 'max:100', Rule::unique('products', 'sku')],
            'short_description' => ['nullable', 'string', 'max:500'],
            'description'       => ['nullable', 'string'],
            'image'             => ['nullable', 'string', 'url', 'max:255'],
            'gender'            => ['required', 'string', Rule::in(ProductGender::values())],
            'concentration'     => ['nullable', 'string', 'max:100'],
            'volume_ml'         => ['nullable', 'integer', 'min:1'],
            'price'             => ['required', 'numeric', 'min:0'],
            'sale_price'        => ['nullable', 'numeric', 'min:0', 'lte:price'],
            'stock'             => ['required', 'integer', 'min:0'],
            'status'            => ['required', 'string', Rule::in(ProductStatus::values())],
            'is_featured'       => ['sometimes', 'boolean'],
            'sort_order'        => ['nullable', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'brand_id.exists'    => 'Thương hiệu không tồn tại.',
            'category_id.exists' => 'Danh mục không tồn tại.',
            'name.required'      => 'Vui lòng nhập tên sản phẩm.',
            'name.max'           => 'Tên sản phẩm không được vượt quá 255 ký tự.',
            'slug.unique'        => 'Slug này đã được sử dụng.',
            'sku.unique'         => 'SKU này đã được sử dụng.',
            'image.url'          => 'Ảnh sản phẩm phải là một đường dẫn hợp lệ.',
            'gender.required'    => 'Vui lòng chọn giới tính sản phẩm.',
            'gender.in'          => 'Giới tính sản phẩm không hợp lệ.',
            'volume_ml.min'      => 'Dung tích phải lớn hơn hoặc bằng 1ml.',
            'price.required'     => 'Vui lòng nhập giá sản phẩm.',
            'price.min'          => 'Giá sản phẩm phải lớn hơn hoặc bằng 0.',
            'sale_price.min'     => 'Giá khuyến mãi phải lớn hơn hoặc bằng 0.',
            'sale_price.lte'     => 'Giá khuyến mãi không được lớn hơn giá bán.',
            'stock.required'     => 'Vui lòng nhập tồn kho.',
            'stock.min'          => 'Tồn kho phải lớn hơn hoặc bằng 0.',
            'status.required'    => 'Vui lòng chọn trạng thái sản phẩm.',
            'status.in'          => 'Trạng thái sản phẩm không hợp lệ.',
            'sort_order.min'     => 'Thứ tự hiển thị phải lớn hơn hoặc bằng 1.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $data = $this->all();

        foreach (['name', 'slug', 'sku', 'short_description', 'description', 'image', 'gender', 'concentration', 'status'] as $field) {
            if (array_key_exists($field, $data) && is_string($data[$field])) {
                $data[$field] = trim($data[$field]);
                $data[$field] = $data[$field] === '' ? null : $data[$field];
            }
        }

        foreach (['brand_id', 'category_id', 'volume_ml', 'sort_order'] as $field) {
            if (array_key_exists($field, $data) && ($data[$field] === '' || $data[$field] === 0 || $data[$field] === '0')) {
                $data[$field] = null;
            }
        }

        if (array_key_exists('sale_price', $data) && $data['sale_price'] === '') {
            $data['sale_price'] = null;
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
