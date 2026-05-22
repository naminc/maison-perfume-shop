import { useMemo, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import ContentPage from "@/components/site/ContentPage";
import ProductCard from "@/components/site/ProductCard";
import { perfumes, type Gender } from "@/lib/demo/perfume-catalog";

type SortKey = "popular" | "price-asc" | "price-desc" | "newest";

type Preset = {
  slug: string;
  title: string;
  subtitle: string;
  tagline: string;
  filter: (p: typeof perfumes[number]) => boolean;
};

const PRESETS: Preset[] = [
  {
    slug: "nam",
    title: "Nước hoa Nam",
    subtitle: "Lịch lãm, mạnh mẽ và đầy bản lĩnh",
    tagline: "Dành cho phái mạnh",
    filter: (p) => p.gender === ("nam" as Gender),
  },
  {
    slug: "nu",
    title: "Nước hoa Nữ",
    subtitle: "Tinh tế, quyến rũ và đầy nữ tính",
    tagline: "Dành cho phái đẹp",
    filter: (p) => p.gender === ("nu" as Gender),
  },
  {
    slug: "unisex",
    title: "Nước hoa Unisex",
    subtitle: "Trung tính, hiện đại, phù hợp mọi cá tính",
    tagline: "Không giới hạn",
    filter: (p) => p.gender === ("unisex" as Gender),
  },
];

const RELATED: { slug: string; label: string }[] = [
  { slug: "nam", label: "Nam" },
  { slug: "nu", label: "Nữ" },
  { slug: "unisex", label: "Unisex" },
];

export default function Category() {
  const { slug = "" } = useParams();
  const preset = PRESETS.find((p) => p.slug === slug.toLowerCase());
  const [sort, setSort] = useState<SortKey>("popular");

  const list = useMemo(() => {
    if (!preset) return [];
    const arr = perfumes.filter(preset.filter);
    switch (sort) {
      case "price-asc": return arr.sort((a, b) => a.price - b.price);
      case "price-desc": return arr.sort((a, b) => b.price - a.price);
      case "newest": return arr.sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew));
      default: return arr.sort((a, b) => b.reviews - a.reviews);
    }
  }, [preset, sort]);

  if (!preset) return <Navigate to="/shop" replace />;

  return (
    <ContentPage
      title=""
      crumbs={[{ label: "Sản phẩm", to: "/shop" }, { label: preset.title }]}
    >
      <header className="mb-8 max-w-2xl">
        <div className="text-xs font-semibold uppercase tracking-wide text-amber-700">{preset.tagline}</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">{preset.title}</h1>
        <p className="mt-2 text-sm leading-6 text-stone-500 sm:text-base">{preset.subtitle}</p>
      </header>

      {/* Quick category chips */}
      <div className="mb-6 flex flex-wrap gap-2">
        {RELATED.map((r) => (
          <Link
            key={r.slug}
            to={`/category/${r.slug}`}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              r.slug === preset.slug
                ? "border-stone-900 bg-stone-900 text-white"
                : "border-stone-300 bg-white text-stone-700 hover:border-stone-500"
            }`}
          >
            {r.label}
          </Link>
        ))}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-stone-500">{list.length} sản phẩm</div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="rounded-lg border border-input bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="popular">Phổ biến</option>
          <option value="newest">Mới nhất</option>
          <option value="price-asc">Giá tăng dần</option>
          <option value="price-desc">Giá giảm dần</option>
        </select>
      </div>

      {list.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-white py-16 text-center text-sm text-stone-500">
          Chưa có sản phẩm trong danh mục này.{" "}
          <Link to="/shop" className="font-semibold text-amber-700 hover:underline">Xem tất cả</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
          {list.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </ContentPage>
  );
}
