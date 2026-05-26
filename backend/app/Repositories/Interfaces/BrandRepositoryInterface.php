<?php

namespace App\Repositories\Interfaces;

use App\Models\Brand;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface BrandRepositoryInterface
{
    public function paginate(array $filters): LengthAwarePaginator;

    public function findById(int $id): ?Brand;

    public function create(array $data): Brand;

    public function update(Brand $brand, array $data): Brand;

    public function delete(Brand $brand): bool;

    public function getActiveList(): Collection;

    public function nextSortOrder(): int;

    public function slugExists(string $slug, ?int $ignoreId = null): bool;
}
