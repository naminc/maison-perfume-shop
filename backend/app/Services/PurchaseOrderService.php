<?php

namespace App\Services;

use App\Enums\PurchaseOrderStatus;
use App\Models\ProductVariant;
use App\Models\PurchaseOrder;
use App\Models\User;
use App\Repositories\Interfaces\PurchaseOrderRepositoryInterface;
use App\Services\Interfaces\InventoryServiceInterface;
use App\Services\Interfaces\PurchaseOrderServiceInterface;
use Illuminate\Validation\ValidationException;

class PurchaseOrderService extends BaseService implements PurchaseOrderServiceInterface
{
    public function __construct(
        protected PurchaseOrderRepositoryInterface $repository,
        protected InventoryServiceInterface $inventoryService,
    ) {}

    public function getPaginated(array $filters): array
    {
        return $this->executeSafe(fn () => $this->repository->paginate($filters), 'getPaginated');
    }

    public function getById(int $id): array
    {
        return $this->executeSafe(fn () => $this->repository->findById($id), 'getById');
    }

    public function getSummary(): array
    {
        return $this->executeSafe(fn () => $this->repository->summary(), 'getSummary');
    }

    public function create(array $data, User $user): array
    {
        return $this->executeTransaction(function () use ($data, $user) {
            [$payload, $items] = $this->prepare($data);
            $payload += ['code' => $this->nextCode(), 'created_by' => $user->id, 'status' => PurchaseOrderStatus::Draft->value];

            return $this->repository->create($payload, $items);
        }, 'create');
    }

    public function update(int $id, array $data): array
    {
        return $this->executeTransaction(function () use ($id, $data) {
            $purchaseOrder = $this->repository->findById($id, true);
            if (! $purchaseOrder) {
                return ['found' => false];
            }
            $this->assertDraft($purchaseOrder, 'Chỉ phiếu nháp mới được chỉnh sửa.');
            [$payload, $items] = $this->prepare($data);

            return ['found' => true, 'purchase_order' => $this->repository->update($purchaseOrder, $payload, $items)];
        }, 'update');
    }

    public function updateStatus(int $id, string $status, User $user): array
    {
        return $this->executeTransaction(function () use ($id, $status, $user) {
            $purchaseOrder = $this->repository->findById($id, true);
            if (! $purchaseOrder) {
                return ['found' => false];
            }

            $current = $purchaseOrder->status->value;
            if ($current === $status) {
                return ['found' => true, 'purchase_order' => $purchaseOrder, 'changed' => false];
            }

            $allowed = [
                PurchaseOrderStatus::Draft->value => [PurchaseOrderStatus::Ordered->value, PurchaseOrderStatus::Cancelled->value],
                PurchaseOrderStatus::Ordered->value => [PurchaseOrderStatus::Received->value, PurchaseOrderStatus::Cancelled->value],
            ];
            if (! in_array($status, $allowed[$current] ?? [], true)) {
                throw ValidationException::withMessages(['status' => ['Không thể chuyển sang trạng thái đã chọn.']]);
            }
            if ($purchaseOrder->items->isEmpty()) {
                throw ValidationException::withMessages(['items' => ['Phiếu nhập phải có ít nhất một sản phẩm.']]);
            }

            $updates = ['status' => $status];
            if ($status === PurchaseOrderStatus::Ordered->value) {
                $updates['ordered_at'] = now();
            }
            if ($status === PurchaseOrderStatus::Received->value) {
                foreach ($purchaseOrder->items as $item) {
                    $this->inventoryService->importForPurchaseOrder($item->variant, $item->quantity, $purchaseOrder, $user);
                }
                $updates['received_at'] = now();
                $updates['received_by'] = $user->id;
            }

            $purchaseOrder->update($updates);

            return ['found' => true, 'purchase_order' => $this->repository->findById($id), 'changed' => true];
        }, 'updateStatus');
    }

    public function delete(int $id): array
    {
        return $this->executeTransaction(function () use ($id) {
            $purchaseOrder = $this->repository->findById($id, true);
            if (! $purchaseOrder) {
                return ['found' => false];
            }
            $this->assertDraft($purchaseOrder, 'Chỉ phiếu nháp mới được xoá.');
            $this->repository->delete($purchaseOrder);

            return ['found' => true];
        }, 'delete');
    }

    private function prepare(array $data): array
    {
        $variantIds = collect($data['items'])->pluck('product_variant_id')->map(fn ($id) => (int) $id)->all();
        $variants = ProductVariant::query()->with('product')->whereIn('id', $variantIds)->get()->keyBy('id');
        if ($variants->count() !== count(array_unique($variantIds))) {
            throw ValidationException::withMessages(['items' => ['Một hoặc nhiều sản phẩm không tồn tại.']]);
        }

        $items = collect($data['items'])->map(function ($item) use ($variants) {
            $variant = $variants->get((int) $item['product_variant_id']);
            $product = $variant?->product;
            if (! $variant || ! $product || $variant->product_id !== (int) $item['product_id']) {
                throw ValidationException::withMessages(['items' => ['Phiên bản không thuộc sản phẩm đã chọn.']]);
            }
            $quantity = (int) $item['quantity'];
            $unitCost = round((float) $item['unit_cost'], 2);

            return [
                'product_id' => $product->id, 'product_variant_id' => $variant->id,
                'product_name' => $product->name, 'variant_name' => $variant->name, 'sku' => $variant->sku,
                'concentration' => $variant->concentration, 'volume_ml' => $variant->volume_ml,
                'quantity' => $quantity, 'unit_cost' => $unitCost, 'line_total' => round($quantity * $unitCost, 2),
            ];
        })->all();
        $subtotal = array_sum(array_column($items, 'line_total'));
        $discount = round((float) ($data['discount'] ?? 0), 2);
        if ($discount > $subtotal) {
            throw ValidationException::withMessages(['discount' => ['Chiết khấu không được vượt quá tạm tính.']]);
        }
        $shipping = round((float) ($data['shipping_fee'] ?? 0), 2);

        return [[
            'supplier_id' => (int) $data['supplier_id'], 'subtotal' => $subtotal, 'discount' => $discount,
            'shipping_fee' => $shipping, 'total' => $subtotal - $discount + $shipping,
            'reference' => $this->nullable($data['reference'] ?? null), 'note' => $this->nullable($data['note'] ?? null),
        ], $items];
    }

    private function assertDraft(PurchaseOrder $purchaseOrder, string $message): void
    {
        if ($purchaseOrder->status !== PurchaseOrderStatus::Draft) {
            throw ValidationException::withMessages(['status' => [$message]]);
        }
    }

    private function nextCode(): string
    {
        $prefix = 'PO'.now()->format('ymd');
        $number = 1;
        do {
            $code = $prefix.str_pad((string) $number++, 4, '0', STR_PAD_LEFT);
        } while ($this->repository->codeExists($code));

        return $code;
    }

    private function nullable(mixed $value): ?string
    {
        $value = trim((string) $value);

        return $value === '' ? null : $value;
    }
}
