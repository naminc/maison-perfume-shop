<?php

namespace App\Http\Requests\Api\V1\Admin;

use App\Enums\ProductGender;
use App\Enums\ProductStatus;
use App\Enums\ProductVariantStatus;
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
            'brand_id' => ['nullable', 'integer', Rule::exists('brands', 'id')->whereNull('deleted_at')],
            'category_id' => ['nullable', 'integer', Rule::exists('categories', 'id')->whereNull('deleted_at')],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('products', 'slug')],
            'short_description' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'string', 'url', 'max:255'],
            'gender' => ['required', 'string', Rule::in(ProductGender::values())],
            'status' => ['required', 'string', Rule::in(ProductStatus::values())],
            'is_featured' => ['sometimes', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:1'],
            'variants' => ['required', 'array', 'min:1'],
            'variants.*.sku' => ['required', 'string', 'max:100', 'distinct', Rule::unique('product_variants', 'sku')],
            'variants.*.name' => ['nullable', 'string', 'max:255'],
            'variants.*.concentration' => ['nullable', 'string', 'max:100'],
            'variants.*.volume_ml' => ['nullable', 'integer', 'min:1'],
            'variants.*.price' => ['required', 'numeric', 'min:0'],
            'variants.*.sale_price' => ['nullable', 'numeric', 'min:0'],
            'variants.*.stock' => ['required', 'integer', 'min:0'],
            'variants.*.status' => ['required', 'string', Rule::in(ProductVariantStatus::values())],
            'variants.*.is_default' => ['sometimes', 'boolean'],
            'variants.*.sort_order' => ['nullable', 'integer', 'min:1'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $defaultCount = 0;

            foreach ($this->input('variants', []) as $index => $variant) {
                if (($variant['is_default'] ?? false) === true) {
                    $defaultCount++;
                }

                if (isset($variant['sale_price'], $variant['price'])
                    && (float) $variant['sale_price'] > (float) $variant['price']) {
                    $validator->errors()->add("variants.{$index}.sale_price", 'Giá khuyến mãi không được lớn hơn giá bán.');
                }
            }

            if ($defaultCount > 1) {
                $validator->errors()->add('variants', 'Chỉ được chọn một phiên bản mặc định.');
            }
        });
    }

    public function messages(): array
    {
        return [
            'brand_id.exists' => 'Thương hiệu không tồn tại.',
            'category_id.exists' => 'Danh mục không tồn tại.',
            'name.required' => 'Vui lòng nhập tên sản phẩm.',
            'name.max' => 'Tên sản phẩm không được vượt quá 255 ký tự.',
            'slug.unique' => 'Slug này đã được sử dụng.',
            'image.url' => 'Ảnh sản phẩm phải là một đường dẫn hợp lệ.',
            'gender.required' => 'Vui lòng chọn giới tính sản phẩm.',
            'gender.in' => 'Giới tính sản phẩm không hợp lệ.',
            'status.required' => 'Vui lòng chọn trạng thái sản phẩm.',
            'status.in' => 'Trạng thái sản phẩm không hợp lệ.',
            'sort_order.min' => 'Thứ tự hiển thị phải lớn hơn hoặc bằng 1.',
            'variants.required' => 'Sản phẩm phải có ít nhất một phiên bản.',
            'variants.min' => 'Sản phẩm phải có ít nhất một phiên bản.',
            'variants.*.sku.required' => 'Vui lòng nhập SKU cho từng phiên bản.',
            'variants.*.sku.distinct' => 'SKU của các phiên bản không được trùng nhau.',
            'variants.*.sku.unique' => 'SKU này đã được sử dụng.',
            'variants.*.volume_ml.min' => 'Dung tích phải lớn hơn hoặc bằng 1ml.',
            'variants.*.price.required' => 'Vui lòng nhập giá bán cho từng phiên bản.',
            'variants.*.price.min' => 'Giá bán phải lớn hơn hoặc bằng 0.',
            'variants.*.sale_price.min' => 'Giá khuyến mãi phải lớn hơn hoặc bằng 0.',
            'variants.*.stock.required' => 'Vui lòng nhập tồn kho ban đầu.',
            'variants.*.stock.min' => 'Tồn kho phải lớn hơn hoặc bằng 0.',
            'variants.*.status.required' => 'Vui lòng chọn trạng thái phiên bản.',
            'variants.*.status.in' => 'Trạng thái phiên bản không hợp lệ.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $data = $this->all();

        foreach (['name', 'slug', 'short_description', 'description', 'image', 'gender', 'status'] as $field) {
            if (array_key_exists($field, $data) && is_string($data[$field])) {
                $data[$field] = trim($data[$field]);
                $data[$field] = $data[$field] === '' ? null : $data[$field];
            }
        }

        foreach (['brand_id', 'category_id', 'sort_order'] as $field) {
            if (array_key_exists($field, $data) && ($data[$field] === '' || $data[$field] === 0 || $data[$field] === '0')) {
                $data[$field] = null;
            }
        }

        $data['variants'] = array_map(function (array $variant): array {
            foreach (['sku', 'name', 'concentration', 'status'] as $field) {
                if (array_key_exists($field, $variant) && is_string($variant[$field])) {
                    $variant[$field] = trim($variant[$field]);
                    $variant[$field] = $variant[$field] === '' ? null : $variant[$field];
                }
            }

            foreach (['volume_ml', 'sort_order'] as $field) {
                if (array_key_exists($field, $variant) && $variant[$field] === '') {
                    $variant[$field] = null;
                }
            }

            if (array_key_exists('sale_price', $variant) && $variant['sale_price'] === '') {
                $variant['sale_price'] = null;
            }

            $variant['is_default'] = filter_var($variant['is_default'] ?? false, FILTER_VALIDATE_BOOL);

            return $variant;
        }, is_array($data['variants'] ?? null) ? $data['variants'] : []);

        $this->replace($data);
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(api_validation_error($validator->errors()));
    }
}
