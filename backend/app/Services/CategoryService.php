<?php

namespace App\Services;

use App\Enums\CategoryStatus;
use App\Models\Category;
use App\Repositories\Interfaces\CategoryRepositoryInterface;
use App\Services\Interfaces\CategoryServiceInterface;
use Illuminate\Support\Str;

class CategoryService extends BaseService implements CategoryServiceInterface
{
    public function __construct(
        protected CategoryRepositoryInterface $categoryRepository,
    ) {}

    public function getPaginated(array $filters): array
    {
        return $this->executeSafe(function () use ($filters) {
            return $this->categoryRepository->paginate($filters);
        }, 'getPaginated');
    }

    public function getById(int $id): array
    {
        return $this->executeSafe(function () use ($id) {
            return $this->categoryRepository->findById($id);
        }, 'getById');
    }

    public function create(array $data): array
    {
        return $this->executeTransaction(function () use ($data) {
            $data = $this->preparePayload($data);
            $data['slug'] = $this->makeUniqueSlug($data['slug'] ?: $data['name']);
            $data['sort_order'] = $this->resolveSortOrder($data['sort_order']);

            return $this->categoryRepository->create($data);
        }, 'create');
    }

    public function update(int $id, array $data): array
    {
        return $this->executeTransaction(function () use ($id, $data) {
            $category = $this->categoryRepository->findById($id);

            if (! $category) {
                return ['found' => false];
            }

            $data = $this->preparePayload($data);
            $data['sort_order'] = $this->resolveSortOrder($data['sort_order'], $category->sort_order);

            if ($data['parent_id'] !== null && $this->wouldCreateCycle($category, (int) $data['parent_id'])) {
                return [
                    'found'   => true,
                    'updated' => false,
                    'message' => 'Danh mục cha không hợp lệ vì sẽ tạo vòng lặp danh mục.',
                ];
            }

            $data['slug'] = $this->makeUniqueSlug($data['slug'] ?: $data['name'], $category->id);

            return [
                'found'    => true,
                'updated'  => true,
                'category' => $this->categoryRepository->update($category, $data),
            ];
        }, 'update');
    }

    public function delete(int $id): array
    {
        return $this->executeTransaction(function () use ($id) {
            $category = $this->categoryRepository->findById($id);

            if (! $category) {
                return ['found' => false];
            }

            if ($this->categoryRepository->hasChildren($category)) {
                $category->children()->update(['parent_id' => null]);
            }

            $this->categoryRepository->delete($category);

            return ['found' => true, 'deleted' => true];
        }, 'delete');
    }

    public function getActiveTree(): array
    {
        return $this->executeSafe(function () {
            return $this->categoryRepository->getActiveTree();
        }, 'getActiveTree');
    }

    private function preparePayload(array $data): array
    {
        return [
            'name'        => trim((string) $data['name']),
            'slug'        => $this->normalizeNullableString($data['slug'] ?? null),
            'description' => $this->normalizeNullableString($data['description'] ?? null),
            'parent_id'   => null,
            'status'      => $data['status'] ?? CategoryStatus::Active->value,
            'sort_order'  => $data['sort_order'] ?? null,
        ];
    }

    private function resolveSortOrder(mixed $value, ?int $fallback = null): int
    {
        if ($value === null || $value === '') {
            return $fallback ?? $this->categoryRepository->nextSortOrder();
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
        $baseSlug = Str::slug($value) ?: 'danh-muc';
        $slug = $baseSlug;
        $suffix = 2;

        while ($this->categoryRepository->slugExists($slug, $ignoreId)) {
            $slug = "{$baseSlug}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }

    private function wouldCreateCycle(Category $category, int $parentId): bool
    {
        if ($category->id === $parentId) {
            return true;
        }

        $parent = $this->categoryRepository->findById($parentId);

        while ($parent) {
            if ($parent->id === $category->id) {
                return true;
            }

            if ($parent->parent_id === null) {
                return false;
            }

            $parent = $this->categoryRepository->findById((int) $parent->parent_id);
        }

        return false;
    }
}
