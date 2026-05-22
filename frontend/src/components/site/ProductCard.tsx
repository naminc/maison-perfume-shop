import { Link } from "react-router-dom";
import { Heart, Star, ShoppingBag, Plus } from "lucide-react";
import type { Perfume } from "@/lib/demo/perfume-catalog";
import { fmtVnd } from "@/lib/demo/perfume-catalog";
import { useStorefront } from "@/hooks/useStorefront";
import { toast } from "sonner";

interface Props {
  product: Perfume;
  onToggleWishlist?: (id: string) => void;
  inWishlist?: boolean;
}

export default function ProductCard({ product: p, onToggleWishlist, inWishlist }: Props) {
  const { addToCart, toggleWishlist, isInWishlist } = useStorefront();
  const liked = inWishlist ?? isInWishlist(p.id);

  const handleAddToCart = () => {
    addToCart(p.id);
    toast.success(`Đã thêm ${p.name} vào giỏ hàng`);
  };

  const handleWishlist = () => {
    if (onToggleWishlist) {
      onToggleWishlist(p.id);
      return;
    }
    toggleWishlist(p.id);
    toast.success(liked ? "Đã xoá khỏi danh sách yêu thích" : "Đã thêm vào danh sách yêu thích");
  };

  return (
    <article className="group flex flex-col rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm hover:shadow-md hover:border-stone-300 transition-all duration-300">
      <Link to={`/product/${p.slug}`} className="relative aspect-square overflow-hidden bg-stone-50">
        <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition duration-500" />
        {p.hot && <span className="absolute top-2 left-2 rounded-full bg-amber-700 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white shadow-sm">Hot</span>}
        {p.isNew && <span className="absolute top-2 left-2 rounded-full bg-emerald-700 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white shadow-sm">Mới</span>}
        {p.oldPrice && (
          <span className="absolute top-2 right-2 rounded-full bg-rose-600/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white shadow-sm">
            -{Math.round((1 - p.price / p.oldPrice) * 100)}%
          </span>
        )}
        {!p.inStock && <div className="absolute inset-0 grid place-items-center bg-white/70 text-xs font-semibold text-stone-700">Hết hàng</div>}
      </Link>
      <div className="flex flex-1 flex-col p-3">
        <div className="text-[10px] uppercase tracking-wider text-stone-500">{p.brand}</div>
        <h3 className="mt-0.5 text-sm font-semibold text-stone-900 line-clamp-2 min-h-[2.5rem]">
          <Link to={`/product/${p.slug}`} className="hover:text-amber-700 transition-colors">{p.name}</Link>
        </h3>
        <div className="mt-1 flex items-center gap-1 text-xs text-stone-500">
          <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> {p.rating} ({p.reviews})
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-bold text-amber-700">{fmtVnd(p.price)}</span>
          {p.oldPrice && <span className="text-xs text-stone-400 line-through">{fmtVnd(p.oldPrice)}</span>}
        </div>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!p.inStock}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-stone-900 py-2 text-xs font-semibold text-white shadow-sm hover:bg-amber-700 hover:shadow transition-all disabled:bg-stone-300 disabled:shadow-none"
          >
            {p.inStock ? (
              <>
                <span className="relative inline-flex">
                  <ShoppingBag className="h-3.5 w-3.5" />
                  <Plus className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-500 text-white" strokeWidth={4} />
                </span>
                Thêm vào giỏ
              </>
            ) : "Hết hàng"}
          </button>
          <button
            type="button"
            onClick={handleWishlist}
            aria-label={liked ? "Bỏ yêu thích" : "Yêu thích"}
            className="grid h-9 w-9 place-items-center rounded-xl border border-stone-200 hover:bg-rose-50 hover:border-rose-200 transition-colors"
          >
            <Heart className={`h-4 w-4 ${liked ? "fill-rose-500 text-rose-500" : "text-stone-500"}`} />
          </button>
        </div>
      </div>
    </article>
  );
}
