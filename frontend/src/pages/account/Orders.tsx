import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Package, Search, ChevronRight } from "lucide-react";
import AccountLayout from "@/layouts/AccountLayout";
import { Input } from "@/components/ui/input";
import { perfumes } from "@/lib/demo/perfume-catalog";

type Status = "all" | "pending" | "shipping" | "completed" | "cancelled";

interface Order {
  id: string;
  date: string;
  status: Exclude<Status, "all">;
  items: { name: string; image: string; qty: number }[];
  total: number;
}

const ORDERS: Order[] = [
  {
    id: "MS1024",
    date: "20/05/2026",
    status: "shipping",
    items: [
      { name: "Chanel Bleu de Chanel 100ml", image: perfumes[1].image, qty: 1 },
      { name: "Dior Sauvage EDP 100ml", image: perfumes[0].image, qty: 1 },
    ],
    total: 3240000,
  },
  {
    id: "MS1018",
    date: "12/05/2026",
    status: "completed",
    items: [{ name: "Victoria's Secret Body Mist 250ml", image: perfumes[2].image, qty: 2 }],
    total: 900000,
  },
  {
    id: "MS1009",
    date: "01/05/2026",
    status: "completed",
    items: [{ name: "Tom Ford Oud Wood 50ml", image: perfumes[3].image, qty: 1 }],
    total: 4500000,
  },
  {
    id: "MS1003",
    date: "22/04/2026",
    status: "cancelled",
    items: [{ name: "Versace Eros 100ml", image: perfumes[4].image, qty: 1 }],
    total: 2100000,
  },
  {
    id: "MS0999",
    date: "15/04/2026",
    status: "pending",
    items: [{ name: "YSL Libre 90ml", image: perfumes[5].image, qty: 1 }],
    total: 2890000,
  },
];

const TABS: { id: Status; label: string }[] = [
  { id: "all", label: "Tất cả" },
  { id: "pending", label: "Chờ xử lý" },
  { id: "shipping", label: "Đang giao" },
  { id: "completed", label: "Hoàn thành" },
  { id: "cancelled", label: "Đã huỷ" },
];

const PAGE_SIZE = 3;

const STATUS_BADGE: Record<Order["status"], { label: string; cls: string }> = {
  pending: { label: "Chờ xử lý", cls: "bg-stone-100 text-stone-700" },
  shipping: { label: "Đang giao", cls: "bg-amber-50 text-amber-700" },
  completed: { label: "Hoàn thành", cls: "bg-emerald-50 text-emerald-700" },
  cancelled: { label: "Đã huỷ", cls: "bg-red-50 text-red-700" },
};

const formatVnd = (n: number) => n.toLocaleString("vi-VN") + "đ";

export default function Orders() {
  const [tab, setTab] = useState<Status>("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () =>
      ORDERS.filter((o) => tab === "all" || o.status === tab).filter((o) =>
        o.id.toLowerCase().includes(q.toLowerCase())
      ),
    [q, tab],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const paged = filtered.slice(start, start + PAGE_SIZE);
  const from = filtered.length === 0 ? 0 : start + 1;
  const to = Math.min(start + PAGE_SIZE, filtered.length);

  const updateTab = (next: Status) => {
    setTab(next);
    setPage(1);
  };

  const updateSearch = (value: string) => {
    setQ(value);
    setPage(1);
  };

  return (
    <AccountLayout title="Đơn hàng của tôi" subtitle="Theo dõi và quản lý tất cả đơn hàng của bạn.">
      {/* Tabs + search */}
      <div className="rounded-xl border border-stone-200 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
          <div className="flex gap-1 overflow-x-auto -mx-1 px-1 min-w-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => updateTab(t.id)}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  tab === t.id ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <Input
              value={q}
              onChange={(e) => updateSearch(e.target.value)}
              placeholder="Tìm mã đơn..."
              className="h-10 rounded-lg border-input bg-stone-50 pl-9"
            />
          </div>
        </div>
      </div>

      {/* Orders */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-white py-16 text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-stone-100">
            <Package className="h-7 w-7 text-stone-400" />
          </div>
          <h2 className="text-lg font-medium">Không có đơn hàng nào</h2>
          <p className="mt-1 text-sm text-stone-500">Thử thay đổi bộ lọc hoặc tìm kiếm.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
          {paged.map((o) => {
            const badge = STATUS_BADGE[o.status];
            return (
              <article key={o.id} className="rounded-xl border border-stone-200 bg-white">
                <header className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">#{o.id}</span>
                    <span className="text-xs text-stone-500">{o.date}</span>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badge.cls}`}>{badge.label}</span>
                </header>

                <div className="space-y-3 px-5 py-4">
                  {o.items.map((it, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <img src={it.image} alt={it.name} className="h-14 w-14 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium">{it.name}</p>
                        <p className="text-xs text-stone-500">x{it.qty}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 bg-stone-50/60 px-5 py-3">
                  <div className="text-sm text-stone-500">
                    Tổng tiền: <span className="text-base font-semibold text-stone-900">{formatVnd(o.total)}</span>
                  </div>
                  <div className="flex gap-2">
                    {o.status === "completed" && (
                      <button className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium hover:bg-white">Mua lại</button>
                    )}
                    <Link to={`/account/orders/${o.id}`} className="flex items-center gap-1 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800">
                      Chi tiết <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </footer>
              </article>
            );
          })}
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-stone-500">
              Hiển thị <span className="font-medium text-stone-900">{from}-{to}</span> trong <span className="font-medium text-stone-900">{filtered.length}</span> đơn hàng
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Trước
              </button>
              <span className="min-w-16 text-center text-sm text-stone-500">
                {currentPage}/{totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          </div>
        </>
      )}
    </AccountLayout>
  );
}
