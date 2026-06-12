import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Heart, Minus, Plus, Truck, ShieldCheck, RotateCcw, ShoppingBag, PackageSearch } from "lucide-react";
import { toast } from "sonner";
import ContentPage from "@/components/site/ContentPage";
import ProductCard from "@/components/site/ProductCard";
import { PRODUCT_GENDER_LABELS } from "@/constants/product";
import { useProducts, useProductBySlug } from "@/hooks/useProducts";
import { useStorefront } from "@/hooks/useStorefront";
import { formatVnd, hasProductSale, productOriginalPrice, productPrice } from "@/lib/product-utils";

export default function ProductDetail() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const productQuery = useProductBySlug(slug);
  const product = productQuery.data;
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"desc" | "details">("desc");
  const { addToCart, toggleWishlist, isInWishlist } = useStorefront();

  useEffect(() => {
    if (!product) return;

    setQty((current) => Math.min(Math.max(1, current), Math.max(1, product.stock)));
  }, [product]);

  const relatedQuery = useProducts({
    brand_id: product?.brand_id ?? -1,
    per_page: 8,
  });
  const related = useMemo(
    () => (relatedQuery.data?.data ?? []).filter((item) => item.id !== product?.id).slice(0, 4),
    [product?.id, relatedQuery.data?.data],
  );

  if (productQuery.isLoading) {
    return (
      <ContentPage title="" crumbs={[{ label: "Sản phẩm", to: "/shop" }, { label: "Đang tải" }]}>
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="aspect-square animate-pulse rounded-2xl bg-stone-100" />
          <div className="space-y-4">
            <div className="h-4 w-24 animate-pulse rounded bg-stone-100" />
            <div className="h-9 w-3/4 animate-pulse rounded bg-stone-100" />
            <div className="h-7 w-40 animate-pulse rounded bg-stone-100" />
            <div className="h-28 animate-pulse rounded bg-stone-100" />
          </div>
        </div>
      </ContentPage>
    );
  }

  if (productQuery.isError || !product) {
    return (
      <ContentPage title="Không tìm thấy sản phẩm" crumbs={[{ label: "Sản phẩm", to: "/shop" }, { label: "Không tồn tại" }]}>
        <div className="rounded-xl border border-stone-200 bg-white py-16 text-center">
          <PackageSearch className="mx-auto h-10 w-10 text-stone-300" strokeWidth={1.5} />
          <p className="mt-3 text-sm text-stone-500">Sản phẩm này chưa tồn tại hoặc đang tạm ẩn.</p>
          <Link to="/shop" className="mt-4 inline-block rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white">
            Quay lại cửa hàng
          </Link>
        </div>
      </ContentPage>
    );
  }

  const inStock = product.stock > 0;
  const hasSale = hasProductSale(product);
  const liked = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (!inStock) return;

    addToCart(product.id, qty, product.stock);
    toast.success(`Đã thêm ${qty} x ${product.name} vào giỏ`);
  };

  const buyNow = () => {
    if (!inStock) return;

    addToCart(product.id, qty, product.stock);
    toast.success(`Đã thêm ${qty} x ${product.name} vào giỏ`);
    navigate("/checkout");
  };

  return (
    <ContentPage title="" crumbs={[{ label: "Sản phẩm", to: "/shop" }, { label: product.brand?.name ?? "Maison" }, { label: product.name }]}>
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
          <div className="aspect-square overflow-hidden bg-stone-100">
            {product.image ? (
              <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center text-stone-400">
                <PackageSearch className="h-12 w-12" strokeWidth={1.5} />
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider text-stone-500">{product.brand?.name ?? "Maison"}</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{product.name}</h1>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-stone-600">
            {product.sku && <span className="font-mono text-xs text-stone-500">SKU: {product.sku}</span>}
            <span className="text-stone-300">|</span>
            <span className={inStock ? "text-emerald-700" : "text-red-600"}>
              {inStock ? `Còn ${product.stock} sản phẩm` : "Hết hàng"}
            </span>
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <div className="text-3xl font-bold text-amber-700">{formatVnd(productPrice(product))}</div>
            {hasSale && <div className="text-base text-stone-400 line-through">{formatVnd(productOriginalPrice(product))}</div>}
            {hasSale && (
              <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-bold text-red-600">
                -{Math.round((1 - productPrice(product) / productOriginalPrice(product)) * 100)}%
              </span>
            )}
          </div>

          {product.short_description && (
            <p className="mt-4 text-sm leading-relaxed text-stone-600">{product.short_description}</p>
          )}

          <dl className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-stone-50 p-4 text-sm">
            <Meta label="Dung tích" value={product.volume_ml ? `${product.volume_ml}ml` : "-"} />
            <Meta label="Giới tính" value={PRODUCT_GENDER_LABELS[product.gender]} />
            <Meta label="Nồng độ" value={product.concentration ?? "-"} />
            <Meta label="Danh mục" value={product.category?.name ?? "-"} />
          </dl>

          <div className="mt-5 flex items-center gap-3">
            <div className="inline-flex items-center rounded-full border border-stone-300 bg-white">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="grid h-10 w-10 place-items-center rounded-full hover:bg-stone-100" aria-label="Giảm">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center font-semibold">{qty}</span>
              <button
                onClick={() => setQty(Math.min(product.stock, qty + 1))}
                disabled={!inStock || qty >= product.stock}
                className="grid h-10 w-10 place-items-center rounded-full hover:bg-stone-100 disabled:opacity-40"
                aria-label="Tăng"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button onClick={handleAddToCart} disabled={!inStock} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-stone-900 bg-white py-3 text-sm font-semibold text-stone-900 shadow-sm transition-all hover:bg-stone-900 hover:text-white disabled:opacity-40">
              <span className="relative inline-flex">
                <ShoppingBag className="h-4 w-4" />
                <Plus className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amber-500 text-white" strokeWidth={4} />
              </span>
              Thêm vào giỏ
            </button>
            <button
              type="button"
              onClick={() => {
                toggleWishlist(product.id);
                toast.success(liked ? "Đã xoá khỏi danh sách yêu thích" : "Đã thêm vào danh sách yêu thích");
              }}
              aria-label={liked ? "Bỏ yêu thích" : "Yêu thích"}
              className="grid h-12 w-12 place-items-center rounded-xl border border-stone-200 transition-colors hover:border-rose-200 hover:bg-rose-50"
            >
              <Heart className={`h-5 w-5 ${liked ? "fill-rose-500 text-rose-500" : ""}`} />
            </button>
          </div>
          <button onClick={buyNow} disabled={!inStock} className="mt-3 w-full rounded-xl bg-stone-900 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-amber-700 hover:shadow disabled:bg-stone-300">
            Mua ngay
          </button>

          <ul className="mt-6 space-y-2 border-t border-stone-200 pt-5 text-sm text-stone-700">
            <li className="flex items-center gap-2"><Truck className="h-4 w-4 text-amber-700" /> Miễn phí giao hàng cho đơn từ 500.000đ</li>
            <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-amber-700" /> Cam kết 100% chính hãng</li>
            <li className="flex items-center gap-2"><RotateCcw className="h-4 w-4 text-amber-700" /> Đổi trả miễn phí trong 7 ngày</li>
          </ul>
        </div>
      </div>

      <div className="mt-12 rounded-2xl border border-stone-200 bg-white p-6">
        <div className="flex gap-2 border-b border-stone-200">
          {([
            { id: "desc", label: "Mô tả" },
            { id: "details", label: "Thông tin" },
          ] as const).map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`relative px-4 py-3 text-sm font-medium transition-colors ${
                tab === item.id ? "text-stone-900" : "text-stone-500 hover:text-stone-700"
              }`}
            >
              {item.label}
              {tab === item.id && <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-stone-900" />}
            </button>
          ))}
        </div>
        <div className="pt-5 text-sm leading-relaxed text-stone-700">
          {tab === "desc" && (
            <p>{product.description ?? product.short_description ?? "Sản phẩm đang được cập nhật mô tả chi tiết."}</p>
          )}
          {tab === "details" && (
            <dl className="grid gap-3 sm:grid-cols-2">
              <Meta label="Thương hiệu" value={product.brand?.name ?? "-"} />
              <Meta label="Danh mục" value={product.category?.name ?? "-"} />
              <Meta label="Nồng độ" value={product.concentration ?? "-"} />
              <Meta label="Dung tích" value={product.volume_ml ? `${product.volume_ml}ml` : "-"} />
              <Meta label="Giới tính" value={PRODUCT_GENDER_LABELS[product.gender]} />
              <Meta label="Tồn kho" value={`${product.stock}`} />
            </dl>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-5 text-xl font-semibold">Có thể bạn cũng thích</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {related.map((item) => <ProductCard key={item.id} product={item} />)}
          </div>
        </section>
      )}
    </ContentPage>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-stone-500">{label}</dt>
      <dd className="mt-0.5 font-medium text-stone-900">{value}</dd>
    </div>
  );
}
