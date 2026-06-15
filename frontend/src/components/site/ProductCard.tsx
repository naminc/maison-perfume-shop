import { Link } from "react-router-dom";
import { Heart, Package, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useStorefront } from "@/hooks/useStorefront";
import { formatVnd, hasProductSale, productOriginalPrice, productPrice } from "@/lib/product-utils";
import type { Product } from "@/types/product";

interface Props {
  product: Product;
  onToggleWishlist?: (id: number) => void;
  inWishlist?: boolean;
}

export default function ProductCard({ product, onToggleWishlist, inWishlist }: Props) {
  const { addToCart, toggleWishlist, isInWishlist } = useStorefront();
  const liked = inWishlist ?? isInWishlist(product.id);
  const inStock = product.stock > 0;
  const hasSale = hasProductSale(product);

  const handleAddToCart = () => {
    if (!inStock) return;

    addToCart(product.id, 1, product.stock);
    toast.success(`Đã thêm ${product.name} vào giỏ hàng`);
  };

  const handleWishlist = () => {
    if (onToggleWishlist) {
      onToggleWishlist(product.id);
      return;
    }

    toggleWishlist(product.id);
    toast.success(liked ? "Đã xoá khỏi danh sách yêu thích" : "Đã thêm vào danh sách yêu thích");
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:border-stone-300 hover:shadow-md">
      <Link to={`/product/${product.slug}`} className="relative aspect-square overflow-hidden bg-stone-50">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-stone-400">
            <Package className="h-10 w-10" strokeWidth={1.5} />
          </div>
        )}

        {product.is_featured && (
          <span className="absolute left-2 top-2 rounded-full bg-amber-700 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white shadow-sm">
            Hot
          </span>
        )}

        {hasSale && (
          <span className="absolute right-2 top-2 rounded-full bg-rose-600/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white shadow-sm">
            -{Math.round((1 - productPrice(product) / productOriginalPrice(product)) * 100)}%
          </span>
        )}

        {!inStock && (
          <div className="absolute inset-0 grid place-items-center bg-white/70 text-xs font-semibold text-stone-700">
            Hết hàng
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3">
        <div className="text-[10px] uppercase tracking-wider text-stone-500">
          {product.brand?.name ?? "Maison"}
        </div>
        <h3 className="mt-0.5 min-h-[2.5rem] text-sm font-semibold text-stone-900 line-clamp-2">
          <Link to={`/product/${product.slug}`} className="transition-colors hover:text-amber-700">
            {product.name}
          </Link>
        </h3>
        <div className="mt-1 flex items-center gap-2 text-xs text-stone-500">
          {product.concentration && <span>{product.concentration}</span>}
          {product.volume_ml && <span>{product.volume_ml}ml</span>}
          {product.category?.name && <span className="truncate">{product.category.name}</span>}
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-bold text-amber-700">{formatVnd(productPrice(product))}</span>
          {hasSale && (
            <span className="text-xs text-stone-400 line-through">
              {formatVnd(productOriginalPrice(product))}
            </span>
          )}
        </div>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!inStock}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-stone-900 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-amber-700 hover:shadow disabled:bg-stone-300 disabled:shadow-none"
          >
            {inStock ? (
              <>
                <ShoppingCart className="h-3.5 w-3.5" />
                Thêm vào giỏ
              </>
            ) : (
              "Hết hàng"
            )}
          </button>
          <button
            type="button"
            onClick={handleWishlist}
            aria-label={liked ? "Bỏ yêu thích" : "Yêu thích"}
            className="grid h-9 w-9 place-items-center rounded-xl border border-stone-200 transition-colors hover:border-rose-200 hover:bg-rose-50"
          >
            <Heart className={`h-4 w-4 ${liked ? "fill-rose-500 text-rose-500" : "text-stone-500"}`} />
          </button>
        </div>
      </div>
    </article>
  );
}
