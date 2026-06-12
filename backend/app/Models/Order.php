<?php

namespace App\Models;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'order_code',
        'customer_name',
        'customer_email',
        'customer_phone',
        'province_code',
        'province_name',
        'ward_code',
        'ward_name',
        'shipping_address',
        'note',
        'payment_method',
        'payment_status',
        'status',
        'subtotal',
        'discount_total',
        'shipping_fee',
        'total',
        'coupon_code',
        'cancelled_at',
        'completed_at',
    ];

    protected $casts = [
        'user_id'        => 'integer',
        'payment_method' => PaymentMethod::class,
        'payment_status' => PaymentStatus::class,
        'status'         => OrderStatus::class,
        'subtotal'       => 'decimal:2',
        'discount_total' => 'decimal:2',
        'shipping_fee'   => 'decimal:2',
        'total'          => 'decimal:2',
        'cancelled_at'   => 'datetime',
        'completed_at'   => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function province(): BelongsTo
    {
        return $this->belongsTo(Province::class, 'province_code', 'code');
    }

    public function ward(): BelongsTo
    {
        return $this->belongsTo(Ward::class, 'ward_code', 'code');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function getWardNameAttribute($value): ?string
    {
        $wardName = is_string($value) ? trim($value) : $value;

        if (! is_string($wardName) || $wardName === '') {
            return $value;
        }

        $wardName = $this->stripProvinceFromWardName($wardName);

        if ($this->hasWardTypePrefix($wardName)) {
            return $wardName;
        }

        $ward = $this->relationLoaded('ward')
            ? $this->getRelation('ward')
            : ($this->ward_code ? Ward::query()->find($this->ward_code) : null);

        if ($ward) {
            return $this->stripProvinceFromWardName($ward->full_name ?: $ward->name);
        }

        return $wardName;
    }

    private function stripProvinceFromWardName(string $wardName): string
    {
        $provinceName = trim((string) ($this->province_name ?? ''));
        $suffix = ", {$provinceName}";

        if ($provinceName !== '' && str_ends_with($wardName, $suffix)) {
            return trim(substr($wardName, 0, -strlen($suffix)));
        }

        return $wardName;
    }

    private function hasWardTypePrefix(string $wardName): bool
    {
        return preg_match('/^(Phường|Xã|Thị trấn)\s+/u', $wardName) === 1;
    }
}
