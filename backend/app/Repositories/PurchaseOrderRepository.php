<?php

namespace App\Repositories;

use App\Enums\PurchaseOrderStatus;
use App\Models\PurchaseOrder;
use App\Repositories\Interfaces\PurchaseOrderRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class PurchaseOrderRepository implements PurchaseOrderRepositoryInterface
{
    private const RELATIONS = ['supplier', 'items.product', 'items.variant', 'creator:id,full_name,email', 'receiver:id,full_name,email'];

    public function __construct(protected PurchaseOrder $model) {}

    public function paginate(array $filters): LengthAwarePaginator
    {
        return $this->model->newQuery()->with(self::RELATIONS)->withCount('items')
            ->withSum('items as total_quantity', 'quantity')
            ->when(! empty($filters['search']), function ($query) use ($filters) {
                $search = trim((string) $filters['search']);
                $query->where(fn ($query) => $query->where('code', 'like', "%{$search}%")->orWhere('reference', 'like', "%{$search}%"));
            })
            ->when(! empty($filters['supplier_id']), fn ($query) => $query->where('supplier_id', (int) $filters['supplier_id']))
            ->when(! empty($filters['status']) && in_array($filters['status'], PurchaseOrderStatus::values(), true), fn ($query) => $query->where('status', $filters['status']))
            ->when(! empty($filters['date_from']), fn ($query) => $query->whereDate('created_at', '>=', $filters['date_from']))
            ->when(! empty($filters['date_to']), fn ($query) => $query->whereDate('created_at', '<=', $filters['date_to']))
            ->latest('id')->paginate(max(1, min((int) ($filters['per_page'] ?? 10), 100)));
    }

    public function findById(int $id, bool $lock = false): ?PurchaseOrder
    {
        $query = $this->model->newQuery()->with(self::RELATIONS);
        if ($lock) {
            $query->lockForUpdate();
        }

        return $query->find($id);
    }

    public function create(array $data, array $items): PurchaseOrder
    {
        $purchaseOrder = $this->model->newQuery()->create($data);
        $purchaseOrder->items()->createMany($items);

        return $this->findById($purchaseOrder->id);
    }

    public function update(PurchaseOrder $purchaseOrder, array $data, array $items): PurchaseOrder
    {
        $purchaseOrder->update($data);
        $purchaseOrder->items()->delete();
        $purchaseOrder->items()->createMany($items);

        return $this->findById($purchaseOrder->id);
    }

    public function delete(PurchaseOrder $purchaseOrder): bool
    {
        return (bool) $purchaseOrder->delete();
    }

    public function codeExists(string $code): bool
    {
        return $this->model->newQuery()->withTrashed()->where('code', $code)->exists();
    }

    public function summary(): array
    {
        $query = $this->model->newQuery();

        return [
            'total' => (clone $query)->count(),
            'draft' => (clone $query)->where('status', PurchaseOrderStatus::Draft->value)->count(),
            'ordered' => (clone $query)->where('status', PurchaseOrderStatus::Ordered->value)->count(),
            'received' => (clone $query)->where('status', PurchaseOrderStatus::Received->value)->count(),
            'received_value' => (float) (clone $query)->where('status', PurchaseOrderStatus::Received->value)->sum('total'),
        ];
    }
}
