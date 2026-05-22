import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, User, Heart, Phone, Mail, Menu, X, ChevronDown } from "lucide-react";
import { useStorefront } from "@/hooks/useStorefront";
import { useAuth } from "@/contexts/AuthContext";

const PRODUCT_MENU: { label: string; to: string }[] = [
  { label: "Nước hoa Nam", to: "/category/nam" },
  { label: "Nước hoa Nữ", to: "/category/nu" },
  { label: "Nước hoa Unisex", to: "/category/unisex" },
];

const NAV: { label: string; to: string; dropdown?: boolean }[] = [
  { label: "Trang chủ", to: "/" },
  { label: "Sản phẩm", to: "/shop", dropdown: true },
  { label: "Blog", to: "/blog" },
  { label: "Giới thiệu", to: "/about" },
  { label: "Liên hệ", to: "/contact" },
];

export default function SiteHeader({ cartCount }: { cartCount?: number }) {
  const navigate = useNavigate();
  const storefront = useStorefront();
  const { user, logout } = useAuth();
  const displayedCartCount = cartCount ?? storefront.cartCount;
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileVisible, setMobileVisible] = useState(false);
  const [mobileProductOpen, setMobileProductOpen] = useState(false);

  useEffect(() => {
    if (mobileOpen) {
      const id = requestAnimationFrame(() => setMobileVisible(true));
      return () => cancelAnimationFrame(id);
    }
  }, [mobileOpen]);

  const closeMenu = () => {
    setMobileVisible(false);
    setTimeout(() => setMobileOpen(false), 300);
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    closeMenu();
  };

  return (
    <>
      {/* Top bar */}
      <div className="bg-stone-900 text-stone-200 text-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> 0987 654 321</span>
            <span className="hidden sm:flex items-center gap-1.5"><Mail className="h-3 w-3" /> hello@maison.vn</span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/account" className="hover:text-white">Tài khoản</Link>
                <span className="opacity-50">|</span>
                <button onClick={logout} className="hover:text-white">Đăng xuất</button>
              </>
            ) : (
              <>
                <Link to="/auth/login" className="hover:text-white">Đăng nhập</Link>
                <span className="hidden sm:inline opacity-50">|</span>
                <Link to="/auth/register" className="hidden sm:inline hover:text-white">Đăng ký</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-full hover:bg-stone-100 md:hidden"
            aria-label="Mở menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-stone-900 text-white text-sm font-semibold">M</div>
            <div className="leading-tight hidden sm:block">
              <div className="text-base font-bold tracking-wide">MAISON</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-stone-500">PERFUME</div>
            </div>
            <div className="text-base font-bold tracking-wide sm:hidden">MAISON</div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 ml-4">
            {NAV.map((n) =>
              n.dropdown ? (
                <div key={n.label} className="relative group">
                  <Link
                    to={n.to}
                    className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-stone-700 hover:text-amber-700"
                  >
                    {n.label}
                    <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
                  </Link>
                  <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-2 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100">
                    <div className="w-56 rounded-lg border border-stone-200 bg-white py-2 shadow-lg">
                      <ul>
                        {PRODUCT_MENU.map((it) => (
                          <li key={it.label}>
                            <Link
                              to={it.to}
                              className="block border-b border-dashed border-stone-200 px-4 py-2.5 text-sm text-stone-700 last:border-b-0 hover:bg-stone-50 hover:text-amber-700"
                            >
                              {it.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                </div>
              ) : (
                <Link key={n.label} to={n.to} className="px-3 py-2 text-sm font-medium text-stone-700 hover:text-amber-700">
                  {n.label}
                </Link>
              )
            )}
          </nav>

          <form onSubmit={submitSearch} className="hidden lg:flex flex-1 max-w-sm ml-auto">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full rounded-full border border-input bg-stone-50 py-2 pl-10 pr-4 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:bg-white"
              />
            </div>
          </form>

          <div className="flex items-center gap-1 ml-auto lg:ml-2">
            <Link to="/search" className="grid h-10 w-10 place-items-center rounded-full hover:bg-stone-100 lg:hidden" aria-label="Tìm"><Search className="h-5 w-5" /></Link>
            <Link to="/account/wishlist" className="grid h-10 w-10 place-items-center rounded-full hover:bg-stone-100 hidden sm:grid" aria-label="Yêu thích"><Heart className="h-5 w-5" /></Link>
            <Link to="/account" className="grid h-10 w-10 place-items-center rounded-full hover:bg-stone-100 hidden sm:grid" aria-label="Tài khoản"><User className="h-5 w-5" /></Link>
            <Link to="/cart" className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-stone-100" aria-label="Giỏ hàng">
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute top-1 right-1 grid h-4 w-4 place-items-center rounded-full bg-amber-600 text-[10px] text-white">{displayedCartCount}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${mobileVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={closeMenu}
          />
          <aside
            className={`absolute left-0 top-0 h-full w-72 max-w-[80%] bg-white shadow-xl flex flex-col transition-transform duration-300 ease-out ${mobileVisible ? 'translate-x-0' : '-translate-x-full'}`}
          >
            <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
              <div className="text-base font-bold">MAISON</div>
              <button onClick={closeMenu} className="grid h-9 w-9 place-items-center rounded-full hover:bg-stone-100" aria-label="Đóng">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={submitSearch} className="border-b border-stone-200 p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm kiếm..."
                  className="w-full rounded-full border border-input bg-stone-50 py-2 pl-10 pr-4 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </form>
            <nav className="flex-1 overflow-y-auto py-2">
              {NAV.map((n) =>
                n.dropdown ? (
                  <div key={n.label} className="border-b border-stone-100">
                    <button
                      onClick={() => setMobileProductOpen((p) => !p)}
                      className="flex w-full items-center justify-between px-5 py-3 text-sm font-medium text-stone-800 hover:bg-stone-50"
                    >
                      <span>{n.label}</span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${mobileProductOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {mobileProductOpen && (
                      <ul className="px-5 pb-3">
                        <li>
                          <Link to={n.to} onClick={closeMenu} className="block py-2 text-sm font-semibold text-stone-800 hover:text-amber-700">
                            Tất cả sản phẩm
                          </Link>
                        </li>
                        {PRODUCT_MENU.map((it) => (
                          <li key={it.label}>
                            <Link to={it.to} onClick={closeMenu} className="block py-2 text-sm text-stone-700 hover:text-amber-700">
                              {it.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link key={n.label} to={n.to} onClick={closeMenu} className="block px-5 py-3 text-sm font-medium text-stone-800 hover:bg-stone-50 border-b border-stone-100">
                    {n.label}
                  </Link>
                )
              )}
              <Link to="/account" onClick={closeMenu} className="block px-5 py-3 text-sm font-medium text-stone-800 hover:bg-stone-50 border-b border-stone-100">Tài khoản</Link>
              <Link to="/cart" onClick={closeMenu} className="block px-5 py-3 text-sm font-medium text-stone-800 hover:bg-stone-50 border-b border-stone-100">Giỏ hàng</Link>
              <Link to="/account/wishlist" onClick={closeMenu} className="block px-5 py-3 text-sm font-medium text-stone-800 hover:bg-stone-50 border-b border-stone-100">Yêu thích</Link>
            </nav>
            <div className="border-t border-stone-200 p-3 flex flex-col gap-2">
              {user ? (
                <>
                  <Link to="/account" onClick={closeMenu} className="w-full rounded-md bg-stone-900 py-2.5 text-center text-sm font-semibold text-white">
                    Tài khoản
                  </Link>
                  <button onClick={() => { logout(); closeMenu(); }} className="w-full rounded-md border border-stone-300 py-2.5 text-center text-sm font-semibold text-red-600 hover:bg-red-50">
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <Link to="/auth/login" onClick={closeMenu} className="w-full rounded-md bg-stone-900 py-2.5 text-center text-sm font-semibold text-white">
                    Đăng nhập
                  </Link>
                  <Link to="/auth/register" onClick={closeMenu} className="w-full rounded-md border border-stone-300 py-2.5 text-center text-sm font-semibold text-stone-800 hover:bg-stone-50">
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
