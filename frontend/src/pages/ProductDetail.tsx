import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Heart, Minus, Plus, Star, Truck, ShieldCheck, RotateCcw, ShoppingBag } from "lucide-react";
import ContentPage from "@/components/site/ContentPage";
import ProductCard from "@/components/site/ProductCard";
import { findBySlug, perfumes, fmtVnd } from "@/lib/demo/perfume-catalog";
import { toast } from "sonner";
import { useStorefront } from "@/hooks/useStorefront";

export default function ProductDetail() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const product = findBySlug(slug);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"desc" | "notes" | "reviews">("desc");
  const { addToCart: addCartItem, toggleWishlist, isInWishlist } = useStorefront();

  if (!product) {
    return (
      <ContentPage title="Không tìm thấy sản phẩm" crumbs={[{ label: "Sản phẩm", to: "/shop" }, { label: "Không tồn tại" }]}>
        <Link to="/shop" className="inline-block rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white">Quay lại cửa hàng</Link>
      </ContentPage>
    );
  }

  const related = perfumes.filter((p) => p.id !== product.id && (p.brand === product.brand || p.family === product.family)).slice(0, 4);

  const handleAddToCart = () => {
    if (!product) return;
    addCartItem(product.id, qty);
    toast.success(`Đã thêm ${qty} × ${product.name} vào giỏ`);
  };
  const buyNow = () => {
    handleAddToCart();
    setTimeout(() => navigate("/checkout"), 400);
  };

  return (
    <ContentPage title="" crumbs={[{ label: "Sản phẩm", to: "/shop" }, { label: product.brand }, { label: product.name }]}>
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Image */}
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
          <div className="aspect-square overflow-hidden bg-stone-100">
            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
          </div>
        </div>

        {/* Info */}
        <div>
          <div className="text-xs uppercase tracking-wider text-stone-500">{product.brand}</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{product.name}</h1>

          <div className="mt-2 flex items-center gap-3 text-sm text-stone-600">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
              <span className="font-medium text-stone-900">{product.rating}</span>
              <span className="text-stone-500">({product.reviews} đánh giá)</span>
            </span>
            <span className="text-stone-300">|</span>
            <span className={product.inStock ? "text-emerald-700" : "text-red-600"}>
              {product.inStock ? "Còn hàng" : "Hết hàng"}
            </span>
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <div className="text-3xl font-bold text-amber-700">{fmtVnd(product.price)}</div>
            {product.oldPrice && <div className="text-base text-stone-400 line-through">{fmtVnd(product.oldPrice)}</div>}
            {product.oldPrice && (
              <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-bold text-red-600">
                -{Math.round((1 - product.price / product.oldPrice) * 100)}%
              </span>
            )}
          </div>

          <p className="mt-4 text-sm leading-relaxed text-stone-600">{product.shortDescription}</p>

          <dl className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-stone-50 p-4 text-sm">
            <Meta label="Dung tích" value={product.volume} />
            <Meta label="Giới tính" value={product.gender === "nam" ? "Nam" : product.gender === "nu" ? "Nữ" : "Unisex"} />
            <Meta label="Nhóm hương" value={product.family} />
            <Meta label="Mã SP" value={product.id.toUpperCase()} />
          </dl>

          <div className="mt-5 flex items-center gap-3">
            <div className="inline-flex items-center rounded-full border border-stone-300 bg-white">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="grid h-10 w-10 place-items-center rounded-full hover:bg-stone-100" aria-label="Giảm">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center font-semibold">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-stone-100" aria-label="Tăng">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button onClick={handleAddToCart} disabled={!product.inStock} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-stone-900 bg-white py-3 text-sm font-semibold text-stone-900 shadow-sm hover:bg-stone-900 hover:text-white transition-all disabled:opacity-40">
              <span className="relative inline-flex">
                <ShoppingBag className="h-4 w-4" />
                <Plus className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-500 text-white" strokeWidth={4} />
              </span>
              Thêm vào giỏ
            </button>
            <button
              type="button"
              onClick={() => {
                toggleWishlist(product.id);
                toast.success(isInWishlist(product.id) ? "Đã xoá khỏi danh sách yêu thích" : "Đã thêm vào danh sách yêu thích");
              }}
              aria-label={isInWishlist(product.id) ? "Bỏ yêu thích" : "Yêu thích"}
              className="grid h-12 w-12 place-items-center rounded-xl border border-stone-200 hover:bg-rose-50 hover:border-rose-200 transition-colors"
            >
              <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? "fill-rose-500 text-rose-500" : ""}`} />
            </button>
          </div>
          <button onClick={buyNow} disabled={!product.inStock} className="mt-3 w-full rounded-xl bg-stone-900 py-3 text-sm font-semibold text-white shadow-sm hover:bg-amber-700 hover:shadow transition-all disabled:bg-stone-300">
            Mua ngay
          </button>

          <ul className="mt-6 space-y-2 border-t border-stone-200 pt-5 text-sm text-stone-700">
            <li className="flex items-center gap-2"><Truck className="h-4 w-4 text-amber-700" /> Miễn phí giao hàng cho đơn từ 500.000đ</li>
            <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-amber-700" /> Cam kết 100% chính hãng — hoàn tiền nếu phát hiện hàng giả</li>
            <li className="flex items-center gap-2"><RotateCcw className="h-4 w-4 text-amber-700" /> Đổi trả miễn phí trong 7 ngày</li>
          </ul>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-12 rounded-2xl border border-stone-200 bg-white p-6">
        <div className="flex gap-2 border-b border-stone-200">
          {([
            { id: "desc", label: "Mô tả" },
            { id: "notes", label: "Hương liệu" },
            { id: "reviews", label: `Đánh giá (${product.reviews})` },
          ] as const).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative px-4 py-3 text-sm font-medium transition-colors ${
                tab === t.id ? "text-stone-900" : "text-stone-500 hover:text-stone-700"
              }`}
            >
              {t.label}
              {tab === t.id && <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-stone-900" />}
            </button>
          ))}
        </div>
        <div className="pt-5 text-sm leading-relaxed text-stone-700">
          {tab === "desc" && <p>{product.shortDescription} Sản phẩm là sự kết hợp tinh tế giữa nguyên liệu thiên nhiên và công nghệ chiết xuất hiện đại, mang lại trải nghiệm mùi hương đẳng cấp, lưu hương bền bỉ suốt cả ngày.</p>}
          {tab === "notes" && (
            <div className="grid gap-4 sm:grid-cols-3">
              <NoteCol title="Hương đầu" notes={product.topNotes} />
              <NoteCol title="Hương giữa" notes={product.middleNotes} />
              <NoteCol title="Hương cuối" notes={product.baseNotes} />
            </div>
          )}
          {tab === "reviews" && (
            <div className="space-y-4">
              {[
                { n: "Minh Anh", r: 5, c: "Hương thơm rất tinh tế, lưu hương lâu. Sẽ mua lại!" },
                { n: "Hoàng Long", r: 5, c: "Đóng gói cẩn thận, hàng chuẩn auth. Rất hài lòng." },
                { n: "Thu Hà", r: 4, c: "Mùi rất hợp, nhưng giá hơi cao." },
              ].map((r, i) => (
                <div key={i} className="rounded-lg border border-stone-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{r.n}</div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, k) => (
                        <Star key={k} className={`h-3.5 w-3.5 ${k < r.r ? "fill-amber-500 text-amber-500" : "text-stone-300"}`} />
                      ))}
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-stone-600">{r.c}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Related */}
      <section className="mt-12">
        <h2 className="mb-5 text-xl font-semibold">Có thể bạn cũng thích</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {related.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
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

function NoteCol({ title, notes }: { title: string; notes: string[] }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-amber-700">{title}</div>
      <ul className="mt-2 space-y-1 text-sm text-stone-700">
        {notes.map((n) => <li key={n}>• {n}</li>)}
      </ul>
    </div>
  );
}
