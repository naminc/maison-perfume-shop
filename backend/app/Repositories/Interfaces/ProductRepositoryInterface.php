<?php

namespace App\Repositories\Interfaces;

use App\Models\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface ProductRepositoryInterface
{
    public function paginate(array $filters): LengthAwarePaginator;
    public function findById(int $id): ?Product;
    public function findBySlug(string $slug): ?Product;
    public function create(array $data): Product;
    public function update(Product $product, array $data): Product;
    public function delete(Product $product): bool;
    public function getPublicList(array $filters): LengthAwarePaginator;
    public function nextSortOrder(): int;
    public function slugExists(string $slug, ?int $ignoreId = null): bool;
}
