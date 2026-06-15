<?php

namespace App\Repositories;

use App\Enums\ProductGender;
use App\Enums\ProductStatus;
use App\Models\Product;
use App\Repositories\Interfaces\ProductRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ProductRepository implements ProductRepositoryInterface
{
    public function __construct(protected Product $model) {}

    public function paginate(array $filters): LengthAwarePaginator
    {
        $perPage = (int) ($filters['per_page'] ?? 10);
        $perPage = max(1, min($perPage, 100));

        return $this->baseFilteredQuery($filters)
            ->with(['brand:id,name', 'category:id,name'])
            ->withCount('approvedReviews as rating_count')
            ->withAvg('approvedReviews as rating_average', 'rating')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate($perPage);
    }

    public function findById(int $id): ?Product
    {
        return $this->model
            ->newQuery()
            ->with(['brand:id,name', 'category:id,name'])
            ->withCount('approvedReviews as rating_count')
            ->withAvg('approvedReviews as rating_average', 'rating')
            ->find($id);
    }

    public function findBySlug(string $slug): ?Product
    {
        return $this->model
            ->newQuery()
            ->with(['brand:id,name,slug', 'category:id,name,slug'])
            ->withCount('approvedReviews as rating_count')
            ->withAvg('approvedReviews as rating_average', 'rating')
            ->active()
            ->where('slug', $slug)
            ->first();
    }

    public function create(array $data): Product
    {
        return $this->model->create($data)->fresh(['brand:id,name', 'category:id,name']);
    }

    public function update(Product $product, array $data): Product
    {
        $product->update($data);

        return $product->fresh(['brand:id,name', 'category:id,name']);
    }

    public function delete(Product $product): bool
    {
        return (bool) $product->delete();
    }

    public function getPublicList(array $filters): LengthAwarePaginator
    {
        $perPage = (int) ($filters['per_page'] ?? 12);
        $perPage = max(1, min($perPage, 100));

        return $this->baseFilteredQuery($filters)
            ->with(['brand:id,name,slug', 'category:id,name,slug'])
            ->withCount('approvedReviews as rating_count')
            ->withAvg('approvedReviews as rating_average', 'rating')
            ->active()
            ->orderByDesc('is_featured')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate($perPage);
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

    private function baseFilteredQuery(array $filters)
    {
        return $this->model
            ->newQuery()
            ->when(! empty($filters['search']), function ($query) use ($filters) {
                $search = trim((string) $filters['search']);

                $query->where(function ($query) use ($search) {
                    $query
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%");
                });
            })
            ->when(! empty($filters['status']) && in_array($filters['status'], ProductStatus::values(), true), function ($query) use ($filters) {
                $query->where('status', $filters['status']);
            })
            ->when(! empty($filters['gender']) && in_array($filters['gender'], ProductGender::values(), true), function ($query) use ($filters) {
                $query->where('gender', $filters['gender']);
            })
            ->when(! empty($filters['brand_id']), fn ($query) => $query->where('brand_id', (int) $filters['brand_id']))
            ->when(! empty($filters['category_id']), fn ($query) => $query->where('category_id', (int) $filters['category_id']))
            ->when(array_key_exists('is_featured', $filters) && $filters['is_featured'] !== null && $filters['is_featured'] !== '', function ($query) use ($filters) {
                $query->where('is_featured', filter_var($filters['is_featured'], FILTER_VALIDATE_BOOL));
            });
    }
}
