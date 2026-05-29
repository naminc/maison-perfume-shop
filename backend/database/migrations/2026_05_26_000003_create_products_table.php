<?php

use App\Enums\ProductGender;
use App\Enums\ProductStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('brand_id')->nullable()->constrained('brands')->nullOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('sku')->nullable()->unique();
            $table->string('short_description', 500)->nullable();
            $table->text('description')->nullable();
            $table->string('image')->nullable();
            $table->enum('gender', ProductGender::values());
            $table->string('concentration')->nullable();
            $table->unsignedInteger('volume_ml')->nullable();
            $table->decimal('price', 12, 2);
            $table->decimal('sale_price', 12, 2)->nullable();
            $table->unsignedInteger('stock')->default(0);
            $table->enum('status', ProductStatus::values())->default(ProductStatus::Active->value);
            $table->boolean('is_featured')->default(false);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index('gender');
            $table->index('is_featured');
            $table->index(['brand_id', 'status']);
            $table->index(['category_id', 'status']);
            $table->index(['sort_order', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
