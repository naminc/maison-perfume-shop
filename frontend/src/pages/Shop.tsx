import { useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { PackageSearch, SlidersHorizontal, X } from "lucide-react";
import ContentPage from "@/components/site/ContentPage";
import ProductCard from "@/components/site/ProductCard";
import { useBrands } from "@/hooks/useBrands";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";
import { productPrice } from "@/lib/product-utils";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";

type SortKey = "popular" | "price-asc" | "price-desc" | "newest";

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sort, setSort] = useState<SortKey>("popular");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const brandsQuery = useBrands();
  const categoriesQuery = useCategories();
  const brands = brandsQuery.data ?? [];
  const categories = useMemo(() => flattenCategories(categoriesQuery.data ?? []), [categoriesQuery.data]);
  const brandSlug = searchParams.get("brand") ?? "";
  const categorySlug = searchParams.get("category") ?? "";
  const selectedBrandId = brandSlug ? brands.find((brand) => brand.slug === brandSlug)?.id ?? -1 : "all";
  const selectedCategoryId = categorySlug ? categories.find((category) => category.slug === categorySlug)?.id ?? -1 : "all";

  const productsQuery = useProducts({
    brand_id: selectedBrandId,
    category_id: selectedCategoryId,
    per_page: 100,
  });

  const products = useMemo(() => sortProducts(productsQuery.data?.data ?? [], sort), [productsQuery.data?.data, sort]);
  const isLoading = productsQuery.isLoading || brandsQuery.isLoading || categoriesQuery.isLoading;
  const isError = productsQuery.isError || brandsQuery.isError || categoriesQuery.isError;

  const updateFilter = (nextFilter: { brand?: string | null; category?: string | null }) => {
    const next = new URLSearchParams(searchParams);

    if (nextFilter.brand !== undefined) {
      if (nextFilter.brand) next.set("brand", nextFilter.brand);
      else next.delete("brand");
    }

    if (nextFilter.category !== undefined) {
      if (nextFilter.category) next.set("category", nextFilter.category);
      else next.delete("category");
    }

    setSearchParams(next);
  };

  const filters = (
    <div className="space-y-6">
      <FilterGroup title="Danh mục">
        <Chip active={!categorySlug} onClick={() => updateFilter({ category: null })}>Tất cả</Chip>
        {categories.map((category) => (
          <Chip
            key={category.id}
            active={categorySlug === category.slug}
            onClick={() => updateFilter({ category: category.slug })}
          >
            {category.name}
          </Chip>
        ))}
      </FilterGroup>

      <FilterGroup title="Thương hiệu">
        <Chip active={!brandSlug} onClick={() => updateFilter({ brand: null })}>Tất cả</Chip>
        {brands.map((brand) => (
          <Chip
            key={brand.id}
            active={brandSlug === brand.slug}
            onClick={() => updateFilter({ brand: brand.slug })}
          >
            {brand.name}
          </Chip>
        ))}
      </FilterGroup>
    </div>
  );

  return (
    <ContentPage title="Tất cả sản phẩm" subtitle="Khám phá các mùi hương được Maison tuyển chọn từ những thương hiệu danh tiếng." crumbs={[{ label: "Sản phẩm" }]}>
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
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
            <div className="text-sm text-stone-500">
              {isLoading ? "Đang tải..." : `${productsQuery.data?.total ?? products.length} sản phẩm`}
            </div>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              className="ml-auto rounded-lg border border-input bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="popular">Phổ biến</option>
              <option value="newest">Mới nhất</option>
              <option value="price-asc">Giá tăng dần</option>
              <option value="price-desc">Giá giảm dần</option>
            </select>
          </div>

          {isLoading ? (
            <ProductGridSkeleton />
          ) : isError ? (
            <StateBox title="Không thể tải sản phẩm" description="Vui lòng thử lại sau." />
          ) : products.length === 0 ? (
            <StateBox title="Không có sản phẩm phù hợp" description="Thử thay đổi bộ lọc hoặc xem tất cả sản phẩm." />
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
              {products.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          )}
        </section>
      </div>

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
              Xem {products.length} sản phẩm
            </button>
          </aside>
        </div>
      )}
    </ContentPage>
  );
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-500">{title}</div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
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

function flattenCategories(categories: Category[]): Category[] {
  return categories.flatMap((category) => [
    category,
    ...flattenCategories(category.children ?? []),
  ]);
}

function sortProducts(products: Product[], sort: SortKey) {
  const list = [...products];

  switch (sort) {
    case "price-asc":
      return list.sort((a, b) => productPrice(a) - productPrice(b));
    case "price-desc":
      return list.sort((a, b) => productPrice(b) - productPrice(a));
    case "newest":
      return list.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    default:
      return list.sort((a, b) => Number(b.is_featured) - Number(a.is_featured) || a.sort_order - b.sort_order);
  }
}
