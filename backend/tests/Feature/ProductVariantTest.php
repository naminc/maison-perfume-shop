<?php

namespace Tests\Feature;

use App\Enums\ProductGender;
use App\Enums\ProductStatus;
use App\Enums\UserRole;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProductVariantTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_product_with_variants_and_first_variant_becomes_default(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => UserRole::Admin->value]));

        $response = $this->postJson('/api/v1/admin/products', $this->payload())
            ->assertCreated()
            ->assertJsonCount(2, 'data.variants')
            ->assertJsonPath('data.total_stock', 15)
            ->assertJsonPath('data.min_price', '850000.00');

        $product = Product::query()->findOrFail($response->json('data.id'));
        $this->assertCount(2, $product->variants);
        $this->assertSame('VARIANT-50', $product->defaultVariant->sku);
        $this->assertTrue($product->defaultVariant->is_default);
    }

    public function test_variant_sku_must_be_unique(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => UserRole::Admin->value]));
        ProductVariant::query()->create([
            'product_id' => $this->product()->id,
            'sku' => 'VARIANT-50',
            'price' => 100000,
            'stock' => 1,
            'status' => 'active',
        ]);

        $this->postJson('/api/v1/admin/products', $this->payload())
            ->assertStatus(422)
            ->assertJsonValidationErrors(['variants.0.sku']);
    }

    public function test_variant_sale_price_cannot_exceed_price(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => UserRole::Admin->value]));
        $payload = $this->payload();
        $payload['variants'][0]['sale_price'] = 950000;
        $payload['variants'][0]['price'] = 900000;

        $this->postJson('/api/v1/admin/products', $payload)
            ->assertStatus(422)
            ->assertJsonValidationErrors(['variants.0.sale_price']);
    }

    public function test_existing_variant_stock_cannot_be_changed_through_product_update(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => UserRole::Admin->value]));
        $product = $this->product();
        $variant = $product->variants()->create([
            'sku' => 'LOCKED-STOCK',
            'price' => 1000000,
            'stock' => 8,
            'status' => 'active',
            'is_default' => true,
            'sort_order' => 1,
        ]);

        $payload = $this->payload();
        $payload['name'] = $product->name;
        $payload['slug'] = $product->slug;
        $payload['variants'] = [[
            'id' => $variant->id,
            'sku' => $variant->sku,
            'price' => 1000000,
            'stock' => 99,
            'status' => 'active',
            'is_default' => true,
        ]];

        $this->putJson("/api/v1/admin/products/{$product->id}", $payload)
            ->assertStatus(422)
            ->assertJsonValidationErrors(['variants.0.stock']);

        $this->assertSame(8, $variant->fresh()->stock);
    }

    public function test_public_product_only_exposes_active_variants(): void
    {
        $product = $this->product();
        $product->variants()->createMany([
            ['sku' => 'PUBLIC-A', 'price' => 1000000, 'stock' => 5, 'status' => 'active', 'is_default' => true, 'sort_order' => 1],
            ['sku' => 'PUBLIC-B', 'price' => 1500000, 'stock' => 3, 'status' => 'inactive', 'is_default' => false, 'sort_order' => 2],
        ]);

        $this->getJson("/api/v1/products/{$product->slug}")
            ->assertOk()
            ->assertJsonCount(1, 'data.variants')
            ->assertJsonPath('data.variants.0.sku', 'PUBLIC-A');
    }

    public function test_new_variant_can_receive_initial_stock_during_product_update(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => UserRole::Admin->value]));
        $product = $this->product();
        $existing = $product->variants()->create([
            'sku' => 'EXISTING-50', 'price' => 800000, 'stock' => 4,
            'status' => 'active', 'is_default' => true, 'sort_order' => 1,
        ]);
        $payload = $this->payload();
        $payload['name'] = $product->name;
        $payload['slug'] = $product->slug;
        $payload['variants'] = [
            ['id' => $existing->id, 'sku' => $existing->sku, 'price' => 800000, 'status' => 'active', 'is_default' => true],
            ['sku' => 'NEW-100', 'name' => '100ml', 'price' => 1400000, 'stock' => 7, 'status' => 'active'],
        ];

        $this->putJson("/api/v1/admin/products/{$product->id}", $payload)->assertOk();

        $this->assertDatabaseHas('product_variants', [
            'product_id' => $product->id, 'sku' => 'NEW-100', 'stock' => 7,
        ]);
    }

    public function test_public_list_returns_aggregates_and_can_search_and_sort_by_variant_price(): void
    {
        $expensive = $this->product();
        $expensive->variants()->create([
            'sku' => 'SEARCH-ME-100', 'price' => 2000000, 'sale_price' => 1800000,
            'stock' => 2, 'status' => 'active', 'is_default' => true, 'sort_order' => 1,
        ]);
        $cheap = $this->product();
        $cheap->variants()->create([
            'sku' => 'CHEAP-50', 'price' => 600000, 'stock' => 3,
            'status' => 'active', 'is_default' => true, 'sort_order' => 1,
        ]);

        $this->getJson('/api/v1/products?search=SEARCH-ME-100')
            ->assertOk()
            ->assertJsonCount(1, 'data.data')
            ->assertJsonPath('data.data.0.id', $expensive->id)
            ->assertJsonPath('data.data.0.min_price', '1800000.00')
            ->assertJsonPath('data.data.0.total_stock', 2);

        $this->getJson('/api/v1/products?sort=price-asc')
            ->assertOk()
            ->assertJsonPath('data.data.0.id', $cheap->id);
    }

    private function payload(): array
    {
        return [
            'name' => 'Variant Perfume',
            'slug' => 'variant-perfume',
            'gender' => ProductGender::Unisex->value,
            'status' => ProductStatus::Active->value,
            'is_featured' => false,
            'variants' => [
                ['sku' => 'VARIANT-50', 'name' => '50ml', 'volume_ml' => 50, 'price' => 900000, 'sale_price' => 850000, 'stock' => 10, 'status' => 'active'],
                ['sku' => 'VARIANT-100', 'name' => '100ml', 'volume_ml' => 100, 'price' => 1500000, 'stock' => 5, 'status' => 'active'],
            ],
        ];
    }

    private function product(): Product
    {
        return Product::query()->create([
            'name' => 'Base Product',
            'slug' => 'base-product-'.uniqid(),
            'gender' => ProductGender::Unisex->value,
            'status' => ProductStatus::Active->value,
            'sort_order' => 1,
        ]);
    }
}
