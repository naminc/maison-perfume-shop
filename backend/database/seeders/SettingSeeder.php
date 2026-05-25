<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            'store_name' => [
                'value' => 'Maison Perfume',
                'group' => 'general',
            ],
            'domain' => [
                'value' => config('app.url'),
                'group' => 'general',
            ],
            'contact_email' => [
                'value' => 'support@maison-perfume.test',
                'group' => 'general',
            ],
            'phone' => [
                'value' => '0347101143',
                'group' => 'general',
            ],
            'address' => [
                'value' => 'Ho Chi Minh City, Vietnam',
                'group' => 'general',
            ],
            'logo' => [
                'value' => null,
                'group' => 'general',
            ],
            'icon' => [
                'value' => null,
                'group' => 'general',
            ],
            'facebook_url' => [
                'value' => 'https://www.facebook.com/maisonperfume',
                'group' => 'social',
            ],
            'instagram_url' => [
                'value' => 'https://www.instagram.com/maisonperfume',
                'group' => 'social',
            ],
            'meta_title' => [
                'value' => 'Maison Perfume',
                'group' => 'seo',
            ],
            'meta_description' => [
                'value' => 'Maison Perfume - nuoc hoa chinh hang, tinh te va sang trong.',
                'group' => 'seo',
            ],
        ];

        foreach ($settings as $key => $setting) {
            Setting::updateOrCreate(
                ['key' => $key],
                $setting,
            );
        }
    }
}
