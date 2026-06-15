<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'product_name',
        'product_slug',
        'product_sku',
        'product_image',
        'brand_name',
        'category_name',
        'volume_ml',
        'concentration',
        'unit_price',
        'original_price',
        'quantity',
        'line_total',
    ];

    protected $casts = [
        'order_id'       => 'integer',
        'product_id'     => 'integer',
        'volume_ml'      => 'integer',
        'unit_price'     => 'decimal:2',
        'original_price' => 'decimal:2',
        'quantity'       => 'integer',
        'line_total'     => 'decimal:2',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class)->withTrashed();
    }

    public function review(): HasOne
    {
        return $this->hasOne(ProductReview::class);
    }
}
