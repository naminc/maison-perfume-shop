import { Link } from "react-router-dom";
import {
  ArrowRight,
  HeartHandshake,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import ProductCard from "@/components/site/ProductCard";
import heroPerfume from "@/assets/hero-perfume.jpg";
import perfumeCollection from "@/assets/perfume-collection.jpg";
import perfumeRose from "@/assets/perfume-rose.jpg";
import perfumeDark from "@/assets/perfume-dark.jpg";
import perfumeLifestyle from "@/assets/perfume-lifestyle.jpg";
import { perfumes } from "@/lib/demo/perfume-catalog";

const FEATURED = perfumes.filter((p) => p.hot || p.isNew).slice(0, 4);
const BEST_SELLERS = [...perfumes].sort((a, b) => b.reviews - a.reviews).slice(0, 4);

const CATEGORIES = [
  {
    title: "Nước hoa Nam",
    desc: "Tông gỗ, cay, da thuộc và citrus cho phong thái lịch lãm.",
    image: perfumeDark,
    to: "/category/nam",
  },
  {
    title: "Nước hoa Nữ",
    desc: "Floral, fruity và chypre thanh lịch cho nhiều dịp khác nhau.",
    image: perfumeRose,
    to: "/category/nu",
  },
  {
    title: "Unisex",
    desc: "Những mùi hương trung tính, hiện đại và dễ chia sẻ.",
    image: perfumeLifestyle,
    to: "/category/unisex",
  },
];

const PERKS = [
  { icon: Truck, title: "Miễn phí giao hàng", desc: "Đơn từ 500.000đ" },
  { icon: ShieldCheck, title: "Chính hãng 100%", desc: "Hoàn tiền nếu phát hiện hàng giả" },
  { icon: RotateCcw, title: "Đổi trả 7 ngày", desc: "Hỗ trợ sản phẩm còn nguyên seal" },
  { icon: HeartHandshake, title: "Tư vấn mùi hương", desc: "Chọn theo gu, dịp dùng và ngân sách" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-stone-900">
      <SiteHeader />

      <section className="bg-[#f7f1e8]">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_0.95fr] md:py-16">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800">
              <Sparkles className="h-3.5 w-3.5" />
              Maison Perfume
            </div>
            <h1 className="mt-4 text-3xl font-semibold leading-[1.08] tracking-tight text-stone-950 sm:text-4xl lg:text-5xl">
              Nước hoa chính hãng cho từng phong cách
            </h1>
            <p className="mt-5 text-base leading-7 text-stone-600 sm:text-lg">
              Tuyển chọn mùi hương từ Dior, Chanel, Tom Ford, YSL và các thương hiệu được yêu thích. Mua fullsize hoặc bắt đầu bằng những lựa chọn dễ dùng nhất.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/shop" className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-white hover:bg-amber-800">
                Mua ngay <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/contact" className="rounded-full border border-stone-300 bg-white/50 px-6 py-3 text-sm font-semibold text-stone-800 hover:bg-white">
                Tư vấn chọn mùi
              </Link>
            </div>
          </div>

          <div className="relative">
            <img
              src={heroPerfume}
              alt="Bộ sưu tập nước hoa Maison"
              className="aspect-[4/3] w-full rounded-lg object-cover shadow-lg"
            />
            <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-white/90 p-4 shadow-md backdrop-blur sm:left-auto sm:right-4 sm:w-64">
              <div className="text-xs font-semibold uppercase tracking-wide text-stone-500">Ưu đãi thành viên</div>
              <div className="mt-1 text-2xl font-semibold text-stone-950">Giảm đến 35%</div>
              <p className="mt-1 text-xs text-stone-600">Áp dụng cho các mùi hương bán chạy trong tháng.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 sm:px-6 md:grid-cols-4">
          {PERKS.map((perk) => {
            const Icon = perk.icon;
            return (
              <div key={perk.title} className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber-50 text-amber-700">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-stone-950">{perk.title}</div>
                  <div className="mt-0.5 text-xs text-stone-500">{perk.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-stone-950">Danh mục nổi bật</h2>
            <p className="mt-1 text-sm text-stone-500">Đi thẳng đến nhóm mùi phù hợp nhất với bạn.</p>
          </div>
          <Link to="/shop" className="hidden text-sm font-semibold text-amber-700 hover:underline sm:inline">
            Xem tất cả
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {CATEGORIES.map((category) => (
            <Link
              key={category.title}
              to={category.to}
              className="group overflow-hidden rounded-lg border border-stone-200 bg-white"
            >
              <img src={category.image} alt={category.title} className="aspect-[5/3] w-full object-cover transition duration-500 group-hover:scale-105" />
              <div className="p-5">
                <h3 className="text-lg font-semibold text-stone-950 group-hover:text-amber-700">{category.title}</h3>
                <p className="mt-1 text-sm leading-6 text-stone-500">{category.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-stone-50 py-10 lg:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-stone-950">Sản phẩm nổi bật</h2>
              <p className="mt-1 text-sm text-stone-500">Các lựa chọn đang được Maison đề xuất trong tuần này.</p>
            </div>
            <Link to="/shop" className="text-sm font-semibold text-amber-700 hover:underline">
              Xem thêm
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {FEATURED.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[0.9fr_1fr] lg:py-14">
        <img src={perfumeCollection} alt="Tủ nước hoa Maison" className="aspect-[4/3] w-full rounded-lg object-cover" />
        <div className="flex flex-col justify-center">
          <h2 className="text-2xl font-semibold tracking-tight text-stone-950 sm:text-3xl">Dễ chọn, dễ mua, dễ đổi</h2>
          <p className="mt-4 text-sm leading-7 text-stone-600 sm:text-base">
            Maison xây dựng trải nghiệm mua nước hoa theo đúng cách khách hàng thật sự lựa chọn: xem nhóm hương, so sánh giá, đọc đánh giá, thêm vào giỏ và thanh toán trong một luồng rõ ràng.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              ["500+", "mùi hương"],
              ["4.8/5", "đánh giá trung bình"],
              ["24h", "xử lý đơn nội thành"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-lg border border-stone-200 bg-white p-4">
                <div className="text-2xl font-semibold text-stone-950">{value}</div>
                <div className="mt-1 text-xs text-stone-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-stone-950">Bán chạy</h2>
              <p className="mt-1 text-sm text-stone-500">Những mùi hương có nhiều lượt đánh giá nhất.</p>
            </div>
            <Link to="/reviews" className="text-sm font-semibold text-amber-700 hover:underline">
              Xem đánh giá
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {BEST_SELLERS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
