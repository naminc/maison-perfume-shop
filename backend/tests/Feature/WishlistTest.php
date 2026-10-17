<?php

namespace Tests\Feature;

use App\Enums\ProductGender;
use App\Enums\ProductStatus;
use App\Models\Product;
use App\Models\User;
use App\Models\Wishlist;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class WishlistTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_wishlist(): void
    {
        $this->getJson('/api/v1/account/wishlist')->assertUnauthorized();
        $this->postJson('/api/v1/account/wishlist/toggle', ['product_id' => 1])->assertUnauthorized();
    }

    public function test_user_can_toggle_product_in_and_out_of_wishlist(): void
    {
        $user = User::factory()->create();
        $product = $this->createProduct();

        Sanctum::actingAs($user);

        $this->postJson('/api/v1/account/wishlist/toggle', ['product_id' => $product->id])
            ->assertOk()
            ->assertJsonPath('data.in_wishlist', true);

        $this->assertDatabaseHas('wishlists', [
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);

        $this->postJson('/api/v1/account/wishlist/toggle', ['product_id' => $product->id])
            ->assertOk()
            ->assertJsonPath('data.in_wishlist', false);

        $this->assertDatabaseMissing('wishlists', [
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);
    }

    public function test_wishlist_has_no_duplicates(): void
    {
        $user = User::factory()->create();
        $product = $this->createProduct();

        Wishlist::query()->create(['user_id' => $user->id, 'product_id' => $product->id]);

        Sanctum::actingAs($user);

        // Toggle khi đã tồn tại → xoá, không tạo bản ghi trùng
        $this->postJson('/api/v1/account/wishlist/toggle', ['product_id' => $product->id])
            ->assertOk()
            ->assertJsonPath('data.in_wishlist', false);

        $this->assertSame(0, Wishlist::query()->count());
    }

    public function test_inactive_or_missing_product_cannot_be_added(): void
    {
        $user = User::factory()->create();
        $inactive = $this->createProduct(['status' => ProductStatus::Inactive->value]);

        Sanctum::actingAs($user);

        $this->postJson('/api/v1/account/wishlist/toggle', ['product_id' => $inactive->id])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['product_id']);

        $this->postJson('/api/v1/account/wishlist/toggle', ['product_id' => 999999])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['product_id']);
    }

    public function test_user_only_sees_own_wishlist_with_full_product_payload(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $mine = $this->createProduct(['name' => 'My Perfume']);
        $theirs = $this->createProduct(['name' => 'Their Perfume']);

        Wishlist::query()->create(['user_id' => $user->id, 'product_id' => $mine->id]);
        Wishlist::query()->create(['user_id' => $otherUser->id, 'product_id' => $theirs->id]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/account/wishlist')->assertOk();

        $products = $response->json('data');
        $this->assertCount(1, $products);
        $this->assertSame($mine->id, $products[0]['id']);
        $this->assertArrayHasKey('brand', $products[0]);
        $this->assertArrayHasKey('rating_count', $products[0]);
        $this->assertArrayHasKey('slug', $products[0]);
    }

    public function test_hidden_products_are_excluded_from_wishlist_response(): void
    {
        $user = User::factory()->create();
        $active = $this->createProduct();
        $hidden = $this->createProduct(['status' => ProductStatus::Inactive->value]);

        Wishlist::query()->create(['user_id' => $user->id, 'product_id' => $active->id]);
        Wishlist::query()->create(['user_id' => $user->id, 'product_id' => $hidden->id]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/account/wishlist')->assertOk();

        $ids = array_column($response->json('data'), 'id');
        $this->assertSame([$active->id], $ids);
    }

    public function test_user_can_remove_product_from_wishlist(): void
    {
        $user = User::factory()->create();
        $product = $this->createProduct();

        Wishlist::query()->create(['user_id' => $user->id, 'product_id' => $product->id]);

        Sanctum::actingAs($user);

        $this->deleteJson("/api/v1/account/wishlist/{$product->id}")->assertOk();

        $this->assertDatabaseMissing('wishlists', [
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);

        $this->deleteJson("/api/v1/account/wishlist/{$product->id}")->assertNotFound();
    }

    private function createProduct(array $overrides = []): Product
    {
        $name = $overrides['name'] ?? 'Test Perfume ' . Str::random(8);

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
