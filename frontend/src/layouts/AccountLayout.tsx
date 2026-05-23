import { Link, NavLink } from "react-router-dom";
import { User, Package, MapPin, Heart, LogOut, Settings, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { getInitials } from "@/lib/utils";

const NAV = [
  { to: "/account",           label: "Tổng quan",           icon: User,        end: true },
  { to: "/account/profile",   label: "Thông tin tài khoản", icon: Settings },
  { to: "/account/security",  label: "Bảo mật",              icon: ShieldCheck },
  { to: "/account/addresses", label: "Địa chỉ giao hàng",   icon: MapPin },
  { to: "/account/orders",    label: "Đơn hàng của tôi",    icon: Package },
  { to: "/account/wishlist",  label: "Sản phẩm yêu thích",  icon: Heart },
  
];

interface Props {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function AccountLayout({ title, subtitle, children }: Props) {
  const { user, isLoading, logout } = useAuth();

  const handleLogout = async () => {
    await logout().then(() => toast.success("Đăng xuất thành công, hẹn gặp lại!"));
  };

  const initials = user ? getInitials(user.full_name) : '';

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <SiteHeader />

      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <nav className="text-xs text-stone-500">
            <Link to="/" className="hover:text-stone-900">Trang chủ</Link>
            <span className="mx-2">/</span>
            <Link to="/account" className="hover:text-stone-900">Tài khoản</Link>
            <span className="mx-2">/</span>
            <span className="text-stone-900">{title}</span>
          </nav>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">

          {/* Sidebar */}
          <aside className="space-y-4">
            {/* User card */}
            <div className="rounded-xl border border-stone-200 bg-white p-5">
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-44" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-full bg-stone-900 text-base font-semibold text-white">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{user?.full_name}</p>
                    <p className="truncate text-xs text-stone-500">{user?.email}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Nav */}
            <nav className="rounded-xl border border-stone-200 bg-white p-2">
              {NAV.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive ? "bg-stone-900 text-white" : "text-stone-700 hover:bg-stone-100"
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
              <button
                onClick={handleLogout}
                className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" /> Đăng xuất
              </button>
            </nav>
          </aside>

          {/* Content */}
          <section className="min-w-0 space-y-6">
            <header>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-stone-500">{subtitle}</p>}
            </header>
            {children}
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
