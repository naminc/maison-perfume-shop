<?php

namespace App\Enums;

use App\Enums\Concerns\HasEnumValues;

enum ProductGender: string
{
    use HasEnumValues;

    case Male = 'male';
    case Female = 'female';
    case Unisex = 'unisex';
}
