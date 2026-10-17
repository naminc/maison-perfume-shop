<?php

namespace Database\Seeders;

use App\Enums\PostStatus;
use App\Models\Post;
use Illuminate\Database\Seeder;

class PostSeeder extends Seeder
{
    public function run(): void
    {
        $posts = [
            [
                'title' => 'Cách chọn nước hoa theo tính cách của bạn',
                'slug' => 'cach-chon-nuoc-hoa-theo-tinh-cach',
                'excerpt' => 'Mỗi mùi hương kể một câu chuyện. Bài viết này sẽ giúp bạn tìm ra hương thơm phản ánh đúng bản thân.',
                'category' => 'Hướng dẫn',
                'read_minutes' => 6,
                'published_at' => '2026-05-18 09:00:00',
                'content' => <<<'MD'
Nước hoa từ lâu đã là một phần không thể thiếu trong việc thể hiện cá tính. Một mùi hương phù hợp không chỉ giúp bạn tự tin hơn mà còn là dấu ấn riêng để người khác ghi nhớ về bạn.

## Một mùi hương — một câu chuyện

Mỗi chai nước hoa là sự kết hợp tinh tế giữa hàng chục, thậm chí hàng trăm nguyên liệu thiên nhiên và tổng hợp. Người chế tác nước hoa (perfumer) đóng vai trò như một nhạc trưởng, phối hợp các nốt hương để tạo ra một bản giao hưởng hoàn hảo.

## Chọn hương theo tính cách

- Người hướng ngoại, năng động: hương cam chanh (citrus), biển (aquatic) tươi mát.
- Người lãng mạn, nhẹ nhàng: hương hoa cỏ (floral) như hồng, nhài, mẫu đơn.
- Người cá tính, bí ẩn: hương gỗ (woody), hổ phách (amber), da thuộc (leather).
- Người thanh lịch, cổ điển: hương phương Đông (oriental) ấm áp, sang trọng.

## Lời khuyên từ Maison

- Thử nước hoa trên da thay vì giấy thử.
- Đợi 15-30 phút để cảm nhận đủ các nốt hương.
- Chọn mùi hương theo dịp và mùa trong năm.

Hãy đến showroom của Maison hoặc liên hệ đội ngũ tư vấn để được trải nghiệm và tìm ra mùi hương của riêng bạn.
MD,
            ],
            [
                'title' => '5 mùi hương mùa hè 2026 không thể bỏ lỡ',
                'slug' => '5-mui-huong-mua-he-2026',
                'excerpt' => 'Top những chai nước hoa fresh, citrus dành riêng cho mùa hè nóng bức.',
                'category' => 'Xu hướng',
                'read_minutes' => 5,
                'published_at' => '2026-05-10 09:00:00',
                'content' => <<<'MD'
Mùa hè là thời điểm của những mùi hương tươi mát, nhẹ nhàng nhưng vẫn đủ lưu luyến. Dưới đây là 5 gợi ý từ Maison cho mùa hè 2026.

## Tiêu chí chọn nước hoa mùa hè

Thời tiết nóng khiến mùi hương khuếch tán mạnh hơn, vì vậy nên ưu tiên các nồng độ nhẹ như EDT, các nốt hương citrus, trà xanh, biển và trái cây.

## Gợi ý từ Maison

- Hương cam bergamot kết hợp neroli — tươi sáng, lịch sự cho môi trường công sở.
- Hương chanh vàng và gừng — tràn đầy năng lượng cho ngày cuối tuần.
- Hương biển với muối khoáng — phóng khoáng, tự do.
- Hương trà xanh và nhài — thanh khiết, dễ chịu.
- Hương dưa lưới và hoa trắng — ngọt nhẹ, trẻ trung.

Ghé Maison để trải nghiệm trực tiếp các mùi hương mùa hè đang có sẵn tại cửa hàng.
MD,
            ],
            [
                'title' => 'Bí quyết bảo quản nước hoa luôn thơm bền lâu',
                'slug' => 'bao-quan-nuoc-hoa-dung-cach',
                'excerpt' => 'Ánh sáng, nhiệt độ và độ ẩm — 3 yếu tố quyết định tuổi thọ của một chai nước hoa.',
                'category' => 'Mẹo hay',
                'read_minutes' => 4,
                'published_at' => '2026-05-02 09:00:00',
                'content' => <<<'MD'
Một chai nước hoa được bảo quản đúng cách có thể giữ nguyên chất lượng mùi hương trong 3-5 năm, thậm chí lâu hơn.

## 3 kẻ thù của nước hoa

- Ánh sáng trực tiếp: tia UV phá vỡ cấu trúc phân tử hương liệu.
- Nhiệt độ cao: đẩy nhanh quá trình oxy hoá, làm biến đổi mùi hương.
- Độ ẩm: phòng tắm là nơi tệ nhất để đặt nước hoa.

## Cách bảo quản đúng

- Giữ nước hoa trong hộp gốc, đặt nơi khô ráo, thoáng mát.
- Tránh để trên bệ cửa sổ hoặc trong xe hơi.
- Đậy chặt nắp sau khi dùng, hạn chế lắc chai.
- Không chiết sang chai khác nếu không cần thiết.

Với vài thói quen đơn giản, bạn sẽ giữ được trọn vẹn mùi hương yêu thích qua nhiều năm.
MD,
            ],
            [
                'title' => 'Cách phân biệt nước hoa thật và giả',
                'slug' => 'phan-biet-nuoc-hoa-that-gia',
                'excerpt' => '5 dấu hiệu giúp bạn nhận biết nước hoa chính hãng ngay từ cái nhìn đầu tiên.',
                'category' => 'Kiến thức',
                'read_minutes' => 7,
                'published_at' => '2026-04-25 09:00:00',
                'content' => <<<'MD'
Thị trường nước hoa giả ngày càng tinh vi. Trang bị kiến thức nhận biết là cách tốt nhất để bảo vệ sức khoẻ và túi tiền của bạn.

## 5 dấu hiệu nhận biết

- Bao bì: hàng chính hãng có đường cắt sắc nét, chữ in rõ, không lem mực.
- Mã vạch và batch code: kiểm tra được nguồn gốc, trùng khớp giữa hộp và chai.
- Chất lỏng: màu trong, không vẩn đục hay lắng cặn.
- Vòi xịt: phun sương mịn, đều; hàng giả thường phun thành tia.
- Độ lưu hương: hàng thật có tầng hương thay đổi theo thời gian, hàng giả thường chỉ có một mùi gắt rồi bay nhanh.

## Mua ở đâu để an tâm?

Chỉ nên mua tại cửa hàng uỷ quyền hoặc các địa chỉ uy tín có chính sách đổi trả rõ ràng. Tại Maison, mọi sản phẩm đều được nhập khẩu chính ngạch và cam kết chính hãng 100%.
MD,
            ],
        ];

        foreach ($posts as $post) {
            Post::query()->updateOrCreate(
                ['slug' => $post['slug']],
                array_merge($post, ['status' => PostStatus::Published->value]),
            );
        }
    }
}
