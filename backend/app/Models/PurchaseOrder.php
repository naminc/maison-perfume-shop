<?php

namespace App\Models;

use App\Enums\PurchaseOrderStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PurchaseOrder extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['supplier_id', 'created_by', 'received_by', 'code', 'status', 'ordered_at', 'received_at', 'subtotal', 'discount', 'shipping_fee', 'total', 'reference', 'note'];

    protected $casts = [
        'supplier_id' => 'integer', 'created_by' => 'integer', 'received_by' => 'integer',
        'status' => PurchaseOrderStatus::class, 'ordered_at' => 'datetime', 'received_at' => 'datetime',
        'subtotal' => 'decimal:2', 'discount' => 'decimal:2', 'shipping_fee' => 'decimal:2', 'total' => 'decimal:2',
    ];

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class)->withTrashed();
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }
}
