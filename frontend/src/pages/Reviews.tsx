import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Star, ThumbsUp, Verified, Filter } from "lucide-react";
import ContentPage from "@/components/site/ContentPage";
import { perfumes } from "@/lib/demo/perfume-catalog";

const SAMPLE_AUTHORS = [
  "Minh Anh", "Hoàng Long", "Thu Hà", "Quốc Bảo", "Linh Chi", "Đức Mạnh",
  "Phương Thảo", "Tuấn Kiệt", "Hồng Nhung", "Gia Bảo", "Mai Linh", "Khánh Vy",
];

const SAMPLE_COMMENTS = [
  "Hương thơm rất tinh tế, lưu hương lâu suốt cả ngày. Sẽ ủng hộ shop tiếp.",
  "Đóng gói cẩn thận, hàng chuẩn auth. Giao hàng nhanh, rất hài lòng.",
  "Mùi hợp gu, dùng đi làm rất sang trọng. Chỉ tiếc là chai hơi nhỏ.",
  "Lần đầu mua nước hoa online mà ưng quá. Tư vấn nhiệt tình.",
  "Mùi thơm dịu, không quá gắt. Phù hợp dùng hằng ngày.",
  "Giá hơi cao nhưng chất lượng xứng đáng. Sẽ giới thiệu bạn bè.",
  "Hương đầu thơm bùng nổ, hương cuối ấm áp quyến rũ. Rất đáng tiền.",
  "Shop chăm sóc khách hàng tận tình, hàng đẹp đúng mô tả.",
];

type Review = {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  productSlug: string;
  brand: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
  verified: boolean;
};

function seedReviews(): Review[] {
  const reviews: Review[] = [];
  perfumes.slice(0, 24).forEach((p, pi) => {
    const count = 1 + (pi % 3);
    for (let i = 0; i < count; i++) {
      const seed = pi * 7 + i * 13;
      reviews.push({
        id: `${p.id}-r${i}`,
        productId: p.id,
        productName: p.name,
        productImage: p.image,
        productSlug: p.slug,
        brand: p.brand,
        author: SAMPLE_AUTHORS[seed % SAMPLE_AUTHORS.length],
        rating: seed % 7 === 0 ? 3 : seed % 3 === 0 ? 4 : 5,
        comment: SAMPLE_COMMENTS[seed % SAMPLE_COMMENTS.length],
        date: `${1 + (seed % 28)}/0${1 + (seed % 9)}/2025`,
        helpful: (seed * 3) % 47,
        verified: seed % 4 !== 0,
      });
    }
  });
  return reviews;
}

export default function Reviews() {
  const all = useMemo(seedReviews, []);
  const [filter, setFilter] = useState<"all" | 5 | 4 | 3>("all");
  const [sort, setSort] = useState<"recent" | "helpful" | "rating">("recent");

  const stats = useMemo(() => {
    const total = all.length;
    const avg = all.reduce((s, r) => s + r.rating, 0) / total;
    const dist = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: all.filter((r) => r.rating === star).length,
    }));
    return { total, avg, dist };
  }, [all]);

  const list = useMemo(() => {
    const arr = filter === "all" ? all.slice() : all.filter((r) => r.rating === filter);
    if (sort === "helpful") arr.sort((a, b) => b.helpful - a.helpful);
    else if (sort === "rating") arr.sort((a, b) => b.rating - a.rating);
    return arr;
  }, [all, filter, sort]);

  return (
    <ContentPage
      title="Đánh giá & nhận xét"
      subtitle="Cảm nhận thật từ khách hàng đã trải nghiệm sản phẩm tại Maison."
      crumbs={[{ label: "Đánh giá" }]}
    >
      {/* Summary */}
      <div className="mb-8 grid gap-6 rounded-2xl border border-stone-200 bg-white p-6 sm:grid-cols-[240px_1fr] sm:p-8">
        <div className="text-center sm:border-r sm:border-stone-200">
          <div className="text-5xl font-bold text-stone-900">{stats.avg.toFixed(1)}</div>
          <div className="mt-2 flex justify-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`h-4 w-4 ${i < Math.round(stats.avg) ? "fill-amber-500 text-amber-500" : "text-stone-300"}`} />
            ))}
          </div>
          <div className="mt-2 text-xs text-stone-500">{stats.total} lượt đánh giá</div>
        </div>
        <div className="space-y-2 sm:pl-6">
          {stats.dist.map((d) => {
            const pct = stats.total ? (d.count / stats.total) * 100 : 0;
            return (
              <div key={d.star} className="flex items-center gap-3 text-xs">
                <span className="flex w-8 items-center gap-0.5 font-medium text-stone-700">
                  {d.star} <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-100">
                  <div className="h-full bg-amber-500 transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-10 text-right text-stone-500">{d.count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-stone-500" />
          {(["all", 5, 4, 3] as const).map((f) => (
            <button
              key={String(f)}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-stone-300 bg-white text-stone-700 hover:border-stone-500"
              }`}
            >
              {f === "all" ? "Tất cả" : `${f} sao`}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="rounded-lg border border-input bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="recent">Mới nhất</option>
          <option value="helpful">Hữu ích nhất</option>
          <option value="rating">Điểm cao nhất</option>
        </select>
      </div>

      {/* List */}
      <div className="space-y-3">
        {list.map((r) => (
          <article key={r.id} className="rounded-xl border border-stone-200 bg-white p-5 transition-colors hover:border-stone-300">
            <div className="flex gap-4">
              <Link to={`/product/${r.productSlug}`} className="hidden h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-stone-200 bg-stone-50 sm:block">
                <img src={r.productImage} alt={r.productName} className="h-full w-full object-cover" />
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link to={`/product/${r.productSlug}`} className="block truncate text-sm font-semibold text-stone-900 hover:text-amber-700">
                      {r.productName}
                    </Link>
                    <div className="text-[11px] uppercase tracking-wider text-stone-500">{r.brand}</div>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, k) => (
                      <Star key={k} className={`h-3.5 w-3.5 ${k < r.rating ? "fill-amber-500 text-amber-500" : "text-stone-300"}`} />
                    ))}
                  </div>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-stone-700">{r.comment}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-stone-500">
                  <span className="font-medium text-stone-700">{r.author}</span>
                  {r.verified && (
                    <span className="inline-flex items-center gap-1 text-emerald-700">
                      <Verified className="h-3.5 w-3.5" /> Đã mua hàng
                    </span>
                  )}
                  <span>{r.date}</span>
                  <span className="ml-auto inline-flex items-center gap-1">
                    <ThumbsUp className="h-3.5 w-3.5" /> {r.helpful} hữu ích
                  </span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </ContentPage>
  );
}
