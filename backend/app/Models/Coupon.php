<?php

namespace App\Models;

use App\Enums\CouponStatus;
use App\Enums\CouponType;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Coupon extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'description',
        'type',
        'value',
        'min_order_amount',
        'max_discount_amount',
        'usage_limit',
        'used_count',
        'per_user_limit',
        'starts_at',
        'expires_at',
        'status',
    ];

    protected $casts = [
        'type'                => CouponType::class,
        'value'               => 'decimal:2',
        'min_order_amount'    => 'decimal:2',
        'max_discount_amount' => 'decimal:2',
        'usage_limit'         => 'integer',
        'used_count'          => 'integer',
        'per_user_limit'      => 'integer',
        'starts_at'           => 'datetime',
        'expires_at'          => 'datetime',
        'status'              => CouponStatus::class,
    ];

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', CouponStatus::Active->value);
    }

    public function isStarted(): bool
    {
        return $this->starts_at === null || $this->starts_at->lte(now());
    }

    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->lt(now());
    }

    public function hasUsageLeft(): bool
    {
        return $this->usage_limit === null || $this->used_count < $this->usage_limit;
    }

    public function isActiveNow(): bool
    {
        return $this->status === CouponStatus::Active
            && $this->isStarted()
            && ! $this->isExpired()
            && $this->hasUsageLeft();
    }
}
