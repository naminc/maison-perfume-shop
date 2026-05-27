<?php

namespace App\Enums;

use App\Enums\Concerns\HasEnumValues;

enum BrandStatus: string
{
    use HasEnumValues;

    case Active = 'active';
    case Inactive = 'inactive';
}
