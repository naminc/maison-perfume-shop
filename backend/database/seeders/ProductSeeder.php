<?php

namespace Database\Seeders;

use App\Enums\ProductGender;
use App\Enums\ProductStatus;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $brands = Brand::query()->pluck('id', 'slug');
        $categories = Category::query()->pluck('id', 'slug');

        $products = [
            [
                'brand_slug' => 'dior',
                'category_slug' => 'nuoc-hoa-nam',
                'name' => 'Dior Sauvage Eau de Parfum',
                'slug' => 'dior-sauvage-eau-de-parfum',
                'sku' => 'DIOR-SAUVAGE-EDP-100',
                'short_description' => 'Hương cam bergamot tươi sáng kết hợp ambroxan ấm áp, nam tính.',
                'description' => 'Dior Sauvage EDP mang sắc thái tươi mát, cay nhẹ và gỗ ấm, phù hợp dùng hằng ngày lẫn những dịp trang trọng.',
                'image' => 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=80',
                'gender' => ProductGender::Male->value,
                'concentration' => 'EDP',
                'volume_ml' => 100,
                'price' => 3290000,
                'sale_price' => 2890000,
                'stock' => 18,
                'is_featured' => true,
                'sort_order' => 1,
            ],
            [
                'brand_slug' => 'chanel',
                'category_slug' => 'nuoc-hoa-nam',
                'name' => 'Chanel Bleu de Chanel Eau de Parfum',
                'slug' => 'chanel-bleu-de-chanel-eau-de-parfum',
                'sku' => 'CHANEL-BLEU-EDP-100',
                'short_description' => 'Mùi hương gỗ thơm, thanh lich, sạch sẽ và rất dễ dùng.',
                'description' => 'Bleu de Chanel EDP là lựa chọn an toàn cho phong cách công sở, hẹn hò và những ngày cần sự chín chắn.',
                'image' => 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=900&q=80',
                'gender' => ProductGender::Male->value,
                'concentration' => 'EDP',
                'volume_ml' => 100,
                'price' => 3890000,
                'sale_price' => 3390000,
                'stock' => 12,
                'is_featured' => true,
                'sort_order' => 2,
            ],
            [
                'brand_slug' => 'tom-ford',
                'category_slug' => 'nuoc-hoa-unisex',
                'name' => 'Tom Ford Oud Wood',
                'slug' => 'tom-ford-oud-wood',
                'sku' => 'TF-OUD-WOOD-50',
                'short_description' => 'Trầm hương mêm mại, cay ấm và sang trọng.',
                'description' => 'Oud Wood là mùi hương unisex cao cấp với tông gỗ, gia vị và vanilla nhẹ, tạo cảm giác bí ẩn nhưng vẫn dễ tiếp cận.',
                'image' => 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=900&q=80',
                'gender' => ProductGender::Unisex->value,
                'concentration' => 'EDP',
                'volume_ml' => 50,
                'price' => 5200000,
                'sale_price' => null,
                'stock' => 8,
                'is_featured' => true,
                'sort_order' => 3,
            ],
            [
                'brand_slug' => 'ysl',
                'category_slug' => 'nuoc-hoa-nu',
                'name' => 'Yves Saint Laurent Libre Eau de Parfum',
                'slug' => 'ysl-libre-eau-de-parfum',
                'sku' => 'YSL-LIBRE-EDP-90',
                'short_description' => 'Hoa cam và lavender tạo nên cảm giác tự do, hiện đại.',
                'description' => 'Libre EDP cân bằng giữa sự nữ tính và phóng khoáng, phù hợp với những ai thích mùi hương sáng và có dấu ấn.',
                'image' => 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=900&q=80',
                'gender' => ProductGender::Female->value,
                'concentration' => 'EDP',
                'volume_ml' => 90,
                'price' => 3450000,
                'sale_price' => 3090000,
                'stock' => 20,
                'is_featured' => true,
                'sort_order' => 4,
            ],
            [
                'brand_slug' => 'dior',
                'category_slug' => 'nuoc-hoa-nu',
                'name' => 'Dior J adore Eau de Parfum',
                'slug' => 'dior-jadore-eau-de-parfum',
                'sku' => 'DIOR-JADORE-EDP-100',
                'short_description' => 'Bộ hoa trắng thanh tao, mềm mại và nữ tính.',
                'description' => 'J adore EDP là mùi hương hoa cổ điển của Dior, hợp với phong cách thanh lịch và trang nhã.',
                'image' => 'https://images.unsplash.com/photo-1588482587611-692b19ee797b?auto=format&fit=crop&w=900&q=80',
                'gender' => ProductGender::Female->value,
                'concentration' => 'EDP',
                'volume_ml' => 100,
                'price' => 3990000,
                'sale_price' => 3490000,
                'stock' => 15,
                'is_featured' => false,
                'sort_order' => 5,
            ],
            [
                'brand_slug' => 'versace',
                'category_slug' => 'nuoc-hoa-nam',
                'name' => 'Versace Eros Eau de Toilette',
                'slug' => 'versace-eros-eau-de-toilette',
                'sku' => 'VERSACE-EROS-EDT-100',
                'short_description' => 'Bạc hà, táo xanh và vanilla tạo cảm giác trẻ trung, cuốn hút.',
                'description' => 'Versace Eros EDT phù hợp cho những buổi tối năng động, để tạo ấn tượng và vẫn giữ nét tươi mát.',
                'image' => 'https://images.unsplash.com/photo-1600612253971-422e7f7faeb6?auto=format&fit=crop&w=900&q=80',
                'gender' => ProductGender::Male->value,
                'concentration' => 'EDT',
                'volume_ml' => 100,
                'price' => 2450000,
                'sale_price' => 2150000,
                'stock' => 25,
                'is_featured' => false,
                'sort_order' => 6,
            ],
            [
                'brand_slug' => 'maison-margiela',
                'category_slug' => 'nuoc-hoa-unisex',
                'name' => 'Maison Margiela Replica Lazy Sunday Morning',
                'slug' => 'maison-margiela-replica-lazy-sunday-morning',
                'sku' => 'MM-REPLICA-LSM-100',
                'short_description' => 'Cảm giác chăn ga sạch, hoa trắng và musk mềm.',
                'description' => 'Lazy Sunday Morning gợi nhớ buổi sáng nhẹ nhàng với cotton sạch, hoa linh lan và musk.',
                'image' => 'https://images.unsplash.com/photo-1619994403073-2cec844b8e63?auto=format&fit=crop&w=900&q=80',
                'gender' => ProductGender::Unisex->value,
                'concentration' => 'EDT',
                'volume_ml' => 100,
                'price' => 3150000,
                'sale_price' => null,
                'stock' => 10,
                'is_featured' => false,
                'sort_order' => 7,
            ],
            [
                'brand_slug' => 'chanel',
                'category_slug' => 'nuoc-hoa-nu',
                'name' => 'Chanel Coco Mademoiselle Eau de Parfum',
                'slug' => 'chanel-coco-mademoiselle-eau-de-parfum',
                'sku' => 'CHANEL-COCO-MAD-EDP-100',
                'short_description' => 'Cam tươi, hoa hồng và patchouli sang trọng.',
                'description' => 'Coco Mademoiselle EDP là mùi hương nữ tính hiện đại, vừa thanh lịch vừa có độ bám tỏa tốt.',
                'image' => 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=900&q=80',
                'gender' => ProductGender::Female->value,
                'concentration' => 'EDP',
                'volume_ml' => 100,
                'price' => 4290000,
                'sale_price' => null,
                'stock' => 7,
                'is_featured' => true,
                'sort_order' => 8,
            ],
            [
                'brand_slug' => 'victoria-secret',
                'category_slug' => 'nuoc-hoa-nu',
                'name' => 'Victoria Secret Bombshell Body Mist',
                'slug' => 'victoria-secret-bombshell-body-mist',
                'sku' => 'VS-BOMBSHELL-MIST-250',
                'short_description' => 'Hương hoa trái cây tươi sáng, dễ dùng hằng ngày.',
                'description' => 'Bombshell Body Mist mang cảm giác ngọt nhẹ, năng động và phù hợp để xịt lại trong ngày.',
                'image' => 'https://images.unsplash.com/photo-1608528577891-eb055944f2e7?auto=format&fit=crop&w=900&q=80',
                'gender' => ProductGender::Female->value,
                'concentration' => 'Body Mist',
                'volume_ml' => 250,
                'price' => 590000,
                'sale_price' => 450000,
                'stock' => 30,
                'is_featured' => false,
                'sort_order' => 9,
            ],
            [
                'brand_slug' => 'tom-ford',
                'category_slug' => 'nuoc-hoa-niche',
                'name' => 'Tom Ford Tobacco Vanille',
                'slug' => 'tom-ford-tobacco-vanille',
                'sku' => 'TF-TOBACCO-VANILLE-50',
                'short_description' => 'Thuốc lá, vanilla và gia vị ấm, đầy cá tính.',
                'description' => 'Tobacco Vanille là mùi hương ấm áp, ngọt sâu và sang trọng, hợp thời tiết mát hoặc không gian tối.',
                'image' => 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=900&q=80',
                'gender' => ProductGender::Unisex->value,
                'concentration' => 'EDP',
                'volume_ml' => 50,
                'price' => 5600000,
                'sale_price' => null,
                'stock' => 5,
                'is_featured' => true,
                'sort_order' => 10,
            ],
        ];

        foreach ($products as $product) {
            $brandId = $brands[$product['brand_slug']] ?? null;
            $categoryId = $categories[$product['category_slug']] ?? null;

            unset($product['brand_slug'], $product['category_slug']);

            Product::updateOrCreate(
                ['slug' => $product['slug']],
                [
                    ...$product,
                    'brand_id' => $brandId,
                    'category_id' => $categoryId,
                    'status' => ProductStatus::Active->value,
                ],
            );
        }
    }
}
