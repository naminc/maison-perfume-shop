<?php

namespace App\Services;

use App\Repositories\Interfaces\SettingRepositoryInterface;
use App\Services\Interfaces\SettingServiceInterface;

class SettingService extends BaseService implements SettingServiceInterface
{
    private const SETTING_GROUPS = [
        'store_name'       => 'general',
        'domain'           => 'general',
        'contact_email'    => 'general',
        'phone'            => 'general',
        'address'          => 'general',
        'logo'             => 'general',
        'icon'             => 'general',
        'facebook_url'     => 'social',
        'instagram_url'    => 'social',
        'meta_title'       => 'seo',
        'meta_description' => 'seo',
    ];

    public function __construct(
        protected SettingRepositoryInterface $settingRepository,
    ) {}

    public function getAllGrouped(): array
    {
        return $this->executeSafe(function () {
            return $this->formatGroupedSettings();
        }, 'getAllGrouped');
    }

    public function updateBulk(array $settings): array
    {
        return $this->executeTransaction(function () use ($settings) {
            foreach ($settings as $key => $value) {
                if (! array_key_exists($key, self::SETTING_GROUPS)) {
                    continue;
                }

                $this->settingRepository->updateValue(
                    $key,
                    $this->normalizeValue($value),
                    self::SETTING_GROUPS[$key],
                );
            }

            return $this->formatGroupedSettings();
        }, 'updateBulk');
    }

    private function formatGroupedSettings(): array
    {
        return $this->settingRepository
            ->all()
            ->groupBy('group')
            ->map(fn ($items) => $items->pluck('value', 'key')->all())
            ->all();
    }

    private function normalizeValue(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $value = is_string($value) ? trim($value) : (string) $value;

        return $value === '' ? null : $value;
    }
}
