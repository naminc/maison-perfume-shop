<?php

namespace App\Repositories;

use App\Models\Setting;
use App\Repositories\Interfaces\SettingRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class SettingRepository implements SettingRepositoryInterface
{
    public function __construct(protected Setting $model) {}

    public function all(): Collection
    {
        return $this->model
            ->newQuery()
            ->orderBy('group')
            ->orderBy('key')
            ->get();
    }

    public function values(array $keys): array
    {
        return $this->model
            ->newQuery()
            ->whereIn('key', $keys)
            ->pluck('value', 'key')
            ->all();
    }

    public function findValue(string $key): ?string
    {
        return $this->model
            ->newQuery()
            ->where('key', $key)
            ->value('value');
    }

    public function updateValue(string $key, ?string $value, string $group): Setting
    {
        return $this->model->updateOrCreate(
            ['key' => $key],
            ['value' => $value, 'group' => $group],
        );
    }
}
