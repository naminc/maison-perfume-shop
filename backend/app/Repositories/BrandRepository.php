<?php

namespace App\Repositories;

use App\Enums\BrandStatus;
use App\Models\Brand;
use App\Repositories\Interfaces\BrandRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class BrandRepository implements BrandRepositoryInterface
{
    public function __construct(protected Brand $model) {}

    public function paginate(array $filters): LengthAwarePaginator
    {
        $perPage = (int) ($filters['per_page'] ?? 10);
        $perPage = max(1, min($perPage, 100));

        return $this->model
            ->newQuery()
            ->when(! empty($filters['search']), function ($query) use ($filters) {
                $search = trim((string) $filters['search']);

                $query->where(function ($query) use ($search) {
                    $query
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%");
                });
            })
            ->when(! empty($filters['status']) && in_array($filters['status'], BrandStatus::values(), true), function ($query) use ($filters) {
                $query->where('status', $filters['status']);
            })
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate($perPage);
    }

    public function findById(int $id): ?Brand
    {
        return $this->model->newQuery()->find($id);
    }

    public function create(array $data): Brand
    {
        return $this->model->create($data);
    }

    public function update(Brand $brand, array $data): Brand
    {
        $brand->update($data);

        return $brand->fresh();
    }

    public function delete(Brand $brand): bool
    {
        return (bool) $brand->delete();
    }

    public function getActiveList(): Collection
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
}
