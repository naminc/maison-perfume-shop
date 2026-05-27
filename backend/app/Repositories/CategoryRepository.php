<?php

namespace App\Repositories;

use App\Enums\CategoryStatus;
use App\Models\Category;
use App\Repositories\Interfaces\CategoryRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class CategoryRepository implements CategoryRepositoryInterface
{
    public function __construct(protected Category $model) {}

    public function paginate(array $filters): LengthAwarePaginator
    {
        $perPage = (int) ($filters['per_page'] ?? 10);
        $perPage = max(1, min($perPage, 100));

        return $this->model
            ->newQuery()
            ->with('parent:id,name')
            ->when(! empty($filters['search']), function ($query) use ($filters) {
                $search = trim((string) $filters['search']);

                $query->where(function ($query) use ($search) {
                    $query
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%");
                });
            })
            ->when(! empty($filters['status']) && in_array($filters['status'], CategoryStatus::values(), true), function ($query) use ($filters) {
                $query->where('status', $filters['status']);
            })
            ->when(array_key_exists('parent_id', $filters) && $filters['parent_id'] !== null && $filters['parent_id'] !== '', function ($query) use ($filters) {
                $query->where('parent_id', (int) $filters['parent_id']);
            })
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate($perPage);
    }

    public function findById(int $id): ?Category
    {
        return $this->model
            ->newQuery()
            ->with(['parent:id,name', 'children:id,parent_id,name'])
            ->find($id);
    }

    public function create(array $data): Category
    {
        return $this->model->create($data)->fresh('parent:id,name');
    }

    public function update(Category $category, array $data): Category
    {
        $category->update($data);

        return $category->fresh('parent:id,name');
    }

    public function delete(Category $category): bool
    {
        return (bool) $category->delete();
    }

    public function getActiveTree(): Collection
    {
        return $this->model
            ->newQuery()
            ->active()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();
    }

    public function nextSortOrder(): int
    {
        $maxSortOrder = $this->model
            ->newQuery()
            ->max('sort_order');

        return $maxSortOrder === null ? 1 : ((int) $maxSortOrder) + 1;
    }

    public function slugExists(string $slug, ?int $ignoreId = null): bool
    {
        return $this->model
            ->newQuery()
            ->withTrashed()
            ->where('slug', $slug)
            ->when($ignoreId !== null, fn ($query) => $query->whereKeyNot($ignoreId))
            ->exists();
    }

    public function hasChildren(Category $category): bool
    {
        return $category->children()->exists();
    }
}
