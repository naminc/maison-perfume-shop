<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();
            $table->string('product_name');
            $table->string('product_slug')->nullable();
            $table->string('product_sku')->nullable();
            $table->string('product_image')->nullable();
            $table->string('brand_name')->nullable();
            $table->string('category_name')->nullable();
            $table->unsignedInteger('volume_ml')->nullable();
            $table->string('concentration')->nullable();
            $table->decimal('unit_price', 12, 2);
            $table->decimal('original_price', 12, 2);
            $table->unsignedInteger('quantity');
            $table->decimal('line_total', 12, 2);
            $table->timestamps();

            $table->index('order_id');
            $table->index('product_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
