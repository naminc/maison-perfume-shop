<?php

namespace Tests\Feature;

use App\Enums\CouponStatus;
use App\Enums\CouponType;
use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\ProductGender;
use App\Enums\ProductStatus;
use App\Enums\UserRole;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\Product;
use App\Models\Province;
use App\Models\User;
use App\Models\Ward;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CouponTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_validate_active_coupon_for_checkout(): void
    {
        $user = User::factory()->create();
        $product = $this->createProduct(['price' => 1200000, 'stock' => 5]);
        $this->createCoupon([
            'code' => 'WELCOME10',
            'type' => CouponType::Percent->value,
            'value' => 10,
            'max_discount_amount' => 100000,
        ]);

        Sanctum::actingAs($user);

        $this->postJson('/api/v1/coupons/validate', [
            'code' => 'welcome10',
            'shipping_method' => 'standard',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
            ],
        ])->assertOk()
            ->assertJsonPath('data.coupon.code', 'WELCOME10')
            ->assertJsonPath('data.discount_total', 100000);
    }

    public function test_free_shipping_coupon_discounts_shipping_fee(): void
    {
        $user = User::factory()->create();
        $product = $this->createProduct(['price' => 300000, 'stock' => 5]);
        $this->createCoupon([
            'code' => 'FREESHIP',
            'type' => CouponType::FreeShipping->value,
            'value' => null,
        ]);

        Sanctum::actingAs($user);

        $this->postJson('/api/v1/coupons/validate', [
            'code' => 'FREESHIP',
            'shipping_method' => 'standard',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
            ],
        ])->assertOk()
            ->assertJsonPath('data.shipping_fee', 30000)
            ->assertJsonPath('data.discount_total', 30000)
            ->assertJsonPath('data.total', 300000);
    }

    public function test_creating_order_with_coupon_stores_discount_and_increments_usage(): void
    {
        Notification::fake();

        $user = User::factory()->create();
        $product = $this->createProduct(['price' => 1200000, 'stock' => 5]);
        $coupon = $this->createCoupon([
            'code' => 'WELCOME10',
            'type' => CouponType::Percent->value,
            'value' => 10,
            'max_discount_amount' => 100000,
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/orders', $this->orderPayload($product, 1, [
            'coupon_code' => 'welcome10',
        ]))->assertCreated();

        $order = Order::query()->where('order_code', $response->json('data.order_code'))->firstOrFail();

        $this->assertSame('WELCOME10', $order->coupon_code);
        $this->assertSame(100000.0, (float) $order->discount_total);
        $this->assertSame(1100000.0, (float) $order->total);
        $this->assertSame(1, $coupon->fresh()->used_count);
    }

    public function test_order_is_rejected_when_coupon_is_invalid(): void
    {
        $user = User::factory()->create();
        $product = $this->createProduct(['stock' => 5]);

        Sanctum::actingAs($user);

        $this->postJson('/api/v1/orders', $this->orderPayload($product, 1, [
            'coupon_code' => 'NOPE',
        ]))->assertStatus(422)
            ->assertJsonValidationErrors(['coupon_code']);
    }

    public function test_per_user_coupon_limit_is_enforced(): void
    {
        Notification::fake();

        $user = User::factory()->create();
        $product = $this->createProduct(['price' => 1200000, 'stock' => 5]);
        $this->createCoupon([
            'code' => 'ONCE',
            'type' => CouponType::Fixed->value,
            'value' => 100000,
            'per_user_limit' => 1,
        ]);

        Sanctum::actingAs($user);

        $this->postJson('/api/v1/orders', $this->orderPayload($product, 1, [
            'coupon_code' => 'ONCE',
        ]))->assertCreated();

        $this->postJson('/api/v1/orders', $this->orderPayload($product, 1, [
            'coupon_code' => 'ONCE',
        ]))->assertStatus(422)
            ->assertJsonValidationErrors(['coupon_code']);
    }

    public function test_cancelling_order_restores_coupon_usage_once(): void
    {
        Notification::fake();

        $user = User::factory()->create();
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $product = $this->createProduct(['price' => 1200000, 'stock' => 5]);
        $coupon = $this->createCoupon([
            'code' => 'SAVE100',
            'type' => CouponType::Fixed->value,
            'value' => 100000,
        ]);

        Sanctum::actingAs($user);
        $response = $this->postJson('/api/v1/orders', $this->orderPayload($product, 1, [
            'coupon_code' => 'SAVE100',
        ]))->assertCreated();

        $order = Order::query()->where('order_code', $response->json('data.order_code'))->firstOrFail();
        $this->assertSame(1, $coupon->fresh()->used_count);

        Sanctum::actingAs($admin);

        $this->patchJson("/api/v1/admin/orders/{$order->id}/status", [
            'status' => OrderStatus::Cancelled->value,
        ])->assertOk();

        $this->assertSame(0, $coupon->fresh()->used_count);

        $this->patchJson("/api/v1/admin/orders/{$order->id}/status", [
            'status' => OrderStatus::Cancelled->value,
        ])->assertOk();

        $this->assertSame(0, $coupon->fresh()->used_count);
    }

    public function test_admin_can_create_coupon_and_code_is_uppercased(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);

        Sanctum::actingAs($admin);

        $this->postJson('/api/v1/admin/coupons', [
            'code' => 'summer_10',
            'name' => 'Summer 10',
            'description' => 'Giảm 10% mùa hè.',
            'type' => CouponType::Percent->value,
            'value' => 10,
            'min_order_amount' => 0,
            'max_discount_amount' => 100000,
            'usage_limit' => 100,
            'per_user_limit' => 1,
            'starts_at' => null,
            'expires_at' => null,
            'status' => CouponStatus::Active->value,
        ])->assertCreated()
            ->assertJsonPath('data.code', 'SUMMER_10');

        $this->assertDatabaseHas('coupons', [
            'code' => 'SUMMER_10',
            'type' => CouponType::Percent->value,
        ]);
    }

    private function createCoupon(array $overrides = []): Coupon
    {
        return Coupon::query()->create(array_merge([
            'code' => 'TESTCOUPON',
            'name' => 'Test Coupon',
            'description' => null,
            'type' => CouponType::Fixed->value,
            'value' => 100000,
            'min_order_amount' => 0,
            'max_discount_amount' => null,
            'usage_limit' => null,
            'used_count' => 0,
            'per_user_limit' => null,
            'starts_at' => null,
            'expires_at' => null,
            'status' => CouponStatus::Active->value,
        ], $overrides));
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
            'shipping_address' => 'So 3, Duong so 30',
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
                'full_name' => 'Tinh Test',
                'slug' => 'tinh-test',
                'type' => 'province',
                'is_central' => false,
            ],
        );

        $ward = Ward::query()->updateOrCreate(
            ['code' => 'TST001'],
            [
                'name' => 'Phuong Test',
                'full_name' => 'Phuong Test',
                'slug' => 'phuong-test',
                'type' => 'ward',
                'province_code' => $province->code,
            ],
        );

        return [$province, $ward];
    }
}
