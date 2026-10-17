<?php

namespace App\Enums;

use App\Enums\Concerns\HasEnumValues;

enum ContactStatus: string
{
    use HasEnumValues;

    case Pending = 'pending';
    case Replied = 'replied';
    case Closed = 'closed';
}
