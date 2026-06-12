import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PackageSearch, Search as SearchIcon } from "lucide-react";
import ContentPage from "@/components/site/ContentPage";
import ProductCard from "@/components/site/ProductCard";
import { useProducts } from "@/hooks/useProducts";

export default function Search() {
  const [params, setParams] = useSearchParams();
  const initial = params.get("q") ?? "";
  const [q, setQ] = useState(initial);
  const term = params.get("q")?.trim() ?? "";

  const productsQuery = useProducts({
    search: term,
    per_page: 100,
  });

  const results = term ? productsQuery.data?.data ?? [] : [];

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const keyword = q.trim();
    setParams(keyword ? { q: keyword } : {});
  };

  return (
    <ContentPage title="Tìm kiếm" subtitle={term ? `Kết quả cho "${term}"` : "Tìm sản phẩm bạn yêu thích"} crumbs={[{ label: "Tìm kiếm" }]}>
      <form onSubmit={submit} className="mb-8 flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Tìm theo tên, thương hiệu, SKU..."
            className="h-12 w-full rounded-lg border border-input bg-white pl-10 pr-4 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <button className="rounded-lg bg-stone-900 px-6 text-sm font-semibold text-white hover:bg-stone-800">Tìm</button>
      </form>

      {!term ? (
        <StateBox title="Nhập từ khoá để bắt đầu tìm kiếm" description="Bạn có thể tìm theo tên sản phẩm, thương hiệu hoặc SKU." />
      ) : productsQuery.isLoading ? (
        <ProductGridSkeleton />
      ) : productsQuery.isError ? (
        <StateBox title="Không thể tải kết quả" description="Vui lòng thử lại sau." />
      ) : results.length === 0 ? (
        <StateBox title="Không tìm thấy kết quả" description="Thử từ khoá khác hoặc duyệt theo danh mục." />
      ) : (
        <>
          <div className="mb-4 text-sm text-stone-500">{productsQuery.data?.total ?? results.length} sản phẩm</div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
            {results.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </>
      )}
    </ContentPage>
  );
}

function StateBox({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white py-16 text-center">
      <PackageSearch className="mx-auto h-10 w-10 text-stone-300" strokeWidth={1.5} />
      <h2 className="mt-3 text-lg font-medium text-stone-900">{title}</h2>
      <p className="mt-1 text-sm text-stone-500">{description}</p>
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
          <div className="aspect-square animate-pulse bg-stone-100" />
          <div className="space-y-2 p-3">
            <div className="h-3 w-1/3 animate-pulse rounded bg-stone-100" />
            <div className="h-4 animate-pulse rounded bg-stone-100" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-stone-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
