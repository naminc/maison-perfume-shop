import { Link, Navigate, useSearchParams } from "react-router-dom";
import { ShieldCheck, Sparkles, Truck } from "lucide-react";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import perfumeCollection from "@/assets/perfume-collection.jpg";
import { useAuth } from "@/contexts/AuthContext";

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const highlights = [
  { icon: ShieldCheck, label: "Chính hãng 100%" },
  { icon: Truck, label: "Giao nhanh toàn quốc" },
  { icon: Sparkles, label: "Tư vấn theo gu" },
];

export default function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  const { user, isLoading } = useAuth();
  const [params] = useSearchParams();

  if (isLoading) return null;

  if (user) {
    const redirect = params.get("redirect");
    return <Navigate to={redirect ?? "/account"} replace />;
  }

  return (
    <div className="min-h-screen bg-[#f7f1e8] text-stone-900">
      <SiteHeader />

      <div className="border-b border-stone-200 bg-white/90">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <nav className="text-xs text-stone-500">
            <Link to="/" className="hover:text-stone-900">Trang chủ</Link>
            <span className="mx-2">/</span>
            <span className="text-stone-900">{title}</span>
          </nav>
        </div>
      </div>

      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_480px] lg:items-center lg:py-14">
        <section className="relative hidden min-h-[620px] overflow-hidden rounded-lg lg:block">
          <img
            src={perfumeCollection}
            alt="Bộ sưu tập nước hoa Maison"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/25 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Maison Perfume
            </div>
            <h2 className="mt-4 max-w-md text-3xl font-semibold leading-tight tracking-tight">
              Không gian thành viên dành cho người yêu mùi hương.
            </h2>
            <div className="mt-6 flex flex-wrap gap-2">
              {highlights.map((item) => {
                const Icon = item.icon;
                return (
                  <span key={item.label} className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-2 text-xs font-medium backdrop-blur">
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </span>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-md rounded-lg border border-stone-200 bg-white p-6 shadow-sm sm:p-8 lg:mx-0 lg:max-w-none">
          <div className="mb-7">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800 lg:hidden">
              <Sparkles className="h-3.5 w-3.5" />
              Maison Perfume
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-stone-950 sm:text-3xl">{title}</h1>
            {subtitle && <p className="mt-2 text-sm leading-6 text-stone-500">{subtitle}</p>}
          </div>
          {children}
          {footer && <div className="mt-6 border-t border-stone-100 pt-5 text-center text-sm text-stone-500">{footer}</div>}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
