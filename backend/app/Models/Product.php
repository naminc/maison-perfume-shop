<?php

namespace App\Models;

use App\Enums\ProductGender;
use App\Enums\ProductStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'brand_id',
        'category_id',
        'name',
        'slug',
        'sku',
        'short_description',
        'description',
        'image',
        'gender',
        'concentration',
        'volume_ml',
        'price',
        'sale_price',
        'stock',
        'status',
        'is_featured',
        'sort_order',
    ];

    protected $casts = [
        'brand_id'    => 'integer',
        'category_id' => 'integer',
        'gender'      => ProductGender::class,
        'volume_ml'   => 'integer',
        'price'       => 'decimal:2',
        'sale_price'  => 'decimal:2',
        'stock'       => 'integer',
        'status'      => ProductStatus::class,
        'is_featured' => 'boolean',
        'sort_order'  => 'integer',
    ];

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', ProductStatus::Active->value);
    }
}
