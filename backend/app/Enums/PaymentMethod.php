<?php

namespace App\Enums;

use App\Enums\Concerns\HasEnumValues;

enum PaymentMethod: string
{
    use HasEnumValues;

    case Cod = 'cod';
    case Bank = 'bank';
    case Card = 'card';
}
