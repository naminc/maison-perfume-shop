import { Link } from "react-router-dom";
import { Heart, Package, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import AccountLayout from "@/layouts/AccountLayout";
import { useProducts } from "@/hooks/useProducts";
import { useStorefront } from "@/hooks/useStorefront";
import { formatVnd, productPrice } from "@/lib/product-utils";
import type { Product } from "@/types/product";

export default function Wishlist() {
  const { wishlistIds, toggleWishlist, addToCart } = useStorefront();
  const productsQuery = useProducts({ per_page: 100 });
  const products = productsQuery.data?.data ?? [];
  const items = products.filter((product) => wishlistIds.includes(product.id));

  const remove = (id: number) => {
    toggleWishlist(id);
    toast.success("Đã xoá khỏi danh sách yêu thích");
  };

  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) return;
    addToCart(product.id, 1, product.stock);
    toast.success(`Đã thêm ${product.name} vào giỏ`);
  };

  return (
    <AccountLayout title="Sản phẩm yêu thích" subtitle="Những sản phẩm bạn đã lưu lại.">
      {productsQuery.isLoading ? (
        <WishlistSkeleton />
      ) : productsQuery.isError ? (
        <StateBox title="Không thể tải danh sách yêu thích" description="Vui lòng thử lại sau." />
      ) : items.length === 0 ? (
        <EmptyWishlist />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((product) => (
            <article key={product.id} className="flex gap-4 rounded-xl border border-stone-200 bg-white p-4">
              <Link to={`/product/${product.slug}`} className="shrink-0">
                <ProductImage product={product} />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-stone-500">
                    {product.brand?.name ?? "Maison"}
                  </div>
                  <h3 className="mt-0.5 font-medium leading-tight">
                    <Link to={`/product/${product.slug}`} className="hover:text-amber-700">{product.name}</Link>
                  </h3>
                  <div className="mt-1 text-sm font-semibold text-amber-700">{formatVnd(productPrice(product))}</div>
                  {product.volume_ml && <div className="mt-0.5 text-xs text-stone-500">{product.volume_ml}ml</div>}
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={product.stock <= 0}
                    onClick={() => handleAddToCart(product)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-stone-900 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-amber-700 hover:shadow disabled:bg-stone-300 disabled:shadow-none"
                  >
                    {product.stock > 0 ? (
                      <>
                        <ShoppingCart className="h-3.5 w-3.5" />
                        Thêm vào giỏ
                      </>
                    ) : "Hết hàng"}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(product.id)}
                    aria-label="Xoá"
                    className="grid h-9 w-9 place-items-center rounded-xl border border-stone-200 text-stone-500 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </AccountLayout>
  );
}

function ProductImage({ product }: { product: Product }) {
  if (product.image) {
    return (
      <img
        src={product.image}
        alt={product.name}
        className="h-24 w-24 rounded-lg object-cover sm:h-28 sm:w-28"
      />
    );
  }

  return (
    <div className="grid h-24 w-24 place-items-center rounded-lg bg-stone-100 text-stone-400 sm:h-28 sm:w-28">
      <Package className="h-7 w-7" strokeWidth={1.5} />
    </div>
  );
}

function EmptyWishlist() {
  return (
    <div className="rounded-xl border border-stone-200 bg-white py-16 text-center">
      <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-stone-100">
        <Heart className="h-7 w-7 text-stone-400" />
      </div>
      <h2 className="text-lg font-medium">Chưa có sản phẩm yêu thích</h2>
      <p className="mt-1 text-sm text-stone-500">Khám phá bộ sưu tập và lưu lại mùi hương bạn thích.</p>
      <Link to="/shop" className="mt-6 inline-block rounded-lg bg-stone-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-stone-800">
        Khám phá ngay
      </Link>
    </div>
  );
}

function StateBox({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white py-16 text-center">
      <Heart className="mx-auto h-10 w-10 text-stone-300" strokeWidth={1.5} />
      <h2 className="mt-3 text-lg font-medium text-stone-900">{title}</h2>
      <p className="mt-1 text-sm text-stone-500">{description}</p>
    </div>
  );
}

function WishlistSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex gap-4 rounded-xl border border-stone-200 bg-white p-4">
          <div className="h-24 w-24 animate-pulse rounded-lg bg-stone-100 sm:h-28 sm:w-28" />
          <div className="flex-1 space-y-3">
            <div className="h-3 w-1/3 animate-pulse rounded bg-stone-100" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-stone-100" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-stone-100" />
            <div className="h-9 w-full animate-pulse rounded-xl bg-stone-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
