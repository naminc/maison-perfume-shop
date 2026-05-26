<?php

namespace App\Services;

use App\Repositories\Interfaces\BrandRepositoryInterface;
use App\Services\Interfaces\BrandServiceInterface;
use Illuminate\Support\Str;

class BrandService extends BaseService implements BrandServiceInterface
{
    public function __construct(
        protected BrandRepositoryInterface $brandRepository,
    ) {}

    public function getPaginated(array $filters): array
    {
        return $this->executeSafe(function () use ($filters) {
            return $this->brandRepository->paginate($filters);
        }, 'getPaginated');
    }

    public function getById(int $id): array
    {
        return $this->executeSafe(function () use ($id) {
            return $this->brandRepository->findById($id);
        }, 'getById');
    }

    public function create(array $data): array
    {
        return $this->executeTransaction(function () use ($data) {
            $data = $this->preparePayload($data);
            $data['slug'] = $this->makeUniqueSlug($data['slug'] ?: $data['name']);
            $data['sort_order'] = $this->resolveSortOrder($data['sort_order']);

            return $this->brandRepository->create($data);
        }, 'create');
    }

    public function update(int $id, array $data): array
    {
        return $this->executeTransaction(function () use ($id, $data) {
            $brand = $this->brandRepository->findById($id);

            if (! $brand) {
                return ['found' => false];
            }

            $data = $this->preparePayload($data);
            $data['sort_order'] = $this->resolveSortOrder($data['sort_order'], $brand->sort_order);
            $data['slug'] = $this->makeUniqueSlug($data['slug'] ?: $data['name'], $brand->id);

            return [
                'found' => true,
                'brand' => $this->brandRepository->update($brand, $data),
            ];
        }, 'update');
    }

    public function delete(int $id): array
    {
        return $this->executeTransaction(function () use ($id) {
            $brand = $this->brandRepository->findById($id);

            if (! $brand) {
                return ['found' => false];
            }

            $this->brandRepository->delete($brand);

            return ['found' => true, 'deleted' => true];
        }, 'delete');
    }

    public function getActiveList(): array
    {
        return $this->executeSafe(function () {
            return $this->brandRepository->getActiveList();
        }, 'getActiveList');
    }

    private function preparePayload(array $data): array
    {
        return [
            'name'        => trim((string) $data['name']),
            'slug'        => $this->normalizeNullableString($data['slug'] ?? null),
            'description' => $this->normalizeNullableString($data['description'] ?? null),
            'logo'        => $this->normalizeNullableString($data['logo'] ?? null),
            'website'     => $this->normalizeNullableString($data['website'] ?? null),
            'status'      => $data['status'] ?? 'active',
            'sort_order'  => $data['sort_order'] ?? null,
        ];
    }

    private function resolveSortOrder(mixed $value, ?int $fallback = null): int
    {
        if ($value === null || $value === '') {
            return $fallback ?? $this->brandRepository->nextSortOrder();
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

    private function makeUniqueSlug(string $value, ?int $ignoreId = null): string
    {
        $baseSlug = Str::slug($value) ?: 'thuong-hieu';
        $slug = $baseSlug;
        $suffix = 2;

        while ($this->brandRepository->slugExists($slug, $ignoreId)) {
            $slug = "{$baseSlug}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }
}
