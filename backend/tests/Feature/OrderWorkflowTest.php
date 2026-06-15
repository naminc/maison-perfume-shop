<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\ProductGender;
use App\Enums\ProductStatus;
use App\Enums\UserRole;
use App\Models\Order;
use App\Models\Product;
use App\Models\Province;
use App\Models\User;
use App\Models\Ward;
use App\Notifications\Order\OrderPlacedNotification;
use App\Notifications\Order\OrderStatusUpdatedNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrderWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_creating_cod_order_decrements_stock(): void
    {
        $user = User::factory()->create();
        $product = $this->createProduct(['stock' => 5]);

        Sanctum::actingAs($user);

        $this->postJson('/api/v1/orders', $this->orderPayload($product, 2))
            ->assertCreated()
            ->assertJsonPath('data.status', OrderStatus::Pending->value)
            ->assertJsonPath('data.payment_method', PaymentMethod::Cod->value)
            ->assertJsonPath('data.payment_status', PaymentStatus::Unpaid->value);

        $this->assertSame(3, $product->fresh()->stock);
    }

    public function test_creating_order_sends_order_placed_notification(): void
    {
        Notification::fake();

        $user = User::factory()->create();
        $product = $this->createProduct(['stock' => 5]);

        Sanctum::actingAs($user);

        $this->postJson('/api/v1/orders', $this->orderPayload($product, 1, [
            'customer_email' => 'customer@example.test',
        ]))->assertCreated();

        Notification::assertSentOnDemand(OrderPlacedNotification::class);
    }

    public function test_order_is_rejected_when_stock_is_insufficient(): void
    {
        $user = User::factory()->create();
        $product = $this->createProduct(['stock' => 1]);

        Sanctum::actingAs($user);

        $this->postJson('/api/v1/orders', $this->orderPayload($product, 2))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['items']);

        $this->assertSame(1, $product->fresh()->stock);
    }

    public function test_admin_cancel_order_restores_stock_once(): void
    {
        $user = User::factory()->create();
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $product = $this->createProduct(['stock' => 5]);
        $order = $this->createOrderForUser($user, $product, 2);

        $this->assertSame(3, $product->fresh()->stock);

        Sanctum::actingAs($admin);

        $this->patchJson("/api/v1/admin/orders/{$order->id}/status", [
            'status' => OrderStatus::Cancelled->value,
        ])->assertOk();

        $this->assertSame(5, $product->fresh()->stock);

        $this->patchJson("/api/v1/admin/orders/{$order->id}/status", [
            'status' => OrderStatus::Cancelled->value,
        ])->assertOk();

        $this->assertSame(5, $product->fresh()->stock);
    }

    public function test_completed_cod_order_marks_payment_as_paid(): void
    {
        $user = User::factory()->create();
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $product = $this->createProduct(['stock' => 5]);
        $order = $this->createOrderForUser($user, $product, 1);

        Sanctum::actingAs($admin);

        foreach ([
            OrderStatus::Confirmed,
            OrderStatus::Processing,
            OrderStatus::Shipping,
            OrderStatus::Completed,
        ] as $status) {
            $this->patchJson("/api/v1/admin/orders/{$order->id}/status", [
                'status' => $status->value,
            ])->assertOk();
        }

        $order->refresh();

        $this->assertSame(OrderStatus::Completed, $order->status);
        $this->assertSame(PaymentStatus::Paid, $order->payment_status);
        $this->assertNotNull($order->completed_at);
        $this->assertSame(4, $product->fresh()->stock);
    }

    public function test_status_update_sends_notification(): void
    {
        $user = User::factory()->create();
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $product = $this->createProduct(['stock' => 5]);
        $order = $this->createOrderForUser($user, $product, 1);

        Notification::fake();
        Sanctum::actingAs($admin);

        $this->patchJson("/api/v1/admin/orders/{$order->id}/status", [
            'status' => OrderStatus::Confirmed->value,
        ])->assertOk();

        Notification::assertSentOnDemand(OrderStatusUpdatedNotification::class);
    }

    public function test_updating_to_same_status_does_not_send_status_notification(): void
    {
        $user = User::factory()->create();
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $product = $this->createProduct(['stock' => 5]);
        $order = $this->createOrderForUser($user, $product, 1);

        Notification::fake();
        Sanctum::actingAs($admin);

        $this->patchJson("/api/v1/admin/orders/{$order->id}/status", [
            'status' => OrderStatus::Pending->value,
        ])->assertOk();

        Notification::assertSentOnDemandTimes(OrderStatusUpdatedNotification::class, 0);
    }

    public function test_invalid_transition_is_rejected(): void
    {
        $user = User::factory()->create();
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $product = $this->createProduct(['stock' => 5]);
        $order = $this->createOrderForUser($user, $product, 1);

        Sanctum::actingAs($admin);

        foreach ([OrderStatus::Confirmed, OrderStatus::Processing, OrderStatus::Shipping] as $status) {
            $this->patchJson("/api/v1/admin/orders/{$order->id}/status", [
                'status' => $status->value,
            ])->assertOk();
        }

        $this->patchJson("/api/v1/admin/orders/{$order->id}/status", [
            'status' => OrderStatus::Cancelled->value,
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['status']);

        $this->assertSame(OrderStatus::Shipping, $order->fresh()->status);
        $this->assertSame(4, $product->fresh()->stock);
    }

    public function test_user_can_cancel_own_pending_order_and_stock_is_restored(): void
    {
        $user = User::factory()->create();
        $product = $this->createProduct(['stock' => 5]);
        $order = $this->createOrderForUser($user, $product, 2);

        Sanctum::actingAs($user);

        $this->patchJson("/api/v1/account/orders/{$order->order_code}/cancel")
            ->assertOk()
            ->assertJsonPath('data.status', OrderStatus::Cancelled->value);

        $order->refresh();

        $this->assertSame(OrderStatus::Cancelled, $order->status);
        $this->assertNotNull($order->cancelled_at);
        $this->assertSame(5, $product->fresh()->stock);
    }

    public function test_user_cancel_sends_status_notification(): void
    {
        $user = User::factory()->create();
        $product = $this->createProduct(['stock' => 5]);
        $order = $this->createOrderForUser($user, $product, 1);

        Notification::fake();
        Sanctum::actingAs($user);

        $this->patchJson("/api/v1/account/orders/{$order->order_code}/cancel")
            ->assertOk();

        Notification::assertSentOnDemand(OrderStatusUpdatedNotification::class);
    }

    public function test_order_notification_is_skipped_when_recipient_email_is_invalid(): void
    {
        Notification::fake();

        $user = User::factory()->create(['email' => 'invalid-email']);
        $product = $this->createProduct(['stock' => 5]);

        Sanctum::actingAs($user);

        $this->postJson('/api/v1/orders', $this->orderPayload($product, 1, [
            'customer_email' => null,
        ]))->assertCreated();

        Notification::assertNothingSent();
    }

    public function test_user_cannot_cancel_another_users_order(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $product = $this->createProduct(['stock' => 5]);
        $order = $this->createOrderForUser($owner, $product, 1);

        Sanctum::actingAs($other);

        $this->patchJson("/api/v1/account/orders/{$order->order_code}/cancel")
            ->assertForbidden();

        $this->assertSame(OrderStatus::Pending, $order->fresh()->status);
        $this->assertSame(4, $product->fresh()->stock);
    }

    public function test_user_cannot_cancel_shipping_order(): void
    {
        $user = User::factory()->create();
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $product = $this->createProduct(['stock' => 5]);
        $order = $this->createOrderForUser($user, $product, 1);

        Sanctum::actingAs($admin);

        foreach ([OrderStatus::Confirmed, OrderStatus::Processing, OrderStatus::Shipping] as $status) {
            $this->patchJson("/api/v1/admin/orders/{$order->id}/status", [
                'status' => $status->value,
            ])->assertOk();
        }

        Sanctum::actingAs($user);

        $this->patchJson("/api/v1/account/orders/{$order->order_code}/cancel")
            ->assertStatus(422)
            ->assertJsonValidationErrors(['status']);

        $this->assertSame(OrderStatus::Shipping, $order->fresh()->status);
        $this->assertSame(4, $product->fresh()->stock);
    }

    private function createOrderForUser(User $user, Product $product, int $quantity): Order
    {
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/orders', $this->orderPayload($product, $quantity))
            ->assertCreated();

        return Order::query()->where('order_code', $response->json('data.order_code'))->firstOrFail();
    }

    private function orderPayload(Product $product, int $quantity, array $overrides = []): array
    {
        [$province, $ward] = $this->ensureGeo();

        return array_merge([
            'customer_name' => 'Ngo Dinh Nam',
            'customer_phone' => '0347101143',
            'customer_email' => 'naminc@example.test',
            'province_code' => $province->code,
            'province_name' => $province->full_name,
            'ward_code' => $ward->code,
            'ward_name' => $ward->full_name,
            'shipping_address' => 'Số 3, Đường số 30',
            'payment_method' => PaymentMethod::Cod->value,
            'shipping_method' => 'standard',
            'items' => [
                ['product_id' => $product->id, 'quantity' => $quantity],
            ],
        ], $overrides);
    }

    private function createProduct(array $overrides = []): Product
    {
        $name = $overrides['name'] ?? 'Test Perfume ' . Str::random(8);

        return Product::query()->create(array_merge([
            'name' => $name,
            'slug' => Str::slug($name) . '-' . Str::lower(Str::random(6)),
            'sku' => 'TEST-' . Str::upper(Str::random(8)),
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

    private function ensureGeo(): array
    {
        $province = Province::query()->updateOrCreate(
            ['code' => 'TST'],
            [
                'name' => 'Test Province',
                'full_name' => 'Tỉnh Test',
                'slug' => 'tinh-test',
                'type' => 'province',
                'is_central' => false,
            ],
        );

        $ward = Ward::query()->updateOrCreate(
            ['code' => 'TST001'],
            [
                'name' => 'Phường Test',
                'full_name' => 'Phường Test',
                'slug' => 'phuong-test',
                'type' => 'ward',
                'province_code' => $province->code,
            ],
        );

        return [$province, $ward];
    }
}
