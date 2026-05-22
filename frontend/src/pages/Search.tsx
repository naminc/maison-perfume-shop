import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import ContentPage from "@/components/site/ContentPage";
import ProductCard from "@/components/site/ProductCard";
import { perfumes } from "@/lib/demo/perfume-catalog";

export default function Search() {
  const [params, setParams] = useSearchParams();
  const initial = params.get("q") ?? "";
  const [q, setQ] = useState(initial);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setParams(q ? { q } : {});
  };

  const term = params.get("q") ?? "";
  const results = useMemo(() => {
    const normalized = term.toLowerCase().trim();
    if (!normalized) return [];
    return perfumes.filter(
      (p) =>
        p.name.toLowerCase().includes(normalized) ||
        p.brand.toLowerCase().includes(normalized) ||
        p.family.toLowerCase().includes(normalized) ||
        p.topNotes.some((note) => note.toLowerCase().includes(normalized)) ||
        p.middleNotes.some((note) => note.toLowerCase().includes(normalized)) ||
        p.baseNotes.some((note) => note.toLowerCase().includes(normalized)),
    );
  }, [term]);

  return (
    <ContentPage title="Tìm kiếm" subtitle={term ? `Kết quả cho “${term}”` : "Tìm sản phẩm bạn yêu thích"} crumbs={[{ label: "Tìm kiếm" }]}>
      <form onSubmit={submit} className="mb-8 flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm theo tên, thương hiệu, nhóm hương..."
            className="h-12 w-full rounded-lg border border-input bg-white pl-10 pr-4 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <button className="rounded-lg bg-stone-900 px-6 text-sm font-semibold text-white hover:bg-stone-800">Tìm</button>
      </form>

      {!term ? (
        <div className="rounded-xl border border-stone-200 bg-white py-16 text-center text-sm text-stone-500">
          Nhập từ khoá để bắt đầu tìm kiếm.
        </div>
      ) : results.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-white py-16 text-center">
          <h2 className="text-lg font-medium">Không tìm thấy kết quả</h2>
          <p className="mt-1 text-sm text-stone-500">Thử từ khoá khác hoặc duyệt theo danh mục.</p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-stone-500">{results.length} sản phẩm</div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
            {results.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </>
      )}
    </ContentPage>
  );
}
