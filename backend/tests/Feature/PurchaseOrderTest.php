<?php

namespace Tests\Feature;

use App\Enums\ProductGender;
use App\Enums\ProductStatus;
use App\Enums\PurchaseOrderStatus;
use App\Enums\StockMovementType;
use App\Enums\SupplierStatus;
use App\Enums\UserRole;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\PurchaseOrder;
use App\Models\StockMovement;
use App\Models\Supplier;
use App\Models\User;
use App\Services\Interfaces\InventoryServiceInterface;
use App\Services\Interfaces\PurchaseOrderServiceInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PurchaseOrderTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_manage_suppliers(): void
    {
        Sanctum::actingAs($this->admin());
        $response = $this->postJson('/api/v1/admin/suppliers', [
            'name' => 'Nhà cung cấp A', 'code' => '', 'email' => 'supplier@example.test', 'status' => SupplierStatus::Active->value,
        ])->assertCreated()->assertJsonPath('data.code', 'SUP0001');

        $id = $response->json('data.id');
        $this->putJson("/api/v1/admin/suppliers/{$id}", [
            'name' => 'Nhà cung cấp B', 'code' => 'SUP0001', 'email' => 'supplier@example.test', 'status' => SupplierStatus::Inactive->value,
        ])->assertOk()->assertJsonPath('data.name', 'Nhà cung cấp B');
        $this->deleteJson("/api/v1/admin/suppliers/{$id}")->assertOk();
        $this->assertSoftDeleted('suppliers', ['id' => $id]);
    }

    public function test_regular_user_cannot_access_purchase_management(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $this->getJson('/api/v1/admin/suppliers')->assertForbidden();
        $this->getJson('/api/v1/admin/purchase-orders')->assertForbidden();
    }

    public function test_purchase_order_totals_are_calculated_by_backend(): void
    {
        Sanctum::actingAs($this->admin());
        $supplier = $this->supplier();
        $product = $this->product(['stock' => 5]);

        $this->postJson('/api/v1/admin/purchase-orders', $this->payload($supplier, $product, 3, 100000) + [
            'subtotal' => 1, 'total' => 1,
        ])->assertCreated()
            ->assertJsonPath('data.subtotal', '300000.00')
            ->assertJsonPath('data.discount', '10000.00')
            ->assertJsonPath('data.shipping_fee', '20000.00')
            ->assertJsonPath('data.total', '310000.00');

        $this->assertSame(5, $product->fresh()->stock);
        $this->assertDatabaseCount('stock_movements', 0);
    }

    public function test_duplicate_variants_are_rejected(): void
    {
        Sanctum::actingAs($this->admin());
        $supplier = $this->supplier();
        $product = $this->product();
        $payload = $this->payload($supplier, $product);
        $payload['items'][] = $payload['items'][0];
        $this->postJson('/api/v1/admin/purchase-orders', $payload)->assertStatus(422)->assertJsonValidationErrors(['items.1.product_variant_id']);
    }

    public function test_two_variants_of_the_same_product_can_be_added(): void
    {
        Sanctum::actingAs($this->admin());
        $supplier = $this->supplier();
        $product = $this->product();
        $secondVariant = $product->variants()->create([
            'sku' => 'SKU'.Str::upper(Str::random(6)),
            'name' => '100ml',
            'volume_ml' => 100,
            'price' => 900000,
            'stock' => 3,
            'status' => 'active',
            'sort_order' => 2,
        ]);
        $payload = $this->payload($supplier, $product);
        $payload['items'][] = [
            'product_id' => $product->id,
            'product_variant_id' => $secondVariant->id,
            'quantity' => 4,
            'unit_cost' => 200000,
        ];

        $this->postJson('/api/v1/admin/purchase-orders', $payload)
            ->assertCreated()
            ->assertJsonCount(2, 'data.items');
    }

    public function test_ordering_does_not_change_stock_and_receiving_imports_once(): void
    {
        $admin = $this->admin();
        Sanctum::actingAs($admin);
        $supplier = $this->supplier();
        $product = $this->product(['stock' => 5]);
        $id = $this->postJson('/api/v1/admin/purchase-orders', $this->payload($supplier, $product, 4, 120000))->json('data.id');

        $this->patchJson("/api/v1/admin/purchase-orders/{$id}/status", ['status' => PurchaseOrderStatus::Ordered->value])->assertOk();
        $this->assertSame(5, $product->fresh()->stock);

        $this->patchJson("/api/v1/admin/purchase-orders/{$id}/status", ['status' => PurchaseOrderStatus::Received->value])->assertOk();
        $this->patchJson("/api/v1/admin/purchase-orders/{$id}/status", ['status' => PurchaseOrderStatus::Received->value])->assertOk();

        $purchaseOrder = PurchaseOrder::query()->findOrFail($id);
        $this->assertSame(9, $product->fresh()->stock);
        $this->assertSame($admin->id, $purchaseOrder->received_by);
        $this->assertNotNull($purchaseOrder->received_at);
        $this->assertDatabaseHas('stock_movements', [
            'product_id' => $product->id, 'product_variant_id' => $product->defaultVariant->id,
            'user_id' => $admin->id, 'type' => StockMovementType::Import->value,
            'quantity' => 4, 'stock_before' => 5, 'stock_after' => 9, 'reference' => $purchaseOrder->code,
        ]);
        $this->assertSame(1, StockMovement::query()->where('reference', $purchaseOrder->code)->count());
    }

    public function test_invalid_transition_is_rejected(): void
    {
        Sanctum::actingAs($this->admin());
        $supplier = $this->supplier();
        $product = $this->product();
        $id = $this->postJson('/api/v1/admin/purchase-orders', $this->payload($supplier, $product))->json('data.id');
        $this->patchJson("/api/v1/admin/purchase-orders/{$id}/status", ['status' => PurchaseOrderStatus::Received->value])
            ->assertStatus(422)->assertJsonValidationErrors(['status']);
    }

    public function test_received_order_cannot_be_edited_or_deleted(): void
    {
        Sanctum::actingAs($this->admin());
        $supplier = $this->supplier();
        $product = $this->product();
        $payload = $this->payload($supplier, $product);
        $id = $this->postJson('/api/v1/admin/purchase-orders', $payload)->json('data.id');
        $this->patchJson("/api/v1/admin/purchase-orders/{$id}/status", ['status' => PurchaseOrderStatus::Ordered->value])->assertOk();
        $this->patchJson("/api/v1/admin/purchase-orders/{$id}/status", ['status' => PurchaseOrderStatus::Received->value])->assertOk();
        $this->putJson("/api/v1/admin/purchase-orders/{$id}", $payload)->assertStatus(422);
        $this->deleteJson("/api/v1/admin/purchase-orders/{$id}")->assertStatus(422);
    }

    public function test_receiving_rolls_back_all_stock_when_one_item_fails(): void
    {
        $admin = $this->admin();
        Sanctum::actingAs($admin);
        $supplier = $this->supplier();
        $first = $this->product(['stock' => 2]);
        $second = $this->product(['stock' => 3]);
        $payload = $this->payload($supplier, $first, 2, 100000);
        $payload['items'][] = ['product_id' => $second->id, 'product_variant_id' => $second->defaultVariant->id, 'quantity' => 4, 'unit_cost' => 200000];
        $id = $this->postJson('/api/v1/admin/purchase-orders', $payload)->json('data.id');
        $this->patchJson("/api/v1/admin/purchase-orders/{$id}/status", ['status' => PurchaseOrderStatus::Ordered->value])->assertOk();

        $realInventory = app(InventoryServiceInterface::class);
        app()->instance(InventoryServiceInterface::class, new class($realInventory) implements InventoryServiceInterface
        {
            private int $imports = 0;

            public function __construct(private InventoryServiceInterface $real) {}

            public function getMovements(array $filters): array
            {
                return $this->real->getMovements($filters);
            }

            public function getProductMovements(int $productId, array $filters): array
            {
                return $this->real->getProductMovements($productId, $filters);
            }

            public function getVariantMovements(int $variantId, array $filters): array
            {
                return $this->real->getVariantMovements($variantId, $filters);
            }

            public function adjustStock(ProductVariant $product, int $quantity, string $type, ?User $user, ?string $note, ?string $reference = null): array
            {
                return $this->real->adjustStock($product, $quantity, $type, $user, $note, $reference);
            }

            public function decreaseForOrder(ProductVariant $product, int $quantity, Order $order): StockMovement
            {
                return $this->real->decreaseForOrder($product, $quantity, $order);
            }

            public function restoreForCancelledOrder(ProductVariant $product, int $quantity, Order $order): StockMovement
            {
                return $this->real->restoreForCancelledOrder($product, $quantity, $order);
            }

            public function importForPurchaseOrder(ProductVariant $product, int $quantity, PurchaseOrder $purchaseOrder, User $user): StockMovement
            {
                if (++$this->imports === 2) {
                    throw new \RuntimeException('Forced second item failure.');
                }

                return $this->real->importForPurchaseOrder($product, $quantity, $purchaseOrder, $user);
            }
        });

        $result = app(PurchaseOrderServiceInterface::class)->updateStatus($id, PurchaseOrderStatus::Received->value, $admin);
        $this->assertFalse($result['ok']);
        $this->assertSame(2, $first->fresh()->stock);
        $this->assertSame(3, $second->fresh()->stock);
        $this->assertDatabaseCount('stock_movements', 0);
        $this->assertSame(PurchaseOrderStatus::Ordered, PurchaseOrder::query()->findOrFail($id)->status);
    }

    private function admin(): User
    {
        return User::factory()->create(['role' => UserRole::Admin->value]);
    }

    private function supplier(): Supplier
    {
        return Supplier::query()->create(['name' => 'Supplier '.Str::random(5), 'code' => 'SUP'.Str::upper(Str::random(6)), 'status' => SupplierStatus::Active->value]);
    }

    private function product(array $overrides = []): Product
    {
        $name = 'Perfume '.Str::random(6);

        $attributes = array_merge([
            'name' => $name, 'slug' => Str::slug($name).Str::random(4), 'sku' => 'SKU'.Str::upper(Str::random(6)),
            'gender' => ProductGender::Unisex->value, 'price' => 500000, 'stock' => 0,
            'status' => ProductStatus::Active->value, 'is_featured' => false, 'sort_order' => 1,
        ], $overrides);
        $variant = collect($attributes)->only(['sku', 'concentration', 'volume_ml', 'price', 'sale_price', 'stock'])->all();
        $product = Product::query()->create(collect($attributes)->except(array_keys($variant))->all());
        $product->variants()->create([...$variant, 'status' => 'active', 'is_default' => true, 'sort_order' => 1]);

        return $product->fresh(['variants', 'defaultVariant']);
    }

    private function payload(Supplier $supplier, Product $product, int $quantity = 2, float $unitCost = 100000): array
    {
        return ['supplier_id' => $supplier->id, 'discount' => 10000, 'shipping_fee' => 20000, 'reference' => 'REF-01',
            'items' => [['product_id' => $product->id, 'product_variant_id' => $product->defaultVariant->id, 'quantity' => $quantity, 'unit_cost' => $unitCost]]];
    }
}
