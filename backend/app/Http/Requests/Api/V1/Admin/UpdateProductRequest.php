<?php

namespace App\Http\Requests\Api\V1\Admin;

use App\Enums\ProductGender;
use App\Enums\ProductStatus;
use App\Enums\ProductVariantStatus;
use App\Models\ProductVariant;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $productId = (int) $this->route('product');
        $rules = [
            'brand_id' => ['nullable', 'integer', Rule::exists('brands', 'id')->whereNull('deleted_at')],
            'category_id' => ['nullable', 'integer', Rule::exists('categories', 'id')->whereNull('deleted_at')],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('products', 'slug')->ignore($productId)],
            'short_description' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'string', 'url', 'max:255'],
            'gender' => ['required', 'string', Rule::in(ProductGender::values())],
            'status' => ['required', 'string', Rule::in(ProductStatus::values())],
            'is_featured' => ['sometimes', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:1'],
            'variants' => ['required', 'array', 'min:1'],
            'variants.*.id' => ['nullable', 'integer'],
            'variants.*.sku' => ['required', 'string', 'max:100', 'distinct'],
            'variants.*.name' => ['nullable', 'string', 'max:255'],
            'variants.*.concentration' => ['nullable', 'string', 'max:100'],
            'variants.*.volume_ml' => ['nullable', 'integer', 'min:1'],
            'variants.*.price' => ['required', 'numeric', 'min:0'],
            'variants.*.sale_price' => ['nullable', 'numeric', 'min:0'],
            'variants.*.status' => ['required', 'string', Rule::in(ProductVariantStatus::values())],
            'variants.*.is_default' => ['sometimes', 'boolean'],
            'variants.*.sort_order' => ['nullable', 'integer', 'min:1'],
        ];

        foreach ($this->input('variants', []) as $index => $variant) {
            $variantId = isset($variant['id']) ? (int) $variant['id'] : null;
            $rules["variants.{$index}.sku"][] = Rule::unique('product_variants', 'sku')->ignore($variantId);
            $rules["variants.{$index}.stock"] = $variantId ? ['prohibited'] : ['required', 'integer', 'min:0'];
        }

        return $rules;
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $productId = (int) $this->route('product');
            $defaultCount = 0;

            foreach ($this->input('variants', []) as $index => $variant) {
                if (($variant['is_default'] ?? false) === true) {
                    $defaultCount++;
                }

                if (isset($variant['sale_price'], $variant['price'])
                    && (float) $variant['sale_price'] > (float) $variant['price']) {
                    $validator->errors()->add("variants.{$index}.sale_price", 'Giá khuyến mãi không được lớn hơn giá bán.');
                }

                if (! empty($variant['id']) && ! ProductVariant::query()
                    ->whereKey((int) $variant['id'])
                    ->where('product_id', $productId)
                    ->exists()) {
                    $validator->errors()->add("variants.{$index}.id", 'Phiên bản không thuộc sản phẩm đang cập nhật.');
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
            ...(new StoreProductRequest)->messages(),
            'variants.*.stock.prohibited' => 'Tồn kho chỉ được cập nhật trong module quản lý tồn kho.',
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

            foreach (['id', 'volume_ml', 'sort_order'] as $field) {
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
