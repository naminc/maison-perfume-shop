<?php

namespace App\Enums;

use App\Enums\Concerns\HasEnumValues;

enum UserStatus: string
{
    use HasEnumValues;

    case Active   = 'active';
    case Inactive = 'inactive';
    case Banned   = 'banned';
}
