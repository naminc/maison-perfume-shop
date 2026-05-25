<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserAddressSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::where('email', 'admin@naminc.dev')->first();

        if (! $user) {
            return;
        }

        $now = now()->format('Y-m-d H:i:s');

        $addresses = [
            [
                'receiver_name' => 'Ngo Dinh Nam',
                'receiver_phone' => '0347101143',
                'province_code' => '30',
                'province_name' => 'Thành phố Hồ Chí Minh',
                'ward_code' => '00003',
                'ward_name' => 'Phường Hiệp Bình',
                'specific_address' => 'Số 3, Đường số 30, Khu phố 80',
                'address_type' => 'home',
                'is_default' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'receiver_name' => 'Ngo Dinh Nem',
                'receiver_phone' => '0336999301',
                'province_code' => '30',
                'province_name' => 'Thành phố Hồ Chí Minh',
                'ward_code' => '00003',
                'ward_name' => 'Phường Hiệp Bình',
                'specific_address' => 'Số 39, Đường số 19, Khu phố 40',
                'address_type' => 'office',
                'is_default' => false,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        foreach ($addresses as $address) {
            DB::table('user_addresses')->updateOrInsert(
                [
                    'user_id' => $user->id,
                    'receiver_phone' => $address['receiver_phone'],
                ],
                [
                    ...$address,
                    'user_id' => $user->id,
                ],
            );
        }
    }
}
