<?php

namespace App\Enums;

use App\Enums\Concerns\HasEnumValues;

enum PostStatus: string
{
    use HasEnumValues;

    case Draft = 'draft';
    case Published = 'published';
}
