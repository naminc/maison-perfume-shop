<?php

namespace Database\Seeders;

use App\Enums\CategoryStatus;
use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Nước hoa nam',
                'slug' => 'nuoc-hoa-nam',
                'description' => 'Các mùi hương lịch lãm, mạnh mẽ và hiện đại cho nam.',
                'sort_order' => 1,
            ],
            [
                'name' => 'Nước hoa nữ',
                'slug' => 'nuoc-hoa-nu',
                'description' => 'Các mùi hương tinh tế, quyến rũ và nữ tính.',
                'sort_order' => 2,
            ],
            [
                'name' => 'Nước hoa unisex',
                'slug' => 'nuoc-hoa-unisex',
                'description' => 'Các mùi hương trung tính, hiện đại và linh hoạt.',
                'sort_order' => 3,
            ],
            [
                'name' => 'Nước hoa niche',
                'slug' => 'nuoc-hoa-niche',
                'description' => 'Những mùi hương độc đáo dành cho gu cá nhân rõ nét.',
                'sort_order' => 4,
            ],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['slug' => $category['slug']],
                [
                    ...$category,
                    'parent_id' => null,
                    'status' => CategoryStatus::Active->value,
                ],
            );
        }
    }
}
