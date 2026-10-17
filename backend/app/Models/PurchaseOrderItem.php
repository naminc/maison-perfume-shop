<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseOrderItem extends Model
{
    use HasFactory;

    protected $fillable = ['purchase_order_id', 'product_id', 'product_variant_id', 'product_name', 'variant_name', 'sku', 'concentration', 'volume_ml', 'quantity', 'unit_cost', 'line_total'];

    protected $casts = ['purchase_order_id' => 'integer', 'product_id' => 'integer', 'product_variant_id' => 'integer', 'volume_ml' => 'integer', 'quantity' => 'integer', 'unit_cost' => 'decimal:2', 'line_total' => 'decimal:2'];

    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class)->withTrashed();
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id')->withTrashed();
    }
}
