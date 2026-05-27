<?php

namespace App\Enums\Concerns;

trait HasEnumValues
{
    abstract public static function cases(): array;

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
