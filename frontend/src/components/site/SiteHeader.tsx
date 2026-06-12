import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, Heart, Mail, Menu, Phone, Search, ShoppingBag, User, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getBrandParts, getPhoneHref } from "@/constants/site-settings";
import { useBrands } from "@/hooks/useBrands";
import { useCategories } from "@/hooks/useCategories";
import { usePublicSettings } from "@/hooks/usePublicSettings";
import { useStorefront } from "@/hooks/useStorefront";
import { formatVietnamPhone } from "@/lib/phone";
import type { Category } from "@/types/category";

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
  const { settings } = usePublicSettings();
  const brandsQuery = useBrands();
  const categoriesQuery = useCategories();
  const brand = getBrandParts(settings.store_name);
  const phoneHref = getPhoneHref(settings.phone);
  const displayedPhone = formatVietnamPhone(settings.phone);
  const displayedCartCount = cartCount ?? storefront.cartCount;
  const productMenu = useMemo(
    () => flattenCategories(categoriesQuery.data ?? []).map((category) => ({
      label: category.name,
      to: `/shop?category=${category.slug}`,
    })),
    [categoriesQuery.data],
  );
  const brandMenu = useMemo(
    () => (brandsQuery.data ?? []).map((item) => ({
      label: item.name,
      to: `/shop?brand=${item.slug}`,
    })),
    [brandsQuery.data],
  );
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

  const handleLogout = () => {
    logout().then(() => toast.success("Đăng xuất thành công, hẹn gặp lại!"));
    closeMenu();
  };

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    closeMenu();
  };

  return (
    <>
      <div className="bg-stone-900 text-xs text-stone-200">
        <div className="mx-auto flex min-h-9 max-w-7xl items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-4">
            {settings.phone && (
              <a href={phoneHref} className="flex items-center gap-1.5 hover:text-white">
                <Phone className="h-3 w-3" /> {displayedPhone}
              </a>
            )}
            {settings.contact_email && (
              <a href={`mailto:${settings.contact_email}`} className="hidden items-center gap-1.5 hover:text-white sm:flex">
                <Mail className="h-3 w-3" /> {settings.contact_email}
              </a>
            )}
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {user.role === "admin" && (
                  <>
                    <Link to="/admin/dashboard" className="inline-flex items-center gap-1.5 font-medium hover:text-white">
                      Quản lý cửa hàng
                    </Link>
                    <span className="opacity-50">|</span>
                  </>
                )}
                <Link to="/account" className="hover:text-white">Tài khoản</Link>
                <span className="opacity-50">|</span>
                <button onClick={handleLogout} className="hover:text-white">Đăng xuất</button>
              </>
            ) : (
              <>
                <Link to="/auth/login" className="hover:text-white">Đăng nhập</Link>
                <span className="hidden opacity-50 sm:inline">|</span>
                <Link to="/auth/register" className="hidden hover:text-white sm:inline">Đăng ký</Link>
              </>
            )}
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-full hover:bg-stone-100 md:hidden"
            aria-label="Mở menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link to="/" className="flex shrink-0 items-center gap-2">
            {settings.logo ? (
              <img src={settings.logo} alt={settings.store_name} className="h-9 w-9 rounded-full object-contain" />
            ) : (
              <div className="grid h-9 w-9 place-items-center rounded-full bg-stone-900 text-sm font-semibold text-white">
                {brand.primary.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="hidden leading-tight sm:block">
              <div className="text-base font-bold uppercase tracking-wide">{brand.primary}</div>
              {brand.secondary && (
                <div className="text-[10px] uppercase tracking-[0.2em] text-stone-500">{brand.secondary}</div>
              )}
            </div>
            <div className="text-base font-bold uppercase tracking-wide sm:hidden">{brand.primary}</div>
          </Link>

          <nav className="ml-4 hidden items-center gap-1 md:flex">
            {NAV.map((item) =>
              item.dropdown ? (
                <div key={item.label} className="group relative">
                  <Link
                    to={item.to}
                    className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-stone-700 hover:text-amber-700"
                  >
                    {item.label}
                    <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
                  </Link>
                  <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-2 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100">
                    <div className="w-[520px] rounded-lg border border-stone-200 bg-white p-4 shadow-lg">
                      <div className="grid grid-cols-2 gap-5">
                        <div>
                          <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                            Danh mục
                          </div>
                          <ul className="space-y-0.5">
                            {productMenu.map((category) => (
                              <li key={category.to}>
                                <Link
                                  to={category.to}
                                  className="block rounded-md px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 hover:text-amber-700"
                                >
                                  {category.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                        {brandMenu.length > 0 && (
                          <div className="border-l border-dashed border-stone-200 pl-5">
                            <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                              Thương hiệu
                            </div>
                            <ul className="grid grid-cols-1 gap-0.5">
                              {brandMenu.map((brandItem) => (
                                <li key={brandItem.to}>
                                  <Link
                                    to={brandItem.to}
                                    className="block rounded-md px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 hover:text-amber-700"
                                  >
                                    {brandItem.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link key={item.label} to={item.to} className="px-3 py-2 text-sm font-medium text-stone-700 hover:text-amber-700">
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <form onSubmit={submitSearch} className="ml-auto hidden max-w-sm flex-1 lg:flex">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full rounded-full border border-input bg-stone-50 py-2 pl-10 pr-4 text-sm focus-visible:bg-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </form>

          <div className="ml-auto flex items-center gap-1 lg:ml-2">
            <Link to="/search" className="grid h-10 w-10 place-items-center rounded-full hover:bg-stone-100 lg:hidden" aria-label="Tìm">
              <Search className="h-5 w-5" />
            </Link>
            <Link to="/account/wishlist" className="hidden h-10 w-10 place-items-center rounded-full hover:bg-stone-100 sm:grid" aria-label="Yêu thích">
              <Heart className="h-5 w-5" />
            </Link>
            <Link to="/account" className="hidden h-10 w-10 place-items-center rounded-full hover:bg-stone-100 sm:grid" aria-label="Tài khoản">
              <User className="h-5 w-5" />
            </Link>
            <Link to="/cart" className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-stone-100" aria-label="Giỏ hàng">
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-amber-600 text-[10px] text-white">
                {displayedCartCount}
              </span>
            </Link>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${mobileVisible ? "opacity-100" : "opacity-0"}`}
            onClick={closeMenu}
          />
          <aside
            className={`absolute left-0 top-0 flex h-full w-72 max-w-[80%] flex-col bg-white shadow-xl transition-transform duration-300 ease-out ${mobileVisible ? "translate-x-0" : "-translate-x-full"}`}
          >
            <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
              <div className="text-base font-bold uppercase">{settings.store_name}</div>
              <button onClick={closeMenu} className="grid h-9 w-9 place-items-center rounded-full hover:bg-stone-100" aria-label="Đóng">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={submitSearch} className="border-b border-stone-200 p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tìm kiếm..."
                  className="w-full rounded-full border border-input bg-stone-50 py-2 pl-10 pr-4 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </form>
            <nav className="flex-1 overflow-y-auto py-2">
              {NAV.map((item) =>
                item.dropdown ? (
                  <div key={item.label} className="border-b border-stone-100">
                    <button
                      onClick={() => setMobileProductOpen((open) => !open)}
                      className="flex w-full items-center justify-between px-5 py-3 text-sm font-medium text-stone-800 hover:bg-stone-50"
                    >
                      <span>{item.label}</span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${mobileProductOpen ? "rotate-180" : ""}`} />
                    </button>
                    {mobileProductOpen && (
                      <ul className="px-5 pb-3">
                        <li className="pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                          Danh mục
                        </li>
                        {productMenu.map((category) => (
                          <li key={category.to}>
                            <Link to={category.to} onClick={closeMenu} className="block py-2 text-sm text-stone-700 hover:text-amber-700">
                              {category.label}
                            </Link>
                          </li>
                        ))}
                        {brandMenu.length > 0 && (
                          <>
                            <li className="mt-2 border-t border-dashed border-stone-200 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                              Thương hiệu
                            </li>
                            {brandMenu.map((brandItem) => (
                              <li key={brandItem.to}>
                                <Link to={brandItem.to} onClick={closeMenu} className="block py-2 text-sm text-stone-700 hover:text-amber-700">
                                  {brandItem.label}
                                </Link>
                              </li>
                            ))}
                          </>
                        )}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link key={item.label} to={item.to} onClick={closeMenu} className="block border-b border-stone-100 px-5 py-3 text-sm font-medium text-stone-800 hover:bg-stone-50">
                    {item.label}
                  </Link>
                ),
              )}
              <Link to="/account" onClick={closeMenu} className="block border-b border-stone-100 px-5 py-3 text-sm font-medium text-stone-800 hover:bg-stone-50">Tài khoản</Link>
              <Link to="/cart" onClick={closeMenu} className="block border-b border-stone-100 px-5 py-3 text-sm font-medium text-stone-800 hover:bg-stone-50">Giỏ hàng</Link>
              <Link to="/account/wishlist" onClick={closeMenu} className="block border-b border-stone-100 px-5 py-3 text-sm font-medium text-stone-800 hover:bg-stone-50">Yêu thích</Link>
            </nav>
            <div className="flex flex-col gap-2 border-t border-stone-200 p-3">
              {user ? (
                <>
                  {user.role === "admin" && (
                    <Link to="/admin/dashboard" onClick={closeMenu} className="w-full rounded-md border border-emerald-700 py-2.5 text-center text-sm font-semibold text-emerald-700 hover:bg-emerald-50">
                      Quản lý cửa hàng
                    </Link>
                  )}
                  <Link to="/account" onClick={closeMenu} className="w-full rounded-md bg-stone-900 py-2.5 text-center text-sm font-semibold text-white">
                    Tài khoản
                  </Link>
                  <button onClick={handleLogout} className="w-full rounded-md border border-stone-300 py-2.5 text-center text-sm font-semibold text-red-600 hover:bg-red-50">
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

function flattenCategories(categories: Category[]): Category[] {
  return categories.flatMap((category) => [
    category,
    ...flattenCategories(category.children ?? []),
  ]);
}
