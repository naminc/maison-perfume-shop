<?php

namespace Database\Seeders;

use App\Enums\SupplierStatus;
use App\Models\Supplier;
use Illuminate\Database\Seeder;

class SupplierSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            ['code' => 'SUP0001', 'name' => 'Maison Distribution', 'contact_name' => 'Nguyễn Minh Anh', 'phone' => '0901234567', 'email' => 'sales@maison-distribution.test'],
            ['code' => 'SUP0002', 'name' => 'Luxury Fragrance Việt Nam', 'contact_name' => 'Trần Hoàng Nam', 'phone' => '0902345678', 'email' => 'contact@luxury-fragrance.test'],
            ['code' => 'SUP0003', 'name' => 'Premium Scent Trading', 'contact_name' => 'Lê Thu Hà', 'phone' => '0903456789', 'email' => 'orders@premium-scent.test'],
        ] as $supplier) {
            Supplier::query()->updateOrCreate(['code' => $supplier['code']], $supplier + ['status' => SupplierStatus::Active->value]);
        }
    }
}
