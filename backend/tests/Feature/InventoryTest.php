<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\ProductGender;
use App\Enums\ProductStatus;
use App\Enums\StockMovementType;
use App\Enums\UserRole;
use App\Models\Order;
use App\Models\Product;
use App\Models\Province;
use App\Models\StockMovement;
use App\Models\User;
use App\Models\Ward;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class InventoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_import_stock_and_movement_is_recorded(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $product = $this->createProduct(['stock' => 5]);
        Sanctum::actingAs($admin);

        $this->postJson("/api/v1/admin/products/{$product->id}/stock-adjustments", [
            'type' => StockMovementType::Import->value,
            'quantity' => 7,
            'reference' => 'PN-001',
        ])->assertCreated()
            ->assertJsonPath('data.quantity', 7)
            ->assertJsonPath('data.stock_before', 5)
            ->assertJsonPath('data.stock_after', 12);

        $this->assertSame(12, $product->fresh()->stock);
        $this->assertDatabaseHas('stock_movements', [
            'product_id' => $product->id,
            'user_id' => $admin->id,
            'type' => StockMovementType::Import->value,
            'quantity' => 7,
            'stock_before' => 5,
            'stock_after' => 12,
        ]);
    }

    public function test_admin_can_export_stock_but_cannot_make_stock_negative(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $product = $this->createProduct(['stock' => 5]);
        Sanctum::actingAs($admin);

        $this->postJson("/api/v1/admin/products/{$product->id}/stock-adjustments", [
            'type' => StockMovementType::Export->value,
            'quantity' => 3,
        ])->assertCreated()
            ->assertJsonPath('data.quantity', -3)
            ->assertJsonPath('data.stock_after', 2);

        $this->postJson("/api/v1/admin/products/{$product->id}/stock-adjustments", [
            'type' => StockMovementType::Export->value,
            'quantity' => 3,
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['quantity']);

        $this->assertSame(2, $product->fresh()->stock);
        $this->assertSame(1, StockMovement::query()->count());
    }

    public function test_adjustment_requires_note_and_records_signed_quantity(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $product = $this->createProduct(['stock' => 8]);
        Sanctum::actingAs($admin);

        $this->postJson("/api/v1/admin/products/{$product->id}/stock-adjustments", [
            'type' => StockMovementType::Adjustment->value,
            'quantity' => -2,
        ])->assertStatus(422)->assertJsonValidationErrors(['note']);

        $this->postJson("/api/v1/admin/products/{$product->id}/stock-adjustments", [
            'type' => StockMovementType::Adjustment->value,
            'quantity' => -2,
            'note' => 'Kiểm kê thực tế.',
        ])->assertCreated()
            ->assertJsonPath('data.stock_before', 8)
            ->assertJsonPath('data.stock_after', 6);

        $this->assertSame(6, $product->fresh()->stock);
    }

    public function test_regular_user_cannot_access_inventory_admin_api(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->getJson('/api/v1/admin/inventory/movements')->assertForbidden();
    }

    public function test_product_update_cannot_bypass_inventory_history(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $product = $this->createProduct(['stock' => 5]);
        Sanctum::actingAs($admin);

        $this->putJson("/api/v1/admin/products/{$product->id}", [
            'name' => $product->name,
            'slug' => $product->slug,
            'sku' => $product->sku,
            'gender' => $product->gender->value,
            'concentration' => $product->concentration,
            'volume_ml' => $product->volume_ml,
            'price' => $product->price,
            'sale_price' => $product->sale_price,
            'stock' => 99,
            'status' => $product->status->value,
            'is_featured' => $product->is_featured,
            'sort_order' => $product->sort_order,
        ])->assertStatus(422)->assertJsonValidationErrors(['stock']);

        $this->assertSame(5, $product->fresh()->stock);
        $this->assertDatabaseCount('stock_movements', 0);
    }

    public function test_order_decreases_stock_and_creates_order_movement(): void
    {
        Notification::fake();
        $user = User::factory()->create();
        $product = $this->createProduct(['stock' => 5]);
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/orders', $this->orderPayload($product, 2))->assertCreated();
        $order = Order::query()->where('order_code', $response->json('data.order_code'))->firstOrFail();

        $this->assertSame(3, $product->fresh()->stock);
        $this->assertDatabaseHas('stock_movements', [
            'product_id' => $product->id,
            'order_id' => $order->id,
            'type' => StockMovementType::Order->value,
            'quantity' => -2,
            'stock_before' => 5,
            'stock_after' => 3,
        ]);
    }

    public function test_cancelling_order_restores_stock_and_creates_one_movement(): void
    {
        Notification::fake();
        $user = User::factory()->create();
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $product = $this->createProduct(['stock' => 5]);
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/orders', $this->orderPayload($product, 2))->assertCreated();
        $order = Order::query()->where('order_code', $response->json('data.order_code'))->firstOrFail();

        Sanctum::actingAs($admin);
        $payload = ['status' => OrderStatus::Cancelled->value];
        $this->patchJson("/api/v1/admin/orders/{$order->id}/status", $payload)->assertOk();
        $this->patchJson("/api/v1/admin/orders/{$order->id}/status", $payload)->assertOk();

        $this->assertSame(5, $product->fresh()->stock);
        $this->assertSame(1, StockMovement::query()
            ->where('order_id', $order->id)
            ->where('type', StockMovementType::OrderCancelled->value)
            ->count());
    }

    public function test_failed_order_does_not_create_partial_stock_movements(): void
    {
        Notification::fake();
        $user = User::factory()->create();
        $available = $this->createProduct(['stock' => 5]);
        $unavailable = $this->createProduct(['stock' => 0]);
        Sanctum::actingAs($user);

        $payload = $this->orderPayload($available, 1);
        $payload['items'][] = ['product_id' => $unavailable->id, 'quantity' => 1];

        $this->postJson('/api/v1/orders', $payload)
            ->assertStatus(422)
            ->assertJsonValidationErrors(['items']);

        $this->assertSame(5, $available->fresh()->stock);
        $this->assertDatabaseCount('orders', 0);
        $this->assertDatabaseCount('stock_movements', 0);
    }

    private function createProduct(array $overrides = []): Product
    {
        $name = $overrides['name'] ?? 'Inventory Perfume '.Str::random(8);

        return Product::query()->create(array_merge([
            'name' => $name,
            'slug' => Str::slug($name).'-'.Str::lower(Str::random(6)),
            'sku' => 'INV-'.Str::upper(Str::random(8)),
            'gender' => ProductGender::Unisex->value,
            'concentration' => 'EDP',
            'volume_ml' => 100,
            'price' => 1200000,
            'sale_price' => null,
            'stock' => 10,
            'status' => ProductStatus::Active->value,
            'is_featured' => false,
            'sort_order' => 1,
        ], $overrides));
    }

    private function orderPayload(Product $product, int $quantity): array
    {
        [$province, $ward] = $this->ensureGeo();

        return [
            'customer_name' => 'Ngo Dinh Nam',
            'customer_phone' => '0347101143',
            'customer_email' => 'naminc@example.test',
            'province_code' => $province->code,
            'province_name' => $province->full_name,
            'ward_code' => $ward->code,
            'ward_name' => $ward->full_name,
            'shipping_address' => 'So 3, Duong so 30',
            'payment_method' => PaymentMethod::Cod->value,
            'shipping_method' => 'standard',
            'items' => [['product_id' => $product->id, 'quantity' => $quantity]],
        ];
    }

    private function ensureGeo(): array
    {
        $province = Province::query()->updateOrCreate(
            ['code' => 'TST'],
            ['name' => 'Test Province', 'full_name' => 'Tinh Test', 'slug' => 'tinh-test', 'type' => 'province', 'is_central' => false],
        );
        $ward = Ward::query()->updateOrCreate(
            ['code' => 'TST001'],
            ['name' => 'Phuong Test', 'full_name' => 'Phuong Test', 'slug' => 'phuong-test', 'type' => 'ward', 'province_code' => $province->code],
        );

        return [$province, $ward];
    }
}
