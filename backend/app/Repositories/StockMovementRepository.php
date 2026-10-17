<?php

namespace App\Repositories;

use App\Enums\StockMovementType;
use App\Models\StockMovement;
use App\Repositories\Interfaces\StockMovementRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class StockMovementRepository implements StockMovementRepositoryInterface
{
    public function __construct(protected StockMovement $model) {}

    public function paginate(array $filters): LengthAwarePaginator
    {
        return $this->filteredQuery($filters)->paginate($this->perPage($filters));
    }

    public function getByProduct(int $productId, array $filters): LengthAwarePaginator
    {
        return $this->filteredQuery($filters)
            ->where('product_id', $productId)
            ->paginate($this->perPage($filters));
    }

    public function getByVariant(int $variantId, array $filters): LengthAwarePaginator
    {
        return $this->filteredQuery($filters)
            ->where('product_variant_id', $variantId)
            ->paginate($this->perPage($filters));
    }

    public function create(array $data): StockMovement
    {
        return $this->model->newQuery()->create($data)->load($this->relations());
    }

    public function findById(int $id): ?StockMovement
    {
        return $this->model->newQuery()->with($this->relations())->find($id);
    }

    private function filteredQuery(array $filters)
    {
        return $this->model->newQuery()
            ->with($this->relations())
            ->when(! empty($filters['product_id']), fn ($query) => $query->where('product_id', (int) $filters['product_id']))
            ->when(! empty($filters['product_variant_id']), fn ($query) => $query->where('product_variant_id', (int) $filters['product_variant_id']))
            ->when(! empty($filters['type']) && in_array($filters['type'], StockMovementType::values(), true), fn ($query) => $query->where('type', $filters['type']))
            ->when(! empty($filters['date_from']), fn ($query) => $query->whereDate('created_at', '>=', $filters['date_from']))
            ->when(! empty($filters['date_to']), fn ($query) => $query->whereDate('created_at', '<=', $filters['date_to']))
            ->when(! empty($filters['search']), function ($query) use ($filters) {
                $search = trim((string) $filters['search']);
                $query->where(function ($query) use ($search) {
                    $query->where('reference', 'like', "%{$search}%")
                        ->orWhere('note', 'like', "%{$search}%")
                        ->orWhereHas('product', fn ($productQuery) => $productQuery->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('variant', fn ($variantQuery) => $variantQuery->where('sku', 'like', "%{$search}%"));
                });
            })
            ->latest('created_at')
            ->latest('id');
    }

    private function relations(): array
    {
        return [
            'product:id,name,slug,image,brand_id',
            'product.brand:id,name',
            'variant:id,product_id,sku,name,concentration,volume_ml,stock',
            'order:id,order_code',
            'user:id,full_name,email',
        ];
    }

    private function perPage(array $filters): int
    {
        return max(1, min((int) ($filters['per_page'] ?? 15), 100));
    }
}
