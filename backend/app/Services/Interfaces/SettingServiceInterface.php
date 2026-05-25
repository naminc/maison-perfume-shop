<?php

namespace App\Services\Interfaces;

interface SettingServiceInterface
{
    public function getAllGrouped(): array;

    public function updateBulk(array $settings): array;
}
