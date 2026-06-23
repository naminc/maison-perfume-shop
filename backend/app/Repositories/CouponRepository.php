<?php

namespace App\Repositories;

use App\Enums\CouponStatus;
use App\Enums\CouponType;
use App\Models\Coupon;
use App\Repositories\Interfaces\CouponRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CouponRepository implements CouponRepositoryInterface
{
    public function __construct(protected Coupon $model) {}

    public function paginate(array $filters): LengthAwarePaginator
    {
        $perPage = (int) ($filters['per_page'] ?? 10);
        $perPage = max(1, min($perPage, 100));

        return $this->baseFilteredQuery($filters)
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function findById(int $id): ?Coupon
    {
        return $this->model->newQuery()->find($id);
    }

    public function findByCode(string $code, bool $lock = false): ?Coupon
    {
        $query = $this->model
            ->newQuery()
            ->where('code', strtoupper(trim($code)));

        if ($lock) {
            $query->lockForUpdate();
        }

        return $query->first();
    }

    public function create(array $data): Coupon
    {
        return $this->model->create($data);
    }

    public function update(Coupon $coupon, array $data): Coupon
    {
        $coupon->update($data);

        return $coupon->fresh();
    }

    public function delete(Coupon $coupon): bool
    {
        return (bool) $coupon->delete();
    }

    public function codeExists(string $code, ?int $ignoreId = null): bool
    {
        return $this->model
            ->newQuery()
            ->withTrashed()
            ->where('code', strtoupper(trim($code)))
            ->when($ignoreId !== null, fn ($query) => $query->whereKeyNot($ignoreId))
            ->exists();
    }

    public function incrementUsedCount(Coupon $coupon): void
    {
        $coupon->newQuery()
            ->whereKey($coupon->id)
            ->increment('used_count');
    }

    public function decrementUsedCount(Coupon $coupon): void
    {
        $coupon->newQuery()
            ->whereKey($coupon->id)
            ->where('used_count', '>', 0)
            ->decrement('used_count');
    }

    private function baseFilteredQuery(array $filters)
    {
        return $this->model
            ->newQuery()
            ->when(! empty($filters['search']), function ($query) use ($filters) {
                $search = trim((string) $filters['search']);

                $query->where(function ($query) use ($search) {
                    $query
                        ->where('code', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when(! empty($filters['status']) && in_array($filters['status'], CouponStatus::values(), true), function ($query) use ($filters) {
                $query->where('status', $filters['status']);
            })
            ->when(! empty($filters['type']) && in_array($filters['type'], CouponType::values(), true), function ($query) use ($filters) {
                $query->where('type', $filters['type']);
            });
    }
}
