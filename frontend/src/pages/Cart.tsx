import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Minus, Plus, ShoppingBag, Tag, Trash2, Truck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { fmtVnd } from "@/lib/demo/perfume-catalog";
import { useStorefront } from "@/hooks/useStorefront";

export default function Cart() {
  const {
    cart,
    cartCount,
    subtotal,
    discount,
    shipping,
    total,
    couponCode,
    applyCouponCode,
    clearCouponCode,
    updateCartQuantity,
    removeFromCart,
  } = useStorefront();
  const [coupon, setCoupon] = useState(couponCode);

  const applyCoupon = () => {
    if (!coupon.trim()) return;
    if (applyCouponCode(coupon)) {
      toast.success("Đã áp dụng mã MAISON10");
    } else {
      toast.error("Mã giảm giá không hợp lệ");
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <SiteHeader />

      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <nav className="text-xs text-stone-500">
            <Link to="/" className="hover:text-stone-900">Trang chủ</Link>
            <span className="mx-2">/</span>
            <span className="text-stone-900">Giỏ hàng</span>
          </nav>
          <Link to="/shop" className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900">
            <ArrowLeft className="h-3.5 w-3.5" /> Tiếp tục mua sắm
          </Link>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
        <h1 className="mb-2 text-3xl font-semibold tracking-tight">Giỏ hàng</h1>
        <p className="mb-8 text-sm text-stone-500">
          {cartCount > 0 ? `Bạn đang có ${cartCount} sản phẩm trong giỏ` : "Chưa có sản phẩm nào"}
        </p>

        {cart.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <section className="space-y-3">
              {cart.map(({ product, quantity }) => (
                <article
                  key={product.id}
                  className="flex gap-4 rounded-xl border border-stone-200 bg-white p-4 sm:p-5"
                >
                  <Link to={`/product/${product.slug}`} className="shrink-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-24 w-24 rounded-lg object-cover sm:h-28 sm:w-28"
                    />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link to={`/product/${product.slug}`} className="font-medium leading-tight hover:text-amber-700">
                          {product.name}
                        </Link>
                        <p className="mt-1 text-xs text-stone-500">{product.brand} · {product.volume}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(product.id)}
                        className="grid h-8 w-8 place-items-center rounded-full text-stone-400 hover:bg-stone-100 hover:text-red-600"
                        aria-label="Xoá"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center rounded-full border border-stone-300 bg-white">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(product.id, quantity - 1)}
                          className="grid h-8 w-8 place-items-center rounded-full hover:bg-stone-100"
                          aria-label="Giảm"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(product.id, quantity + 1)}
                          className="grid h-8 w-8 place-items-center rounded-full hover:bg-stone-100"
                          aria-label="Tăng"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-stone-900">{fmtVnd(product.price * quantity)}</p>
                        {quantity > 1 && (
                          <p className="text-xs text-stone-400">{fmtVnd(product.price)} / sản phẩm</p>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-xl border border-stone-200 bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold">Tóm tắt đơn hàng</h2>

                <div className="mb-4 flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                    <Input
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      placeholder="Nhập MAISON10"
                      className="h-10 rounded-lg border-input bg-stone-50 pl-9"
                    />
                  </div>
                  <Button type="button" variant="outline" onClick={applyCoupon} className="h-10 rounded-lg border-stone-300">
                    Áp dụng
                  </Button>
                </div>

                <dl className="space-y-2.5 border-t border-stone-200 pt-4 text-sm">
                  <div className="flex justify-between text-stone-600">
                    <dt>Tạm tính</dt>
                    <dd>{fmtVnd(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <dt className="flex items-center gap-1.5"><Truck className="h-4 w-4" />Phí vận chuyển</dt>
                    <dd>{shipping === 0 ? <span className="text-amber-700">Miễn phí</span> : fmtVnd(shipping)}</dd>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <dt>Giảm giá</dt>
                      <dd className="flex items-center gap-2">
                        -{fmtVnd(discount)}
                        <button
                          type="button"
                          onClick={() => {
                            clearCouponCode();
                            setCoupon("");
                          }}
                          className="text-[11px] font-medium text-stone-500 underline"
                        >
                          bỏ
                        </button>
                      </dd>
                    </div>
                  )}
                  {shipping > 0 && (
                    <p className="text-xs text-stone-400">
                      Mua thêm {fmtVnd(500000 - subtotal)} để được miễn phí giao hàng.
                    </p>
                  )}
                </dl>

                <div className="mt-4 flex items-end justify-between border-t border-stone-200 pt-4">
                  <span className="text-sm text-stone-500">Tổng cộng</span>
                  <span className="text-2xl font-semibold">{fmtVnd(total)}</span>
                </div>

                <Button asChild className="mt-5 h-12 w-full rounded-lg bg-stone-900 text-base text-white hover:bg-stone-800">
                  <Link to="/checkout">Thanh toán</Link>
                </Button>
                <p className="mt-3 text-center text-xs text-stone-400">
                  Phí vận chuyển và ưu đãi sẽ được xác nhận ở bước thanh toán.
                </p>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-stone-700">
                <p className="font-medium text-amber-900">Cam kết Maison</p>
                <p className="mt-1">Hàng chính hãng, đóng gói chống sốc và hỗ trợ đổi trả theo chính sách.</p>
              </div>
            </aside>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="rounded-xl border border-stone-200 bg-white py-16 text-center">
      <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-stone-100">
        <ShoppingBag className="h-7 w-7 text-stone-400" />
      </div>
      <h2 className="text-lg font-medium">Giỏ hàng đang trống</h2>
      <p className="mt-1 text-sm text-stone-500">Khám phá bộ sưu tập nước hoa chính hãng của Maison.</p>
      <Button asChild className="mt-6 h-11 rounded-lg bg-stone-900 px-6 text-white hover:bg-stone-800">
        <Link to="/shop">Mua sắm ngay</Link>
      </Button>
    </div>
  );
}
