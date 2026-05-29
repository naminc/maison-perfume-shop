<?php

namespace App\Services;

use App\Repositories\Interfaces\ProductRepositoryInterface;
use App\Services\Interfaces\ProductServiceInterface;
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
            $data = $this->preparePayload($data);
            $data['slug'] = $this->makeUniqueSlug($data['slug'] ?: $data['name']);
            $data['sort_order'] = $this->resolveSortOrder($data['sort_order']);

            return $this->productRepository->create($data);
        }, 'create');
    }

    public function update(int $id, array $data): array
    {
        return $this->executeTransaction(function () use ($id, $data) {
            $product = $this->productRepository->findById($id);

            if (! $product) {
                return ['found' => false];
            }

            $data = $this->preparePayload($data);
            $data['sort_order'] = $this->resolveSortOrder($data['sort_order'], $product->sort_order);
            $data['slug'] = $this->makeUniqueSlug($data['slug'] ?: $data['name'], $product->id);

            return [
                'found' => true,
                'product' => $this->productRepository->update($product, $data),
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
            'sku'               => $this->normalizeNullableString($data['sku'] ?? null),
            'short_description' => $this->normalizeNullableString($data['short_description'] ?? null),
            'description'       => $this->normalizeNullableString($data['description'] ?? null),
            'image'             => $this->normalizeNullableString($data['image'] ?? null),
            'gender'            => $data['gender'],
            'concentration'     => $this->normalizeNullableString($data['concentration'] ?? null),
            'volume_ml'         => $this->normalizeNullableInt($data['volume_ml'] ?? null),
            'price'             => (float) $data['price'],
            'sale_price'        => $this->normalizeNullableFloat($data['sale_price'] ?? null),
            'stock'             => (int) ($data['stock'] ?? 0),
            'status'            => $data['status'] ?? 'active',
            'is_featured'       => (bool) ($data['is_featured'] ?? false),
            'sort_order'        => $data['sort_order'] ?? null,
        ];
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
