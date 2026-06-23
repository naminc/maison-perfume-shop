<?php

namespace Database\Seeders;

use App\Enums\CouponStatus;
use App\Enums\CouponType;
use App\Models\Coupon;
use Illuminate\Database\Seeder;

class CouponSeeder extends Seeder
{
    public function run(): void
    {
        $coupons = [
            [
                'code' => 'WELCOME10',
                'name' => 'Giảm 10% cho đơn đầu',
                'description' => 'Giảm 10% tối đa 150.000 đ cho đơn từ 800.000 đ.',
                'type' => CouponType::Percent->value,
                'value' => 10,
                'min_order_amount' => 800000,
                'max_discount_amount' => 150000,
                'usage_limit' => 500,
                'per_user_limit' => 1,
                'starts_at' => null,
                'expires_at' => null,
                'status' => CouponStatus::Active->value,
            ],
            [
                'code' => 'MAISON100K',
                'name' => 'Giảm 100.000 đ',
                'description' => 'Giảm trực tiếp 100.000 đ cho đơn từ 1.500.000 đ.',
                'type' => CouponType::Fixed->value,
                'value' => 100000,
                'min_order_amount' => 1500000,
                'max_discount_amount' => null,
                'usage_limit' => 300,
                'per_user_limit' => 2,
                'starts_at' => null,
                'expires_at' => null,
                'status' => CouponStatus::Active->value,
            ],
            [
                'code' => 'FREESHIP',
                'name' => 'Miễn phí vận chuyển',
                'description' => 'Miễn phí vận chuyển tiêu chuẩn cho đơn từ 300.000 đ.',
                'type' => CouponType::FreeShipping->value,
                'value' => null,
                'min_order_amount' => 300000,
                'max_discount_amount' => null,
                'usage_limit' => null,
                'per_user_limit' => null,
                'starts_at' => null,
                'expires_at' => null,
                'status' => CouponStatus::Active->value,
            ],
        ];

        foreach ($coupons as $coupon) {
            Coupon::query()->updateOrCreate(
                ['code' => $coupon['code']],
                $coupon,
            );
        }
    }
}
