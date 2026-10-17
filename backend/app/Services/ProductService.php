<?php

namespace App\Services;

use App\Repositories\Interfaces\ProductRepositoryInterface;
use App\Services\Interfaces\ProductServiceInterface;
use App\Models\Product;
use Illuminate\Support\Str;

class ProductService extends BaseService implements ProductServiceInterface
{
    public function __construct(
        protected ProductRepositoryInterface $productRepository,
    ) {}

    public function getPaginated(array $filters): array
    {
        return $this->executeSafe(function () use ($filters) {
            return $this->productRepository->paginate($filters);
        }, 'getPaginated');
    }

    public function getById(int $id): array
    {
        return $this->executeSafe(function () use ($id) {
            return $this->productRepository->findById($id);
        }, 'getById');
    }

    public function create(array $data): array
    {
        return $this->executeTransaction(function () use ($data) {
            $variants = $data['variants'];
            $data = $this->preparePayload($data);
            $data['slug'] = $this->makeUniqueSlug($data['slug'] ?: $data['name']);
            $data['sort_order'] = $this->resolveSortOrder($data['sort_order']);

            $product = $this->productRepository->create($data);
            $this->syncVariants($product, $variants);

            return $this->productRepository->findById($product->id);
        }, 'create');
    }

    public function update(int $id, array $data): array
    {
        return $this->executeTransaction(function () use ($id, $data) {
            $product = $this->productRepository->findById($id);

            if (! $product) {
                return ['found' => false];
            }

            $variants = $data['variants'];
            $data = $this->preparePayload($data);
            $data['sort_order'] = $this->resolveSortOrder($data['sort_order'], $product->sort_order);
            $data['slug'] = $this->makeUniqueSlug($data['slug'] ?: $data['name'], $product->id);

            $this->productRepository->update($product, $data);
            $this->syncVariants($product, $variants);

            return [
                'found' => true,
                'product' => $this->productRepository->findById($product->id),
            ];
        }, 'update');
    }

    public function delete(int $id): array
    {
        return $this->executeTransaction(function () use ($id) {
            $product = $this->productRepository->findById($id);

            if (! $product) {
                return ['found' => false];
            }

            $product->variants()->delete();
            $this->productRepository->delete($product);

            return ['found' => true, 'deleted' => true];
        }, 'delete');
    }

    public function getActiveList(array $filters): array
    {
        return $this->executeSafe(function () use ($filters) {
            return $this->productRepository->getPublicList($filters);
        }, 'getActiveList');
    }

    public function getBySlug(string $slug): array
    {
        return $this->executeSafe(function () use ($slug) {
            return $this->productRepository->findBySlug($slug);
        }, 'getBySlug');
    }

    private function preparePayload(array $data): array
    {
        return [
            'brand_id'          => $this->normalizeNullableInt($data['brand_id'] ?? null),
            'category_id'       => $this->normalizeNullableInt($data['category_id'] ?? null),
            'name'              => trim((string) $data['name']),
            'slug'              => $this->normalizeNullableString($data['slug'] ?? null),
            'short_description' => $this->normalizeNullableString($data['short_description'] ?? null),
            'description'       => $this->normalizeNullableString($data['description'] ?? null),
            'image'             => $this->normalizeNullableString($data['image'] ?? null),
            'gender'            => $data['gender'],
            'status'            => $data['status'] ?? 'active',
            'is_featured'       => (bool) ($data['is_featured'] ?? false),
            'sort_order'        => $data['sort_order'] ?? null,
        ];
    }

    private function syncVariants(Product $product, array $variants): void
    {
        $existingIds = $product->variants()->pluck('id')->all();
        $keptIds = [];
        $hasDefault = collect($variants)->contains(fn (array $variant) => (bool) ($variant['is_default'] ?? false));

        $product->variants()->update(['is_default' => false]);

        foreach (array_values($variants) as $index => $variantData) {
            $variantId = isset($variantData['id']) ? (int) $variantData['id'] : null;
            $payload = [
                'sku' => trim((string) $variantData['sku']),
                'name' => $this->normalizeNullableString($variantData['name'] ?? null),
                'concentration' => $this->normalizeNullableString($variantData['concentration'] ?? null),
                'volume_ml' => $this->normalizeNullableInt($variantData['volume_ml'] ?? null),
                'price' => (float) $variantData['price'],
                'sale_price' => $this->normalizeNullableFloat($variantData['sale_price'] ?? null),
                'status' => $variantData['status'] ?? 'active',
                'is_default' => $hasDefault ? (bool) ($variantData['is_default'] ?? false) : $index === 0,
                'sort_order' => max(1, (int) ($variantData['sort_order'] ?? ($index + 1))),
            ];

            if ($variantId !== null && in_array($variantId, $existingIds, true)) {
                $variant = $product->variants()->findOrFail($variantId);
                $variant->update($payload);
            } else {
                $payload['stock'] = (int) ($variantData['stock'] ?? 0);
                $variant = $product->variants()->create($payload);
            }

            $keptIds[] = $variant->id;
        }

        $product->variants()->whereNotIn('id', $keptIds)->delete();
    }

    private function resolveSortOrder(mixed $value, ?int $fallback = null): int
    {
        if ($value === null || $value === '') {
            return $fallback ?? $this->productRepository->nextSortOrder();
        }

        return max(1, (int) $value);
    }

    private function normalizeNullableString(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $value = trim($value);

        return $value === '' ? null : $value;
    }

    private function normalizeNullableInt(mixed $value): ?int
    {
        if ($value === null || $value === '' || $value === 0 || $value === '0') {
            return null;
        }

        return (int) $value;
    }

    private function normalizeNullableFloat(mixed $value): ?float
    {
        if ($value === null || $value === '') {
            return null;
        }

        return (float) $value;
    }

    private function makeUniqueSlug(string $value, ?int $ignoreId = null): string
    {
        $baseSlug = Str::slug($value) ?: 'san-pham';
        $slug = $baseSlug;
        $suffix = 2;

        while ($this->productRepository->slugExists($slug, $ignoreId)) {
            $slug = "{$baseSlug}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }
}
