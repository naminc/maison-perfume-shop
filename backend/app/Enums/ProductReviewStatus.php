<?php

namespace App\Enums;

use App\Enums\Concerns\HasEnumValues;

enum ProductReviewStatus: string
{
    use HasEnumValues;

    case Pending = 'pending';
    case Approved = 'approved';
    case Rejected = 'rejected';
}
