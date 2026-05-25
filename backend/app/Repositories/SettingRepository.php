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

    public function updateValue(string $key, ?string $value, string $group): Setting
    {
        return $this->model->updateOrCreate(
            ['key' => $key],
            ['value' => $value, 'group' => $group],
        );
    }
}
