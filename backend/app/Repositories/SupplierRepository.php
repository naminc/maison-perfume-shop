<?php

namespace App\Repositories;

use App\Enums\SupplierStatus;
use App\Models\Supplier;
use App\Repositories\Interfaces\SupplierRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class SupplierRepository implements SupplierRepositoryInterface
{
    public function __construct(protected Supplier $model) {}

    public function paginate(array $filters): LengthAwarePaginator
    {
        return $this->model->newQuery()
            ->withCount('purchaseOrders')
            ->when(! empty($filters['search']), function ($query) use ($filters) {
                $search = trim((string) $filters['search']);
                $query->where(fn ($query) => $query->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%"));
            })
            ->when(! empty($filters['status']) && in_array($filters['status'], SupplierStatus::values(), true), fn ($query) => $query->where('status', $filters['status']))
            ->latest('id')
            ->paginate(max(1, min((int) ($filters['per_page'] ?? 10), 100)));
    }

    public function findById(int $id): ?Supplier
    {
        return $this->model->newQuery()->withCount('purchaseOrders')->find($id);
    }

    public function create(array $data): Supplier
    {
        return $this->model->newQuery()->create($data);
    }

    public function update(Supplier $supplier, array $data): Supplier
    {
        $supplier->update($data);

        return $supplier->fresh()->loadCount('purchaseOrders');
    }

    public function delete(Supplier $supplier): bool
    {
        return (bool) $supplier->delete();
    }

    public function codeExists(string $code, ?int $ignoreId = null): bool
    {
        return $this->model->newQuery()->withTrashed()->where('code', strtoupper(trim($code)))
            ->when($ignoreId, fn ($query) => $query->whereKeyNot($ignoreId))->exists();
    }
}
