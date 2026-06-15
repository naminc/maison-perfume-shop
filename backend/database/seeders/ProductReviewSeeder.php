<?php

namespace Database\Seeders;

use App\Enums\ProductReviewStatus;
use App\Models\Product;
use App\Models\ProductReview;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProductReviewSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::query()->where('email', 'admin@naminc.dev')->first();

        if (! $user) {
            return;
        }

        $reviews = [
            [
                'product_slug' => 'dior-sauvage-eau-de-parfum',
                'rating' => 5,
                'title' => 'Mùi dễ dùng và bám tốt',
                'content' => 'Hương sạch, nam tính, dùng đi làm hay đi chơi đều ổn.',
            ],
            [
                'product_slug' => 'chanel-bleu-de-chanel-eau-de-parfum',
                'rating' => 5,
                'title' => 'Thanh lịch',
                'content' => 'Mùi gỗ thơm nhẹ, không quá gắt, hợp môi trường công sở.',
            ],
            [
                'product_slug' => 'tom-ford-oud-wood',
                'rating' => 4,
                'title' => 'Ấm và sang',
                'content' => 'Oud mềm, dễ tiếp cận hơn mình nghĩ. Hợp buổi tối.',
            ],
            [
                'product_slug' => 'ysl-libre-eau-de-parfum',
                'rating' => 5,
                'title' => 'Nữ tính hiện đại',
                'content' => 'Mùi hoa cam và lavender rất sáng, lên da khá cuốn.',
            ],
        ];

        foreach ($reviews as $review) {
            $product = Product::query()->where('slug', $review['product_slug'])->first();

            if (! $product) {
                continue;
            }

            ProductReview::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'product_id' => $product->id,
                    'order_item_id' => null,
                ],
                [
                    'rating' => $review['rating'],
                    'title' => $review['title'],
                    'content' => $review['content'],
                    'status' => ProductReviewStatus::Approved->value,
                    'approved_at' => now(),
                    'rejected_at' => null,
                ],
            );
        }
    }
}
