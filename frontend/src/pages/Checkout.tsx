import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, Check, CreditCard, ShoppingBag, Truck, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { fmtVnd } from "@/lib/demo/perfume-catalog";
import { useStorefront } from "@/hooks/useStorefront";

const SHIP_OPTIONS = [
  { id: "standard", label: "Giao tiêu chuẩn", desc: "2-4 ngày", fee: 30000 },
  { id: "express", label: "Giao nhanh", desc: "Trong 24h tại nội thành", fee: 60000 },
];

const PAY_OPTIONS = [
  { id: "cod", label: "Thanh toán khi nhận hàng (COD)", icon: Wallet },
  { id: "bank", label: "Chuyển khoản ngân hàng", icon: Building2 },
  { id: "card", label: "Thẻ tín dụng / ghi nợ", icon: CreditCard },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, cartCount, subtotal, discount, clearCart } = useStorefront();
  const [ship, setShip] = useState("standard");
  const [pay, setPay] = useState("cod");

  const selectedShip = SHIP_OPTIONS.find((s) => s.id === ship) ?? SHIP_OPTIONS[0];
  const shipping = ship === "standard" && subtotal >= 500000 ? 0 : selectedShip.fee;
  const total = Math.max(0, subtotal + shipping - discount);

  const placeOrder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error("Giỏ hàng đang trống");
      return;
    }

    const orderId = "MS" + Math.floor(1000 + Math.random() * 9000);
    const email = (e.currentTarget.elements.namedItem("email") as HTMLInputElement | null)?.value;
    const orderItems = cart.map(({ product, quantity }) => ({
      id: product.id,
      name: product.name,
      quantity,
      price: product.price,
    }));

    toast.success("Đặt hàng thành công! Mã đơn #" + orderId);
    navigate("/checkout/success", { state: { orderId, total, email, items: orderItems } });
    clearCart();
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <SiteHeader />

      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <nav className="text-xs text-stone-500">
            <Link to="/" className="hover:text-stone-900">Trang chủ</Link>
            <span className="mx-2">/</span>
            <Link to="/cart" className="hover:text-stone-900">Giỏ hàng</Link>
            <span className="mx-2">/</span>
            <span className="text-stone-900">Thanh toán</span>
          </nav>
          <Link to="/cart" className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900">
            <ArrowLeft className="h-3.5 w-3.5" /> Quay lại giỏ hàng
          </Link>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
        <h1 className="mb-8 text-3xl font-semibold tracking-tight">Thanh toán</h1>

        {cart.length === 0 ? (
          <div className="rounded-xl border border-stone-200 bg-white py-16 text-center">
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-stone-100">
              <ShoppingBag className="h-7 w-7 text-stone-400" />
            </div>
            <h2 className="text-lg font-medium">Chưa có sản phẩm để thanh toán</h2>
            <p className="mt-1 text-sm text-stone-500">Thêm sản phẩm vào giỏ trước khi đặt hàng.</p>
            <Button asChild className="mt-6 h-11 rounded-lg bg-stone-900 px-6 text-white hover:bg-stone-800">
              <Link to="/shop">Quay lại cửa hàng</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={placeOrder} className="grid gap-8 lg:grid-cols-[1fr_400px]">
            <div className="space-y-6">
              <section className="rounded-xl border border-stone-200 bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold">Thông tin giao hàng</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Họ và tên" name="name" placeholder="Nguyễn Văn A" required />
                  <Field label="Số điện thoại" name="phone" placeholder="09xx xxx xxx" required />
                  <div className="sm:col-span-2">
                    <Field label="Email" name="email" type="email" placeholder="email@example.com" required />
                  </div>
                  <Field label="Tỉnh / Thành phố" name="city" placeholder="TP. Hồ Chí Minh" required />
                  <Field label="Quận / Huyện" name="district" placeholder="Quận 1" required />
                  <div className="sm:col-span-2">
                    <Field label="Địa chỉ cụ thể" name="addr" placeholder="Số nhà, tên đường, phường..." required />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="mb-1.5 block text-sm font-medium text-stone-700">Ghi chú</Label>
                    <Textarea name="note" placeholder="Lưu ý cho người giao hàng (tuỳ chọn)" className="min-h-[80px] rounded-lg border-input bg-stone-50" />
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-stone-200 bg-white p-6">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold"><Truck className="h-5 w-5" />Phương thức vận chuyển</h2>
                <div className="space-y-2">
                  {SHIP_OPTIONS.map((option) => {
                    const fee = option.id === "standard" && subtotal >= 500000 ? 0 : option.fee;
                    return (
                      <Option key={option.id} active={ship === option.id} onClick={() => setShip(option.id)}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-stone-500">{option.desc}</div>
                        </div>
                        <div className="font-semibold">{fee === 0 ? "Miễn phí" : fmtVnd(fee)}</div>
                      </Option>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-xl border border-stone-200 bg-white p-6">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold"><CreditCard className="h-5 w-5" />Phương thức thanh toán</h2>
                <div className="space-y-2">
                  {PAY_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    return (
                      <Option key={option.id} active={pay === option.id} onClick={() => setPay(option.id)}>
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-stone-600" />
                          <span className="font-medium">{option.label}</span>
                        </div>
                      </Option>
                    );
                  })}
                </div>
              </section>
            </div>

            <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-xl border border-stone-200 bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold">Đơn hàng ({cartCount})</h2>

                <ul className="space-y-3 border-b border-stone-200 pb-4">
                  {cart.map(({ product, quantity }) => (
                    <li key={product.id} className="flex gap-3">
                      <div className="relative shrink-0">
                        <img src={product.image} alt={product.name} className="h-14 w-14 rounded-lg object-cover" />
                        <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-stone-900 text-[10px] text-white">{quantity}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-stone-500">{product.brand} · {product.volume}</p>
                      </div>
                      <div className="text-sm font-semibold">{fmtVnd(product.price * quantity)}</div>
                    </li>
                  ))}
                </ul>

                <dl className="space-y-2.5 py-4 text-sm">
                  <div className="flex justify-between text-stone-600"><dt>Tạm tính</dt><dd>{fmtVnd(subtotal)}</dd></div>
                  <div className="flex justify-between text-stone-600"><dt>Vận chuyển</dt><dd>{shipping === 0 ? "Miễn phí" : fmtVnd(shipping)}</dd></div>
                  {discount > 0 && <div className="flex justify-between text-emerald-700"><dt>Giảm giá</dt><dd>-{fmtVnd(discount)}</dd></div>}
                </dl>

                <div className="flex items-end justify-between border-t border-stone-200 pt-4">
                  <span className="text-sm text-stone-500">Tổng cộng</span>
                  <span className="text-2xl font-semibold">{fmtVnd(total)}</span>
                </div>

                <Button type="submit" className="mt-5 h-12 w-full rounded-lg bg-stone-900 text-base text-white hover:bg-stone-800">
                  Đặt hàng
                </Button>
                <p className="mt-3 text-center text-xs text-stone-400">Bằng việc đặt hàng, bạn đồng ý với điều khoản của Maison.</p>
              </div>
            </aside>
          </form>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

function Field({ label, name, type = "text", placeholder, required }: { label: string; name: string; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <div>
      <Label htmlFor={name} className="mb-1.5 block text-sm font-medium text-stone-700">{label}{required && <span className="text-red-500"> *</span>}</Label>
      <Input id={name} name={name} type={type} placeholder={placeholder} required={required} className="h-11 rounded-lg border-input bg-stone-50 focus-visible:ring-amber-500" />
    </div>
  );
}

function Option({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-lg border p-4 text-left transition-colors ${
        active ? "border-stone-900 bg-stone-50" : "border-stone-200 hover:border-stone-400"
      }`}
    >
      <div className="flex flex-1 items-center justify-between gap-4">{children}</div>
      <div className={`ml-4 grid h-5 w-5 place-items-center rounded-full border-2 ${active ? "border-stone-900 bg-stone-900" : "border-stone-300"}`}>
        {active && <Check className="h-3 w-3 text-white" />}
      </div>
    </button>
  );
}
