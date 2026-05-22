import { Link } from "react-router-dom";
import { Calendar, ArrowRight } from "lucide-react";
import ContentPage from "@/components/site/ContentPage";
import perfumeRose from "@/assets/perfume-rose.jpg";
import perfumeDark from "@/assets/perfume-dark.jpg";
import perfumeLifestyle from "@/assets/perfume-lifestyle.jpg";
import perfumeCollection from "@/assets/perfume-collection.jpg";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  cover: string;
  readMin: number;
}

export const POSTS: BlogPost[] = [
  { slug: "cach-chon-nuoc-hoa-theo-tinh-cach", title: "Cách chọn nước hoa theo tính cách của bạn", excerpt: "Mỗi mùi hương kể một câu chuyện. Bài viết này sẽ giúp bạn tìm ra hương thơm phản ánh đúng bản thân.", date: "18/05/2026", category: "Hướng dẫn", cover: perfumeRose, readMin: 6 },
  { slug: "5-mui-huong-mua-he-2026", title: "5 mùi hương mùa hè 2026 không thể bỏ lỡ", excerpt: "Top những chai nước hoa fresh, citrus dành riêng cho mùa hè nóng bức.", date: "10/05/2026", category: "Xu hướng", cover: perfumeLifestyle, readMin: 5 },
  { slug: "bao-quan-nuoc-hoa-dung-cach", title: "Bí quyết bảo quản nước hoa luôn thơm bền lâu", excerpt: "Ánh sáng, nhiệt độ và độ ẩm — 3 yếu tố quyết định tuổi thọ của một chai nước hoa.", date: "02/05/2026", category: "Mẹo hay", cover: perfumeDark, readMin: 4 },
  { slug: "phan-biet-nuoc-hoa-that-gia", title: "Cách phân biệt nước hoa thật và giả", excerpt: "5 dấu hiệu giúp bạn nhận biết nước hoa chính hãng ngay từ cái nhìn đầu tiên.", date: "25/04/2026", category: "Kiến thức", cover: perfumeCollection, readMin: 7 },
];

export default function Blog() {
  return (
    <ContentPage title="Tạp chí Maison" subtitle="Kiến thức và cảm hứng dành cho người yêu nước hoa." crumbs={[{ label: "Blog" }]}>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {POSTS.map((p) => (
          <article key={p.slug} className="group overflow-hidden rounded-2xl border border-stone-200 bg-white transition hover:shadow-md">
            <Link to={`/blog/${p.slug}`} className="block aspect-[4/3] overflow-hidden bg-stone-100">
              <img src={p.cover} alt={p.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            </Link>
            <div className="p-5">
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <span className="rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-700">{p.category}</span>
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {p.date}</span>
                <span>· {p.readMin} phút đọc</span>
              </div>
              <h2 className="mt-3 font-semibold text-stone-900 line-clamp-2">
                <Link to={`/blog/${p.slug}`} className="hover:text-amber-700">{p.title}</Link>
              </h2>
              <p className="mt-2 line-clamp-3 text-sm text-stone-600">{p.excerpt}</p>
              <Link to={`/blog/${p.slug}`} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-amber-700 hover:underline">
                Đọc tiếp <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </ContentPage>
  );
}
