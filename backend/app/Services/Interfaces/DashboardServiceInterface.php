<?php

namespace App\Services\Interfaces;

interface DashboardServiceInterface
{
    public function getStats(array $filters): array;
}
