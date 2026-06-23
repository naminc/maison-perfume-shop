<?php

namespace App\Enums;

use App\Enums\Concerns\HasEnumValues;

enum CouponType: string
{
    use HasEnumValues;

    case Fixed = 'fixed';
    case Percent = 'percent';
    case FreeShipping = 'free_shipping';
}
