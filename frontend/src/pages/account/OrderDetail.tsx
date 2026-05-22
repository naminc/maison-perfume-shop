import { Link, useParams } from "react-router-dom";
import { Package, MapPin, CreditCard, Truck, Check, Phone, RotateCcw, Printer } from "lucide-react";
import AccountLayout from "@/layouts/AccountLayout";
import { perfumes } from "@/lib/demo/perfume-catalog";

const formatVnd = (n: number) => n.toLocaleString("vi-VN") + "đ";

// Demo data — in real app fetch by id
const DEMO = {
  id: "MS1024",
  date: "20/05/2026 14:32",
  status: "shipping" as const,
  items: [
    { name: "Chanel Bleu de Chanel 100ml", image: perfumes[1].image, qty: 1, price: 3290000, variant: "Full 100ml" },
    { name: "Dior Sauvage EDP 100ml", image: perfumes[0].image, qty: 1, price: 2890000, variant: "Full 100ml" },
  ],
  subtotal: 6180000,
  shipping: 30000,
  discount: 0,
  total: 6210000,
  address: {
    name: "Nguyễn Văn A",
    phone: "0987 654 321",
    line: "123 Nguyễn Huệ, P. Bến Nghé, Quận 1, TP. HCM",
  },
  payment: "Thanh toán khi nhận hàng (COD)",
  shipMethod: "Giao tiêu chuẩn 2-4 ngày",
};

const STEPS = [
  { id: "pending", label: "Đã đặt hàng", date: "20/05 14:32" },
  { id: "confirmed", label: "Xác nhận", date: "20/05 15:10" },
  { id: "shipping", label: "Đang giao", date: "21/05 09:20" },
  { id: "completed", label: "Hoàn thành", date: "" },
];

export default function OrderDetail() {
  const { id = DEMO.id } = useParams();
  const currentIdx = 2; // shipping
  const o = { ...DEMO, id };

  return (
    <AccountLayout title={`Đơn hàng #${o.id}`} subtitle={`Đặt ngày ${o.date}`}>
      <div className="space-y-5">
        {/* Tracker */}
        <section className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6">
          <h2 className="mb-5 text-sm font-semibold text-stone-700">Tình trạng đơn hàng</h2>
          <ol className="grid gap-4 sm:grid-cols-4">
            {STEPS.map((s, i) => {
              const done = i <= currentIdx;
              const active = i === currentIdx;
              return (
                <li key={s.id} className="relative flex items-start gap-3 sm:flex-col sm:items-center sm:text-center">
                  <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 ${done ? "border-emerald-600 bg-emerald-600 text-white" : "border-stone-300 bg-white text-stone-400"}`}>
                    {done ? <Check className="h-4 w-4" /> : <span className="text-xs font-semibold">{i + 1}</span>}
                  </div>
                  <div className="min-w-0">
                    <div className={`text-sm font-medium ${active ? "text-emerald-700" : done ? "text-stone-900" : "text-stone-500"}`}>{s.label}</div>
                    {s.date && <div className="mt-0.5 text-xs text-stone-500">{s.date}</div>}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          {/* Items */}
          <section className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold"><Package className="h-4 w-4" /> Sản phẩm ({o.items.length})</h2>
              <button className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900"><Printer className="h-3.5 w-3.5" /> In đơn</button>
            </div>
            <ul className="divide-y divide-stone-100">
              {o.items.map((it, i) => (
                <li key={i} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                  <img src={it.image} alt={it.name} className="h-16 w-16 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{it.name}</p>
                    <p className="text-xs text-stone-500">{it.variant} × {it.qty}</p>
                  </div>
                  <div className="text-sm font-semibold whitespace-nowrap">{formatVnd(it.price * it.qty)}</div>
                </li>
              ))}
            </ul>

            <dl className="mt-5 space-y-2 border-t border-stone-200 pt-4 text-sm">
              <Row label="Tạm tính" value={formatVnd(o.subtotal)} />
              <Row label="Vận chuyển" value={formatVnd(o.shipping)} />
              {o.discount > 0 && <Row label="Giảm giá" value={`-${formatVnd(o.discount)}`} accent />}
              <div className="flex justify-between border-t border-stone-200 pt-2 text-base font-semibold">
                <dt>Tổng cộng</dt>
                <dd className="text-amber-700">{formatVnd(o.total)}</dd>
              </div>
            </dl>
          </section>

          {/* Sidebar */}
          <aside className="space-y-4">
            <InfoCard icon={<MapPin className="h-4 w-4" />} title="Địa chỉ nhận hàng">
              <p className="font-medium text-stone-900">{o.address.name}</p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-stone-500"><Phone className="h-3 w-3" /> {o.address.phone}</p>
              <p className="mt-1.5">{o.address.line}</p>
            </InfoCard>
            <InfoCard icon={<Truck className="h-4 w-4" />} title="Vận chuyển">
              <p>{o.shipMethod}</p>
            </InfoCard>
            <InfoCard icon={<CreditCard className="h-4 w-4" />} title="Thanh toán">
              <p>{o.payment}</p>
            </InfoCard>

            <div className="flex flex-col gap-2">
              <button className="flex items-center justify-center gap-1.5 rounded-lg bg-stone-900 py-2.5 text-sm font-semibold text-white hover:bg-stone-800">
                <RotateCcw className="h-4 w-4" /> Mua lại
              </button>
              <Link to="/account/orders" className="rounded-lg border border-stone-300 py-2.5 text-center text-sm font-medium hover:bg-white">
                Quay lại danh sách
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </AccountLayout>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className="text-stone-600">{label}</dt>
      <dd className={accent ? "text-emerald-700" : "text-stone-900"}>{value}</dd>
    </div>
  );
}

function InfoCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 text-sm text-stone-700">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-stone-500">
        {icon} {title}
      </div>
      {children}
    </div>
  );
}
