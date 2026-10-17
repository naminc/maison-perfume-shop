<?php

namespace App\Models;

use App\Enums\ProductGender;
use App\Enums\ProductStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
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
        'short_description',
        'description',
        'image',
        'gender',
        'status',
        'is_featured',
        'sort_order',
    ];

    protected $casts = [
        'brand_id'    => 'integer',
        'category_id' => 'integer',
        'gender'      => ProductGender::class,
        'status'      => ProductStatus::class,
        'is_featured' => 'boolean',
        'sort_order'  => 'integer',
    ];

    protected $appends = [
        'min_price',
        'min_sale_price',
        'total_stock',
    ];

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ProductReview::class);
    }

    public function approvedReviews(): HasMany
    {
        return $this->reviews()->approved();
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class)->orderBy('sort_order')->orderBy('id');
    }

    public function activeVariants(): HasMany
    {
        return $this->variants()->active();
    }

    public function defaultVariant(): HasOne
    {
        return $this->hasOne(ProductVariant::class)->orderByDesc('is_default')->orderBy('sort_order')->orderBy('id');
    }

    public function getMinPriceAttribute(): ?string
    {
        $prices = $this->variantCollection()
            ->map(fn (ProductVariant $variant) => (float) ($variant->sale_price ?? $variant->price));

        return $prices->isEmpty() ? null : number_format((float) $prices->min(), 2, '.', '');
    }

    public function getMinSalePriceAttribute(): ?string
    {
        $salePrices = $this->variantCollection()
            ->whereNotNull('sale_price')
            ->pluck('sale_price');

        return $salePrices->isEmpty() ? null : number_format((float) $salePrices->min(), 2, '.', '');
    }

    public function getTotalStockAttribute(): int
    {
        return (int) $this->variantCollection()->sum('stock');
    }

    // Read-only compatibility accessors while callers migrate to explicit variants.
    public function getSkuAttribute(): ?string { return $this->resolvedDefaultVariant()?->sku; }
    public function getConcentrationAttribute(): ?string { return $this->resolvedDefaultVariant()?->concentration; }
    public function getVolumeMlAttribute(): ?int { return $this->resolvedDefaultVariant()?->volume_ml; }
    public function getPriceAttribute(): ?string { return $this->resolvedDefaultVariant()?->price; }
    public function getSalePriceAttribute(): ?string { return $this->resolvedDefaultVariant()?->sale_price; }
    public function getStockAttribute(): int { return (int) ($this->resolvedDefaultVariant()?->stock ?? 0); }

    public function purchaseOrderItems(): HasMany
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', ProductStatus::Active->value);
    }

    private function variantCollection()
    {
        return $this->relationLoaded('variants') ? $this->variants : $this->variants()->get();
    }

    private function resolvedDefaultVariant(): ?ProductVariant
    {
        if ($this->relationLoaded('defaultVariant')) {
            return $this->defaultVariant;
        }

        if ($this->relationLoaded('variants')) {
            return $this->variants->firstWhere('is_default', true) ?? $this->variants->first();
        }

        return $this->defaultVariant()->first();
    }
}
