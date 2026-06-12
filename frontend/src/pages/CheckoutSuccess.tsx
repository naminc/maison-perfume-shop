import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { CheckCircle2, Package, Mail } from "lucide-react";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { formatVnd } from "@/lib/product-utils";

export default function CheckoutSuccess() {
  const { state } = useLocation() as { state?: { orderId?: string; total?: number; email?: string } };
  const fallbackOrderId = useMemo(() => "MS" + Math.floor(1000 + Math.random() * 9000), []);
  const orderId = state?.orderId ?? fallbackOrderId;
  const email = state?.email ?? "ban@email.com";

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <SiteHeader />

      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-20">
        <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center sm:p-12">
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Đặt hàng thành công!</h1>
          <p className="mt-2 text-sm text-stone-500 sm:text-base">
            Cảm ơn bạn đã mua sắm tại Maison. Chúng tôi sẽ liên hệ xác nhận đơn hàng trong ít phút.
          </p>

          <div className="mt-6 rounded-xl bg-stone-50 p-5 text-left">
            <div className="flex items-center justify-between text-sm">
              <div className="text-stone-500">Mã đơn hàng</div>
              <div className="font-semibold text-stone-900">#{orderId}</div>
            </div>
            {typeof state?.total === "number" && (
              <div className="mt-3 flex items-center justify-between text-sm">
                <div className="text-stone-500">Tổng thanh toán</div>
                <div className="font-semibold text-stone-900">{formatVnd(state.total)}</div>
              </div>
            )}
            <div className="mt-3 flex items-center gap-2 text-xs text-stone-500">
              <Mail className="h-3.5 w-3.5" />
              Email xác nhận đã được gửi tới <span className="font-medium text-stone-700">{email}</span>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link to={`/account/orders/${orderId}`} className="inline-flex items-center justify-center gap-2 rounded-lg bg-stone-900 px-6 py-3 text-sm font-semibold text-white hover:bg-stone-800">
              <Package className="h-4 w-4" /> Xem chi tiết đơn
            </Link>
            <Link to="/shop" className="inline-flex items-center justify-center rounded-lg border border-stone-300 px-6 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50">
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-stone-500">
          Cần hỗ trợ? Liên hệ <Link to="/contact" className="text-amber-700 hover:underline">đội ngũ Maison</Link>
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}
