import { Link, useParams } from "react-router-dom";
import { Calendar, ArrowLeft } from "lucide-react";
import ContentPage from "@/components/site/ContentPage";
import { POSTS } from "./Blog";

export default function BlogPost() {
  const { slug = "" } = useParams();
  const post = POSTS.find((p) => p.slug === slug) ?? POSTS[0];
  const related = POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <ContentPage title={post.title} crumbs={[{ label: "Blog", to: "/blog" }, { label: post.category }]} narrow>
      <div className="-mt-4 mb-6 flex items-center gap-2 text-xs text-stone-500">
        <span className="rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-700">{post.category}</span>
        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {post.date}</span>
        <span>· {post.readMin} phút đọc</span>
      </div>

      <img src={post.cover} alt={post.title} className="aspect-[16/9] w-full rounded-2xl object-cover" />

      <article className="prose mt-8 max-w-none text-stone-700">
        <p className="text-lg leading-relaxed text-stone-700">{post.excerpt}</p>
        <p className="mt-4 leading-relaxed">
          Nước hoa từ lâu đã là một phần không thể thiếu trong việc thể hiện cá tính. Một mùi hương phù hợp không chỉ giúp bạn tự tin hơn mà còn là dấu ấn riêng để người khác ghi nhớ về bạn.
        </p>
        <h2 className="mt-8 text-xl font-semibold text-stone-900">Một mùi hương — một câu chuyện</h2>
        <p className="mt-3 leading-relaxed">
          Mỗi chai nước hoa là sự kết hợp tinh tế giữa hàng chục, thậm chí hàng trăm nguyên liệu thiên nhiên và tổng hợp. Người chế tác nước hoa (perfumer) đóng vai trò như một nhạc trưởng, phối hợp các nốt hương để tạo ra một bản giao hưởng hoàn hảo.
        </p>
        <h2 className="mt-8 text-xl font-semibold text-stone-900">Lời khuyên từ Maison</h2>
        <ul className="mt-3 space-y-2 leading-relaxed">
          <li>• Thử nước hoa trên da thay vì giấy thử.</li>
          <li>• Đợi 15-30 phút để cảm nhận đủ các nốt hương.</li>
          <li>• Chọn mùi hương theo dịp và mùa trong năm.</li>
        </ul>
        <p className="mt-6 leading-relaxed">
          Hãy đến showroom của Maison hoặc liên hệ đội ngũ tư vấn để được trải nghiệm và tìm ra mùi hương của riêng bạn.
        </p>
      </article>

      <div className="mt-10 border-t border-stone-200 pt-8">
        <Link to="/blog" className="inline-flex items-center gap-1 text-sm font-medium text-stone-600 hover:text-stone-900">
          <ArrowLeft className="h-4 w-4" /> Quay lại blog
        </Link>
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">Bài viết liên quan</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {related.map((p) => (
            <Link key={p.slug} to={`/blog/${p.slug}`} className="group overflow-hidden rounded-xl border border-stone-200 bg-white hover:shadow-md transition">
              <div className="aspect-[4/3] overflow-hidden bg-stone-100">
                <img src={p.cover} alt={p.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              </div>
              <div className="p-4">
                <div className="text-xs text-stone-500">{p.date}</div>
                <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-stone-900 group-hover:text-amber-700">{p.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </ContentPage>
  );
}
