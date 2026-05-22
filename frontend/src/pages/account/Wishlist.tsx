import { Link } from "react-router-dom";
import { Heart, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import AccountLayout from "@/layouts/AccountLayout";
import { perfumes, fmtVnd } from "@/lib/demo/perfume-catalog";
import { useStorefront } from "@/hooks/useStorefront";

export default function Wishlist() {
  const { wishlistIds, toggleWishlist, addToCart } = useStorefront();
  const items = perfumes.filter((p) => wishlistIds.includes(p.id));

  const remove = (id: string) => {
    toggleWishlist(id);
    toast.success("Đã xoá khỏi danh sách yêu thích");
  };

  const handleAddToCart = (id: string, name: string) => {
    addToCart(id);
    toast.success(`Đã thêm ${name} vào giỏ`);
  };

  return (
    <AccountLayout title="Sản phẩm yêu thích" subtitle="Những sản phẩm bạn đã lưu lại.">
      {items.length === 0 ? (
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
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((p) => (
            <article key={p.id} className="flex gap-4 rounded-xl border border-stone-200 bg-white p-4">
              <Link to={`/product/${p.slug}`} className="shrink-0">
                <img src={p.image} alt={p.name} className="h-24 w-24 rounded-lg object-cover sm:h-28 sm:w-28" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-stone-500">{p.brand}</div>
                  <h3 className="mt-0.5 font-medium leading-tight">
                    <Link to={`/product/${p.slug}`} className="hover:text-amber-700">{p.name}</Link>
                  </h3>
                  <div className="mt-1 text-sm font-semibold text-amber-700">{fmtVnd(p.price)}</div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={!p.inStock}
                    onClick={() => handleAddToCart(p.id, p.name)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-stone-900 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-amber-700 hover:shadow disabled:bg-stone-300 disabled:shadow-none"
                  >
                    {p.inStock ? (
                      <>
                        <span className="relative inline-flex">
                          <ShoppingBag className="h-3.5 w-3.5" />
                          <Plus className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-amber-500 text-white" strokeWidth={4} />
                        </span>
                        Thêm vào giỏ
                      </>
                    ) : "Hết hàng"}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(p.id)}
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
