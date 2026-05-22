import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import ContentPage from "@/components/site/ContentPage";
import ProductCard from "@/components/site/ProductCard";
import { perfumes, BRANDS, FAMILIES, type Gender, type Family } from "@/lib/demo/perfume-catalog";

type SortKey = "popular" | "price-asc" | "price-desc" | "newest";

const GENDERS: { id: Gender | "all"; label: string }[] = [
  { id: "all", label: "Tất cả" },
  { id: "nam", label: "Nam" },
  { id: "nu", label: "Nữ" },
  { id: "unisex", label: "Unisex" },
];

export default function Shop() {
  const [gender, setGender] = useState<Gender | "all">("all");
  const [brand, setBrand] = useState<string | "all">("all");
  const [family, setFamily] = useState<Family | "all">("all");
  const [sort, setSort] = useState<SortKey>("popular");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const list = useMemo(() => {
    let arr = perfumes.slice();
    if (gender !== "all") arr = arr.filter((p) => p.gender === gender);
    if (brand !== "all") arr = arr.filter((p) => p.brand === brand);
    if (family !== "all") arr = arr.filter((p) => p.family === family);
    switch (sort) {
      case "price-asc": arr.sort((a, b) => a.price - b.price); break;
      case "price-desc": arr.sort((a, b) => b.price - a.price); break;
      case "newest": arr.sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew)); break;
      default: arr.sort((a, b) => b.reviews - a.reviews);
    }
    return arr;
  }, [gender, brand, family, sort]);

  const filters = (
    <div className="space-y-6">
      <FilterGroup title="Giới tính">
        {GENDERS.map((g) => (
          <Chip key={g.id} active={gender === g.id} onClick={() => setGender(g.id)}>{g.label}</Chip>
        ))}
      </FilterGroup>
      <FilterGroup title="Thương hiệu">
        <Chip active={brand === "all"} onClick={() => setBrand("all")}>Tất cả</Chip>
        {BRANDS.map((b) => (
          <Chip key={b} active={brand === b} onClick={() => setBrand(b)}>{b}</Chip>
        ))}
      </FilterGroup>
      <FilterGroup title="Nhóm hương">
        <Chip active={family === "all"} onClick={() => setFamily("all")}>Tất cả</Chip>
        {FAMILIES.map((f) => (
          <Chip key={f} active={family === f} onClick={() => setFamily(f)}>{f}</Chip>
        ))}
      </FilterGroup>
    </div>
  );

  return (
    <ContentPage title="Tất cả sản phẩm" subtitle="Khám phá các mùi hương được Maison tuyển chọn từ những thương hiệu danh tiếng." crumbs={[{ label: "Sản phẩm" }]}>
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Desktop filters */}
        <aside className="hidden rounded-xl border border-stone-200 bg-white p-5 lg:block">
          {filters}
        </aside>

        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <button
              onClick={() => setFiltersOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" /> Bộ lọc
            </button>
            <div className="text-sm text-stone-500">{list.length} sản phẩm</div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="ml-auto rounded-lg border border-input bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="popular">Phổ biến</option>
              <option value="newest">Mới nhất</option>
              <option value="price-asc">Giá tăng dần</option>
              <option value="price-desc">Giá giảm dần</option>
            </select>
          </div>

          {list.length === 0 ? (
            <div className="rounded-xl border border-stone-200 bg-white py-16 text-center text-sm text-stone-500">
              Không có sản phẩm phù hợp với bộ lọc.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
              {list.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </section>
      </div>

      {/* Mobile filters drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setFiltersOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-80 max-w-[90%] overflow-y-auto bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold">Bộ lọc</h2>
              <button onClick={() => setFiltersOpen(false)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-stone-100" aria-label="Đóng">
                <X className="h-5 w-5" />
              </button>
            </div>
            {filters}
            <button onClick={() => setFiltersOpen(false)} className="mt-6 w-full rounded-lg bg-stone-900 py-2.5 text-sm font-semibold text-white">
              Xem {list.length} sản phẩm
            </button>
          </aside>
        </div>
      )}
    </ContentPage>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-500">{title}</div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        active ? "border-stone-900 bg-stone-900 text-white" : "border-stone-300 bg-white text-stone-700 hover:border-stone-500"
      }`}
    >
      {children}
    </button>
  );
}
