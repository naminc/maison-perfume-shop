<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\ProductGender;
use App\Enums\ProductReviewStatus;
use App\Enums\ProductStatus;
use App\Enums\UserRole;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductReview;
use App\Models\Province;
use App\Models\User;
use App\Models\Ward;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProductReviewTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_create_review(): void
    {
        $product = $this->createProduct();

        $this->postJson('/api/v1/account/reviews', [
            'product_id' => $product->id,
            'order_item_id' => 1,
            'rating' => 5,
        ])->assertUnauthorized();
    }

    public function test_user_cannot_review_product_without_completed_order(): void
    {
        $user = User::factory()->create();
        $product = $this->createProduct();

        Sanctum::actingAs($user);

        $this->postJson('/api/v1/account/reviews', [
            'product_id' => $product->id,
            'order_item_id' => 999,
            'rating' => 5,
        ])->assertStatus(422);
    }

    public function test_user_cannot_review_pending_order_item(): void
    {
        $user = User::factory()->create();
        $product = $this->createProduct();
        $order = $this->createOrder($user, $product, OrderStatus::Pending);

        Sanctum::actingAs($user);

        $this->postJson('/api/v1/account/reviews', [
            'product_id' => $product->id,
            'order_item_id' => $order->items->first()->id,
            'rating' => 5,
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['order_item_id']);
    }

    public function test_user_can_create_pending_review_for_completed_order_item(): void
    {
        $user = User::factory()->create();
        $product = $this->createProduct();
        $order = $this->createOrder($user, $product, OrderStatus::Completed);

        Sanctum::actingAs($user);

        $this->postJson('/api/v1/account/reviews', [
            'product_id' => $product->id,
            'order_item_id' => $order->items->first()->id,
            'rating' => 5,
            'title' => 'Rất ổn',
            'content' => 'Mùi đẹp và dễ dùng.',
        ])->assertCreated()
            ->assertJsonPath('data.status', ProductReviewStatus::Pending->value)
            ->assertJsonPath('data.rating', 5);

        $this->assertDatabaseHas('product_reviews', [
            'user_id' => $user->id,
            'product_id' => $product->id,
            'order_item_id' => $order->items->first()->id,
            'status' => ProductReviewStatus::Pending->value,
        ]);
    }

    public function test_user_cannot_review_same_order_item_twice(): void
    {
        $user = User::factory()->create();
        $product = $this->createProduct();
        $order = $this->createOrder($user, $product, OrderStatus::Completed);
        $item = $order->items->first();

        ProductReview::query()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'order_id' => $order->id,
            'order_item_id' => $item->id,
            'rating' => 4,
            'status' => ProductReviewStatus::Pending->value,
        ]);

        Sanctum::actingAs($user);

        $this->postJson('/api/v1/account/reviews', [
            'product_id' => $product->id,
            'order_item_id' => $item->id,
            'rating' => 5,
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['order_item_id']);
    }

    public function test_public_reviews_only_include_approved_reviews(): void
    {
        $product = $this->createProduct();
        $user = User::factory()->create();

        ProductReview::query()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'rating' => 5,
            'title' => 'Hiển thị',
            'status' => ProductReviewStatus::Approved->value,
            'approved_at' => now(),
        ]);

        ProductReview::query()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'rating' => 1,
            'title' => 'Không hiển thị',
            'status' => ProductReviewStatus::Pending->value,
        ]);

        $this->getJson("/api/v1/products/{$product->slug}/reviews")
            ->assertOk()
            ->assertJsonCount(1, 'data.data')
            ->assertJsonPath('data.data.0.title', 'Hiển thị');
    }

    public function test_rating_summary_only_counts_approved_reviews(): void
    {
        $product = $this->createProduct();
        $user = User::factory()->create();

        ProductReview::query()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'rating' => 5,
            'status' => ProductReviewStatus::Approved->value,
            'approved_at' => now(),
        ]);

        ProductReview::query()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'rating' => 1,
            'status' => ProductReviewStatus::Rejected->value,
            'rejected_at' => now(),
        ]);

        $this->getJson("/api/v1/products/{$product->slug}/reviews/summary")
            ->assertOk()
            ->assertJsonPath('data.rating_count', 1)
            ->assertJsonPath('data.rating_average', 5);
    }

    public function test_admin_can_approve_and_reject_review(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $user = User::factory()->create();
        $product = $this->createProduct();
        $review = ProductReview::query()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'rating' => 4,
            'status' => ProductReviewStatus::Pending->value,
        ]);

        Sanctum::actingAs($admin);

        $this->patchJson("/api/v1/admin/product-reviews/{$review->id}/approve")
            ->assertOk()
            ->assertJsonPath('data.status', ProductReviewStatus::Approved->value);

        $this->assertNotNull($review->fresh()->approved_at);

        $this->patchJson("/api/v1/admin/product-reviews/{$review->id}/reject", [
            'admin_note' => 'Nội dung chưa phù hợp',
        ])->assertOk()
            ->assertJsonPath('data.status', ProductReviewStatus::Rejected->value)
            ->assertJsonPath('data.admin_note', 'Nội dung chưa phù hợp');

        $review->refresh();
        $this->assertNull($review->approved_at);
        $this->assertNotNull($review->rejected_at);
    }

    public function test_product_detail_includes_rating_summary(): void
    {
        $product = $this->createProduct();
        $user = User::factory()->create();

        ProductReview::query()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'rating' => 4,
            'status' => ProductReviewStatus::Approved->value,
            'approved_at' => now(),
        ]);

        ProductReview::query()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'rating' => 2,
            'status' => ProductReviewStatus::Pending->value,
        ]);

        $this->getJson("/api/v1/products/{$product->slug}")
            ->assertOk()
            ->assertJsonPath('data.rating_count', 1)
            ->assertJsonPath('data.rating_average', 4);
    }

    private function createOrder(User $user, Product $product, OrderStatus $status): Order
    {
        [$province, $ward] = $this->ensureGeo();

        $order = Order::query()->create([
            'user_id' => $user->id,
            'order_code' => 'MS' . now()->format('ymdHis') . random_int(100, 999),
            'customer_name' => $user->full_name,
            'customer_email' => $user->email,
            'customer_phone' => $user->phone ?: '0347101143',
            'province_code' => $province->code,
            'province_name' => $province->full_name,
            'ward_code' => $ward->code,
            'ward_name' => $ward->full_name,
            'shipping_address' => 'Số 3, Đường số 30',
            'payment_method' => PaymentMethod::Cod->value,
            'status' => $status->value,
            'subtotal' => 1200000,
            'discount_total' => 0,
            'shipping_fee' => 0,
            'total' => 1200000,
            'completed_at' => $status === OrderStatus::Completed ? now() : null,
        ]);

        OrderItem::query()->create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_name' => $product->name,
            'product_slug' => $product->slug,
            'product_sku' => $product->sku,
            'product_image' => $product->image,
            'brand_name' => null,
            'category_name' => null,
            'volume_ml' => $product->volume_ml,
            'concentration' => $product->concentration,
            'unit_price' => 1200000,
            'original_price' => 1200000,
            'quantity' => 1,
            'line_total' => 1200000,
        ]);

        return $order->fresh('items');
    }

    private function createProduct(array $overrides = []): Product
    {
        $name = $overrides['name'] ?? 'Review Test Perfume ' . Str::random(8);

        return Product::query()->create(array_merge([
            'name' => $name,
            'slug' => Str::slug($name) . '-' . Str::lower(Str::random(6)),
            'sku' => 'REVIEW-' . Str::upper(Str::random(8)),
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
