<?php

namespace App\Repositories\Interfaces;

use App\Models\Setting;
use Illuminate\Database\Eloquent\Collection;

interface SettingRepositoryInterface
{
    public function all(): Collection;
    public function values(array $keys): array;
    public function findValue(string $key): ?string;
    public function updateValue(string $key, ?string $value, string $group): Setting;
}
