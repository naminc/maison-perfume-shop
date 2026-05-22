import { Link } from "react-router-dom";
import { Search, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <SiteHeader />
      <main className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center sm:py-24">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-amber-50 text-amber-700">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-stone-500">404</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Trang không tồn tại</h1>
        <p className="mt-3 text-sm leading-6 text-stone-500 sm:text-base">
          Đường dẫn bạn mở có thể đã thay đổi hoặc sản phẩm không còn được hiển thị.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Button asChild className="h-11 rounded-lg bg-stone-900 px-6 text-white hover:bg-stone-800">
            <Link to="/shop">Quay lại cửa hàng</Link>
          </Button>
          <Button asChild variant="outline" className="h-11 rounded-lg border-stone-300 px-6">
            <Link to="/search" className="inline-flex items-center gap-2">
              <Search className="h-4 w-4" /> Tìm sản phẩm
            </Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
