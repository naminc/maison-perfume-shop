<?php

namespace Database\Seeders;

use App\Enums\BrandStatus;
use App\Models\Brand;
use Illuminate\Database\Seeder;

class BrandSeeder extends Seeder
{
    public function run(): void
    {
        $brands = [
            [
                'name' => 'Dior',
                'slug' => 'dior',
                'description' => 'Thương hiệu nước hoa Pháp thanh lịch và hiện đại.',
                'website' => 'https://www.dior.com',
                'sort_order' => 1,
            ],
            [
                'name' => 'Chanel',
                'slug' => 'chanel',
                'description' => 'Biểu tượng mùi hương cổ điển, sang trọng và tinh tế.',
                'website' => 'https://www.chanel.com',
                'sort_order' => 2,
            ],
            [
                'name' => 'Tom Ford',
                'slug' => 'tom-ford',
                'description' => 'Mùi hương gợi cảm, cá tính và đậm chất sâu.',
                'website' => 'https://www.tomford.com',
                'sort_order' => 3,
            ],
            [
                'name' => 'Yves Saint Laurent',
                'slug' => 'ysl',
                'description' => 'Tinh thần tự do và thời trang trong từng mùi hương.',
                'website' => 'https://www.yslbeauty.com',
                'sort_order' => 4,
            ],
            [
                'name' => 'Versace',
                'slug' => 'versace',
                'description' => 'Phong cách trẻ trung, gợi cảm và đầy năng lượng, lấy cảm hứng Địa Trung Hải.',
                'website' => 'https://www.versace.com',
                'sort_order' => 5,
            ],
            [
                'name' => 'Maison Margiela',
                'slug' => 'maison-margiela',
                'description' => 'Dòng Replica với những ký ức mùi hương thân thuộc và gần gũi.',
                'website' => 'https://www.maisonmargiela-fragrances.us',
                'sort_order' => 6,
            ],
            [
                'name' => 'Victoria Secret',
                'slug' => 'victoria-secret',
                'description' => 'Body mist và mùi hương nữ tính, tươi sáng sử dụng hằng ngày.',
                'website' => 'https://www.victoriassecret.com',
                'sort_order' => 7,
            ],
        ];

        foreach ($brands as $brand) {
            Brand::updateOrCreate(
                ['slug' => $brand['slug']],
                [
                    ...$brand,
                    'logo' => null,
                    'status' => BrandStatus::Active->value,
                ],
            );
        }
    }
}
