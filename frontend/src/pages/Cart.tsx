import { Link } from "react-router-dom";
import { ArrowLeft, Minus, Package, Plus, ShoppingBag, Trash2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { useCartProducts } from "@/hooks/useCartProducts";
import {
  FREE_SHIPPING_THRESHOLD,
  calculateStandardShipping,
  formatVnd,
  productPrice,
} from "@/lib/product-utils";
import type { Product } from "@/types/product";

export default function Cart() {
  const {
    cart,
    cartCount,
    lines,
    purchasableLines,
    subtotal,
    productsQuery,
    hasCartIssues,
    updateCartQuantity,
    removeFromCart,
  } = useCartProducts();

  const shipping = calculateStandardShipping(subtotal);
  const total = Math.max(0, subtotal + shipping);
  const canCheckout = purchasableLines.length > 0 && !hasCartIssues;

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
        ) : productsQuery.isLoading ? (
          <CartSkeleton />
        ) : productsQuery.isError ? (
          <StateBox title="Không thể tải giỏ hàng" description="Vui lòng thử lại sau." />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <section className="space-y-3">
              {lines.map((line) => (
                <CartLineCard
                  key={line.productId}
                  line={line}
                  onRemove={() => removeFromCart(line.productId)}
                  onUpdateQuantity={(quantity) => updateCartQuantity(line.productId, quantity, line.product?.stock)}
                />
              ))}
            </section>

            <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-xl border border-stone-200 bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold">Tóm tắt đơn hàng</h2>

                {hasCartIssues && (
                  <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                    Có sản phẩm cần kiểm tra trong giỏ. Vui lòng cập nhật hoặc xoá trước khi thanh toán.
                  </div>
                )}

                <dl className="space-y-2.5 border-t border-stone-200 pt-4 text-sm">
                  <div className="flex justify-between text-stone-600">
                    <dt>Tạm tính</dt>
                    <dd>{formatVnd(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <dt className="flex items-center gap-1.5">
                      <Truck className="h-4 w-4" />
                      Phí vận chuyển
                    </dt>
                    <dd>{shipping === 0 ? <span className="text-amber-700">Miễn phí</span> : formatVnd(shipping)}</dd>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-stone-400">
                      Mua thêm {formatVnd(FREE_SHIPPING_THRESHOLD - subtotal)} để được miễn phí giao hàng.
                    </p>
                  )}
                </dl>

                <div className="mt-4 flex items-end justify-between border-t border-stone-200 pt-4">
                  <span className="text-sm text-stone-500">Tổng cộng</span>
                  <span className="text-2xl font-semibold">{formatVnd(total)}</span>
                </div>

                {canCheckout ? (
                  <Button asChild className="mt-5 h-12 w-full rounded-lg bg-stone-900 text-base text-white hover:bg-stone-800">
                    <Link to="/checkout">Thanh toán</Link>
                  </Button>
                ) : (
                  <Button disabled className="mt-5 h-12 w-full rounded-lg bg-stone-900 text-base text-white">
                    Thanh toán
                  </Button>
                )}
                <p className="mt-3 text-center text-xs text-stone-400">
                  Mã giảm giá sẽ được áp dụng ở bước thanh toán.
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

function CartLineCard({
  line,
  onRemove,
  onUpdateQuantity,
}: {
  line: ReturnType<typeof useCartProducts>["lines"][number];
  onRemove: () => void;
  onUpdateQuantity: (quantity: number) => void;
}) {
  const product = line.product;
  const unavailableText = line.unavailableReason ?? line.stockWarning;

  return (
    <article className="flex gap-4 rounded-xl border border-stone-200 bg-white p-4 sm:p-5">
      {product ? (
        <Link to={`/product/${product.slug}`} className="shrink-0">
          <ProductImage product={product} />
        </Link>
      ) : (
        <ProductImage product={null} />
      )}

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {product ? (
              <>
                <Link to={`/product/${product.slug}`} className="font-medium leading-tight hover:text-amber-700">
                  {product.name}
                </Link>
                <p className="mt-1 text-xs text-stone-500">
                  {[product.brand?.name, product.volume_ml ? `${product.volume_ml}ml` : null].filter(Boolean).join(" · ")}
                </p>
              </>
            ) : (
              <>
                <p className="font-medium leading-tight text-stone-700">Sản phẩm #{line.productId}</p>
                <p className="mt-1 text-xs text-stone-500">Không tìm thấy trong catalogue hiện tại.</p>
              </>
            )}
            {unavailableText && (
              <p className="mt-2 rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-800">{unavailableText}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onRemove}
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
              onClick={() => onUpdateQuantity(line.quantity - 1)}
              disabled={!product || line.quantity <= 1}
              className="grid h-8 w-8 place-items-center rounded-full hover:bg-stone-100 disabled:opacity-40"
              aria-label="Giảm"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-8 text-center text-sm font-medium">{line.quantity}</span>
            <button
              type="button"
              onClick={() => onUpdateQuantity(line.quantity + 1)}
              disabled={!product || line.quantity >= product.stock}
              className="grid h-8 w-8 place-items-center rounded-full hover:bg-stone-100 disabled:opacity-40"
              aria-label="Tăng"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="text-right">
            {product ? (
              <>
                <p className="font-semibold text-stone-900">{formatVnd(productPrice(product) * line.quantity)}</p>
                {line.quantity > 1 && (
                  <p className="text-xs text-stone-400">{formatVnd(productPrice(product))} / sản phẩm</p>
                )}
              </>
            ) : (
              <p className="text-xs text-stone-400">Không tính vào đơn</p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function ProductImage({ product }: { product: Product | null }) {
  if (product?.image) {
    return (
      <img
        src={product.image}
        alt={product.name}
        className="h-24 w-24 rounded-lg object-cover sm:h-28 sm:w-28"
      />
    );
  }

  return (
    <div className="grid h-24 w-24 shrink-0 place-items-center rounded-lg bg-stone-100 text-stone-400 sm:h-28 sm:w-28">
      <Package className="h-7 w-7" strokeWidth={1.5} />
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

function StateBox({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white py-16 text-center">
      <ShoppingBag className="mx-auto h-10 w-10 text-stone-300" strokeWidth={1.5} />
      <h2 className="mt-3 text-lg font-medium text-stone-900">{title}</h2>
      <p className="mt-1 text-sm text-stone-500">{description}</p>
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <section className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex gap-4 rounded-xl border border-stone-200 bg-white p-4 sm:p-5">
            <div className="h-24 w-24 animate-pulse rounded-lg bg-stone-100 sm:h-28 sm:w-28" />
            <div className="flex-1 space-y-3">
              <div className="h-4 w-2/3 animate-pulse rounded bg-stone-100" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-stone-100" />
              <div className="h-8 w-28 animate-pulse rounded-full bg-stone-100" />
            </div>
          </div>
        ))}
      </section>
      <div className="h-80 animate-pulse rounded-xl bg-stone-100" />
    </div>
  );
}
