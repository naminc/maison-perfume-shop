<?php

namespace App\Services;

use App\Repositories\Interfaces\SettingRepositoryInterface;
use App\Services\Interfaces\SettingServiceInterface;

class SettingService extends BaseService implements SettingServiceInterface
{
    private const PUBLIC_DEFAULTS = [
        'store_name'       => 'Maison Perfume',
        'domain'           => null,
        'contact_email'    => 'hello@maison.vn',
        'phone'            => '0987 654 321',
        'address'          => null,
        'logo'             => null,
        'icon'             => null,
        'facebook_url'     => null,
        'instagram_url'    => null,
        'meta_title'       => 'Maison Perfume | Nước hoa chính hãng',
        'meta_description' => 'Nước hoa chính hãng, chọn lọc theo gu và phong cách sống.',
    ];

    private const MAINTENANCE_DEFAULT_MESSAGE = 'Website đang được bảo trì. Vui lòng quay lại sau.';

    private const SETTING_GROUPS = [
        'store_name'          => 'general',
        'domain'              => 'general',
        'contact_email'       => 'general',
        'phone'               => 'general',
        'address'             => 'general',
        'logo'                => 'general',
        'icon'                => 'general',
        'facebook_url'        => 'social',
        'instagram_url'       => 'social',
        'meta_title'          => 'seo',
        'meta_description'    => 'seo',
        'maintenance_enabled' => 'system',
        'maintenance_message' => 'system',
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

    public function getPublic(): array
    {
        return $this->executeSafe(function () {
            $values = $this->settingRepository->values([
                ...array_keys(self::PUBLIC_DEFAULTS),
                'maintenance_enabled',
                'maintenance_message',
            ]);

            $public = collect(self::PUBLIC_DEFAULTS)
                ->mapWithKeys(function ($default, string $key) use ($values) {
                    $value = $values[$key] ?? null;

                    return [$key => $value ?: $default];
                })
                ->all();

            return [
                ...$public,
                'maintenance' => [
                    'enabled' => $this->isTruthy($values['maintenance_enabled'] ?? null),
                    'message' => ($values['maintenance_message'] ?? null) ?: self::MAINTENANCE_DEFAULT_MESSAGE,
                ],
            ];
        }, 'getPublic');
    }

    public function getMaintenance(): array
    {
        return $this->executeSafe(function () {
            return [
                'enabled' => $this->isTruthy($this->settingRepository->findValue('maintenance_enabled')),
                'message' => $this->settingRepository->findValue('maintenance_message')
                    ?: self::MAINTENANCE_DEFAULT_MESSAGE,
            ];
        }, 'getMaintenance');
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

    private function isTruthy(?string $value): bool
    {
        return in_array($value, ['1', 'true', 'on', 'yes'], true);
    }
}
