<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\ProductGender;
use App\Enums\ProductReviewStatus;
use App\Enums\ProductStatus;
use App\Enums\UserRole;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductReview;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_dashboard_stats(): void
    {
        $this->getJson('/api/v1/admin/dashboard/stats')->assertUnauthorized();
    }

    public function test_regular_user_cannot_access_dashboard_stats(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/v1/admin/dashboard/stats')->assertForbidden();
    }

    public function test_dashboard_stats_returns_correct_numbers(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $product = $this->createProduct(['stock' => 3]);

        $completed = $this->createOrder([
            'status' => OrderStatus::Completed->value,
            'total' => 500000,
        ]);
        $this->createOrderItem($completed, $product, 2, 500000);

        $pending = $this->createOrder([
            'status' => OrderStatus::Pending->value,
            'total' => 300000,
        ]);
        $this->createOrderItem($pending, $product, 1, 300000);

        $cancelled = $this->createOrder([
            'status' => OrderStatus::Cancelled->value,
            'total' => 900000,
        ]);
        $this->createOrderItem($cancelled, $product, 3, 900000);

        ProductReview::query()->create([
            'user_id' => User::factory()->create()->id,
            'product_id' => $product->id,
            'order_id' => $completed->id,
            'order_item_id' => $completed->items()->first()->id,
            'rating' => 5,
            'title' => 'Tuyet voi',
            'content' => 'Rat thom va giu mui lau.',
            'status' => ProductReviewStatus::Pending->value,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/v1/admin/dashboard/stats?period=7d')->assertOk();

        // Doanh thu loại đơn hủy: 500000 + 300000
        $response
            ->assertJsonPath('data.summary.revenue', 800000)
            ->assertJsonPath('data.summary.orders_count', 2)
            ->assertJsonPath('data.summary.pending_reviews', 1)
            ->assertJsonPath('data.orders_by_status.completed', 1)
            ->assertJsonPath('data.orders_by_status.pending', 1)
            ->assertJsonPath('data.orders_by_status.cancelled', 1);

        $topProducts = $response->json('data.top_products');
        $this->assertCount(1, $topProducts);
        $this->assertSame($product->id, $topProducts[0]['product_id']);
        $this->assertSame(3, $topProducts[0]['total_quantity']);

        $lowStock = collect($response->json('data.low_stock_products'));
        $this->assertTrue($lowStock->contains('id', $product->id));

        $this->assertCount(3, $response->json('data.recent_orders'));
        $this->assertCount(7, $response->json('data.revenue_by_day'));
    }

    public function test_dashboard_stats_supports_custom_range(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);

        $oldOrder = $this->createOrder([
            'status' => OrderStatus::Completed->value,
            'total' => 400000,
        ]);
        $oldOrder->forceFill(['created_at' => now()->subDays(20)])->save();

        $this->createOrder([
            'status' => OrderStatus::Completed->value,
            'total' => 250000,
        ]);

        Sanctum::actingAs($admin);

        $from = now()->subDays(25)->toDateString();
        $to = now()->subDays(15)->toDateString();

        $this->getJson("/api/v1/admin/dashboard/stats?period=custom&from={$from}&to={$to}")
            ->assertOk()
            ->assertJsonPath('data.summary.revenue', 400000)
            ->assertJsonPath('data.summary.orders_count', 1)
            ->assertJsonPath('data.range.from', $from)
            ->assertJsonPath('data.range.to', $to);
    }

    private function createOrder(array $overrides = []): Order
    {
        return Order::query()->create(array_merge([
            'user_id' => null,
            'order_code' => 'ORD-' . Str::upper(Str::random(10)),
            'customer_name' => 'Khach Test',
            'customer_email' => 'khach@example.test',
            'customer_phone' => '0900000000',
            'shipping_address' => '123 Duong Test',
            'payment_method' => PaymentMethod::Cod->value,
            'payment_status' => PaymentStatus::Unpaid->value,
            'status' => OrderStatus::Pending->value,
            'subtotal' => 500000,
            'discount_total' => 0,
            'shipping_fee' => 0,
            'total' => 500000,
        ], $overrides));
    }

    private function createOrderItem(Order $order, Product $product, int $quantity, float $lineTotal): OrderItem
    {
        $variant = $product->defaultVariant;

        return OrderItem::query()->create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'product_name' => $product->name,
            'product_slug' => $product->slug,
            'product_sku' => $variant->sku,
            'variant_name' => $variant->name,
            'product_image' => $product->image,
            'unit_price' => $lineTotal / max(1, $quantity),
            'original_price' => $variant->price,
            'quantity' => $quantity,
            'line_total' => $lineTotal,
        ]);
    }

    private function createProduct(array $overrides = []): Product
    {
        $name = 'Test Perfume ' . Str::random(8);

        $attributes = array_merge([
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
        ], $overrides);
        $variant = collect($attributes)->only(['sku', 'concentration', 'volume_ml', 'price', 'sale_price', 'stock'])->all();
        $product = Product::query()->create(collect($attributes)->except(array_keys($variant))->all());
        $product->variants()->create([...$variant, 'status' => 'active', 'is_default' => true, 'sort_order' => 1]);

        return $product->fresh(['variants', 'defaultVariant']);
    }
}
