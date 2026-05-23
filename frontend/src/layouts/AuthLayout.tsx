import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Sparkles, Star, Truck } from "lucide-react";
import perfumeCollection from "@/assets/perfume-collection.jpg";

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const HIGHLIGHTS = [
  { icon: ShieldCheck, label: "Chính hãng 100%" },
  { icon: Truck,       label: "Giao nhanh toàn quốc" },
  { icon: Sparkles,    label: "Tư vấn theo sở thích" },
];

export default function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">

      {/* ── Left: image panel ─────────────────────────────── */}
      <aside className="relative hidden w-[46%] flex-shrink-0 lg:flex lg:flex-col">
        <img
          src={perfumeCollection}
          alt="Maison Perfume"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-stone-950/70 via-stone-900/50 to-stone-950/80" />

        {/* Logo */}
        <div className="relative z-10 p-9">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <span className="grid h-9 w-9 place-items-center rounded-full border border-white/25 bg-white/10 backdrop-blur transition group-hover:bg-white/20">
              <span className="text-white">M</span>
            </span>
            <span className="text-lg font-semibold tracking-[0.18em] text-white uppercase">Maison</span>
          </Link>
        </div>

        {/* Center quote */}
        <div className="relative z-10 flex flex-1 items-center justify-center px-12">
          <div className="text-center">
            <div className="mb-4 flex justify-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <blockquote className="text-[1.6rem] font-light italic leading-relaxed tracking-wide text-white/90">
              "Mùi hương là ký ức<br />không thể xóa nhòa."
            </blockquote>
            <p className="mt-5 text-xs tracking-[0.25em] text-white/40 uppercase">Maison Perfume · Est. 2026</p>
          </div>
        </div>

        {/* Bottom badges */}
        <div className="relative z-10 flex flex-wrap gap-2 p-9">
          {HIGHLIGHTS.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur"
            >
              <Icon className="h-3 w-3" />
              {label}
            </span>
          ))}
        </div>
      </aside>

      {/* ── Right: form panel ─────────────────────────────── */}
      <div className="flex flex-1 flex-col bg-[#faf8f5]">

        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-5 sm:px-10">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2.5 lg:hidden">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-stone-900">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </span>
            <span className="text-base font-semibold tracking-[0.15em] text-stone-900 uppercase">Maison</span>
          </Link>
          <div className="hidden lg:block" />

          <Link
            to="/"
            className="group flex items-center gap-1.5 text-sm text-stone-400 transition-colors hover:text-stone-900"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Về trang chủ
          </Link>
        </header>

        {/* Form center */}
        <main className="flex flex-1 items-center justify-center px-6 py-6">
          <div className="w-full max-w-[460px]">

            {/* Heading */}
            <div className="mb-8">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold tracking-wide text-amber-700 uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Thành viên Maison
              </span>
              <h1 className="text-[1.85rem] font-semibold tracking-tight text-stone-950">{title}</h1>
              {subtitle && (
                <p className="mt-2 text-sm leading-relaxed text-stone-500">{subtitle}</p>
              )}
            </div>

            {children}

            {footer && (
              <div className="mt-7">
                <div className="relative mb-5 flex items-center">
                  <div className="flex-1 border-t border-stone-200" />
                </div>
                <p className="text-center text-sm text-stone-500">{footer}</p>
              </div>
            )}
          </div>
        </main>

        {/* Bottom */}
        <footer className="px-6 py-4 text-center">
          <p className="text-xs text-stone-400">© 2026 Maison. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
