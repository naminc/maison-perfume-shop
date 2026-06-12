<?php

namespace App\Enums;

use App\Enums\Concerns\HasEnumValues;

enum OrderStatus: string
{
    use HasEnumValues;

    case Pending = 'pending';
    case Confirmed = 'confirmed';
    case Processing = 'processing';
    case Shipping = 'shipping';
    case Completed = 'completed';
    case Cancelled = 'cancelled';
}
