import { Link, NavLink, Navigate, useLocation } from "react-router-dom";
import { User, Package, MapPin, Heart, LogOut, Settings, ShieldCheck } from "lucide-react";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { useAuth } from "@/contexts/AuthContext";

const NAV = [
  { to: "/account", label: "Tổng quan", icon: User, end: true },
  { to: "/account/profile", label: "Thông tin tài khoản", icon: Settings },
  { to: "/account/orders", label: "Đơn hàng của tôi", icon: Package },
  { to: "/account/addresses", label: "Địa chỉ giao hàng", icon: MapPin },
  { to: "/account/wishlist", label: "Sản phẩm yêu thích", icon: Heart },
  { to: "/account/security", label: "Bảo mật", icon: ShieldCheck },
];

interface Props {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function AccountLayout({ title, subtitle, children }: Props) {
  const { user, isLoading, logout } = useAuth();
  const location = useLocation();

  if (isLoading) return null;

  if (!user) {
    return <Navigate to={`/auth/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  const initials = user.full_name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0].toUpperCase())
    .join('');

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
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
            <div className="rounded-xl border border-stone-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-stone-900 text-base font-semibold text-white">{initials}</div>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{user.full_name}</p>
                  <p className="truncate text-xs text-stone-500">{user.email}</p>
                </div>
              </div>
            </div>

            <nav className="rounded-xl border border-stone-200 bg-white p-2">
              {NAV.map((n) => {
                const Icon = n.icon;
                return (
                  <NavLink
                    key={n.to}
                    to={n.to}
                    end={n.end}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive ? "bg-stone-900 text-white" : "text-stone-700 hover:bg-stone-100"
                      }`
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {n.label}
                  </NavLink>
                );
              })}
              <button onClick={handleLogout} className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50">
                <LogOut className="h-4 w-4" /> Đăng xuất
              </button>
            </nav>
          </aside>

          {/* Content */}
          <section className="space-y-6 min-w-0">
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
