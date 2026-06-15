<?php

namespace App\Models;

use App\Enums\ProductReviewStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductReview extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'product_id',
        'order_id',
        'order_item_id',
        'rating',
        'title',
        'content',
        'status',
        'admin_note',
        'approved_at',
        'rejected_at',
    ];

    protected $casts = [
        'user_id'       => 'integer',
        'product_id'    => 'integer',
        'order_id'      => 'integer',
        'order_item_id' => 'integer',
        'rating'        => 'integer',
        'status'        => ProductReviewStatus::class,
        'approved_at'   => 'datetime',
        'rejected_at'   => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class)->withTrashed();
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class)->withTrashed();
    }

    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }

    public function scopeApproved(Builder $query): Builder
    {
        return $query->where('status', ProductReviewStatus::Approved->value);
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', ProductReviewStatus::Pending->value);
    }

    public function scopeForProduct(Builder $query, int $productId): Builder
    {
        return $query->where('product_id', $productId);
    }
}
