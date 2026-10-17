<?php

namespace App\Models;

use App\Enums\ProductVariantStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductVariant extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['product_id', 'sku', 'name', 'concentration', 'volume_ml', 'price', 'sale_price', 'stock', 'status', 'is_default', 'sort_order'];

    protected $casts = [
        'product_id' => 'integer', 'volume_ml' => 'integer', 'price' => 'decimal:2', 'sale_price' => 'decimal:2',
        'stock' => 'integer', 'status' => ProductVariantStatus::class, 'is_default' => 'boolean', 'sort_order' => 'integer',
    ];

    public function product(): BelongsTo { return $this->belongsTo(Product::class)->withTrashed(); }
    public function orderItems(): HasMany { return $this->hasMany(OrderItem::class); }
    public function purchaseOrderItems(): HasMany { return $this->hasMany(PurchaseOrderItem::class); }
    public function stockMovements(): HasMany { return $this->hasMany(StockMovement::class); }
    public function scopeActive(Builder $query): Builder { return $query->where('status', ProductVariantStatus::Active->value); }
}
