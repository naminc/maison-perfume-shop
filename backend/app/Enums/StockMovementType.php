<?php

namespace App\Enums;

use App\Enums\Concerns\HasEnumValues;

enum StockMovementType: string
{
    use HasEnumValues;

    case Import = 'import';
    case Export = 'export';
    case Adjustment = 'adjustment';
    case Order = 'order';
    case OrderCancelled = 'order_cancelled';
}
