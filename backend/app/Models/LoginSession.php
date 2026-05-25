<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoginSession extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'ip_address',
        'user_agent',
        'device',
        'platform',
        'browser',
        'location',
        'is_current',
        'last_active_at',
        'revoked_at',
    ];

    protected $casts = [
        'is_current'     => 'boolean',
        'last_active_at' => 'datetime',
        'created_at'     => 'datetime',
        'revoked_at'     => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
