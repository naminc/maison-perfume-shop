<?php

namespace App\Repositories;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Repositories\Interfaces\OrderRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class OrderRepository implements OrderRepositoryInterface
{
    public function __construct(protected Order $model) {}

    public function paginate(array $filters): LengthAwarePaginator
    {
        $perPage = $this->resolvePerPage($filters);

        return $this->baseFilteredQuery($filters)
            ->with(['user:id,full_name,email,phone'])
            ->withCount('items')
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function paginateByUser(int $userId, array $filters): LengthAwarePaginator
    {
        $perPage = $this->resolvePerPage($filters);

        return $this->baseFilteredQuery($filters)
            ->where('user_id', $userId)
            ->with(['items'])
            ->withCount('items')
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function findById(int $id): ?Order
    {
        return $this->model
            ->newQuery()
            ->with(['items', 'user:id,full_name,email,phone'])
            ->find($id);
    }

    public function findByCode(string $code): ?Order
    {
        return $this->model
            ->newQuery()
            ->with(['items', 'user:id,full_name,email,phone'])
            ->where('order_code', $code)
            ->first();
    }

    public function create(array $data): Order
    {
        return $this->model->create($data);
    }

    public function update(Order $order, array $data): Order
    {
        $order->update($data);

        return $this->getOrderWithItems($order);
    }

    public function delete(Order $order): bool
    {
        return (bool) $order->delete();
    }

    public function generateOrderCode(): string
    {
        do {
            $code = 'MS' . now()->format('ymdHis') . random_int(100, 999);
        } while (
            $this->model
                ->newQuery()
                ->withTrashed()
                ->where('order_code', $code)
                ->exists()
        );

        return $code;
    }

    public function getOrderWithItems(Order $order): Order
    {
        return $order->fresh(['items', 'user:id,full_name,email,phone']);
    }

    private function resolvePerPage(array $filters): int
    {
        $perPage = (int) ($filters['per_page'] ?? 10);

        return max(1, min($perPage, 100));
    }

    private function baseFilteredQuery(array $filters)
    {
        return $this->model
            ->newQuery()
            ->when(! empty($filters['search']), function ($query) use ($filters) {
                $search = trim((string) $filters['search']);

                $query->where(function ($query) use ($search) {
                    $query
                        ->where('order_code', 'like', "%{$search}%")
                        ->orWhere('customer_name', 'like', "%{$search}%")
                        ->orWhere('customer_phone', 'like', "%{$search}%")
                        ->orWhere('customer_email', 'like', "%{$search}%");
                });
            })
            ->when(! empty($filters['status']) && in_array($filters['status'], OrderStatus::values(), true), function ($query) use ($filters) {
                $query->where('status', $filters['status']);
            })
            ->when(! empty($filters['payment_status']) && in_array($filters['payment_status'], PaymentStatus::values(), true), function ($query) use ($filters) {
                $query->where('payment_status', $filters['payment_status']);
            })
            ->when(! empty($filters['payment_method']) && in_array($filters['payment_method'], PaymentMethod::values(), true), function ($query) use ($filters) {
                $query->where('payment_method', $filters['payment_method']);
            })
            ->when(! empty($filters['date_from']), fn ($query) => $query->whereDate('created_at', '>=', $filters['date_from']))
            ->when(! empty($filters['date_to']), fn ($query) => $query->whereDate('created_at', '<=', $filters['date_to']));
    }
}
