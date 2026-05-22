import { Link } from "react-router-dom";
import { Package, MapPin, Heart, ChevronRight, Gift } from "lucide-react";
import AccountLayout from "@/layouts/AccountLayout";
import { useAuth } from "@/contexts/AuthContext";

const STATS = [
  { label: "Đơn hàng", value: "12", icon: Package, href: "/account/orders" },
  { label: "Địa chỉ", value: "3", icon: MapPin, href: "/account/addresses" },
  { label: "Yêu thích", value: "8", icon: Heart, href: "/account/wishlist" },
];

const RECENT = [
  { id: "MS1024", date: "20/05/2026", status: "Đang giao", total: 3740000 },
  { id: "MS1018", date: "12/05/2026", status: "Hoàn thành", total: 1290000 },
  { id: "MS1009", date: "01/05/2026", status: "Hoàn thành", total: 890000 },
];

const formatVnd = (n: number) => n.toLocaleString("vi-VN") + "đ";

export default function AccountOverview() {
  const { user } = useAuth();

  return (
    <AccountLayout title={`Xin chào, ${user?.full_name ?? ''}`} subtitle="Quản lý đơn hàng, địa chỉ và thông tin cá nhân của bạn.">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} to={s.href} className="group rounded-xl border border-stone-200 bg-white p-5 transition-colors hover:border-stone-400">
              <div className="flex items-center justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-amber-50 text-amber-700">
                  <Icon className="h-5 w-5" />
                </div>
                <ChevronRight className="h-4 w-4 text-stone-400 transition-transform group-hover:translate-x-0.5" />
              </div>
              <p className="mt-4 text-2xl font-semibold">{s.value}</p>
              <p className="text-sm text-stone-500">{s.label}</p>
            </Link>
          );
        })}
      </div>

      {/* Promo */}
      <div className="flex flex-col gap-4 rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-stone-50 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-amber-600 text-white">
            <Gift className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold">Thành viên Gold</h3>
            <p className="text-sm text-stone-600">Bạn đã tích luỹ 1.250 điểm thưởng. Còn 750 điểm để lên hạng Platinum.</p>
          </div>
        </div>
        <button className="rounded-lg border border-amber-700 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100">Xem ưu đãi</button>
      </div>

      {/* Recent orders */}
      <section className="rounded-xl border border-stone-200 bg-white">
        <header className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
          <h2 className="font-semibold">Đơn hàng gần đây</h2>
          <Link to="/account/orders" className="text-xs font-medium text-amber-700 hover:underline">Xem tất cả</Link>
        </header>
        <ul className="divide-y divide-stone-100">
          {RECENT.map((o) => (
            <li key={o.id} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="font-medium">#{o.id}</p>
                <p className="text-xs text-stone-500">{o.date}</p>
              </div>
              <div className="flex items-center gap-6">
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${o.status === "Hoàn thành" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{o.status}</span>
                <span className="font-semibold">{formatVnd(o.total)}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </AccountLayout>
  );
}
