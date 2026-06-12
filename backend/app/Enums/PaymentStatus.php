<?php

namespace App\Enums;

use App\Enums\Concerns\HasEnumValues;

enum PaymentStatus: string
{
    use HasEnumValues;

    case Unpaid = 'unpaid';
    case Paid = 'paid';
    case Failed = 'failed';
    case Refunded = 'refunded';
}
