import { Link } from "react-router-dom";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";

interface Crumb { label: string; to?: string }

interface Props {
  title: string;
  subtitle?: string;
  crumbs?: Crumb[];
  children: React.ReactNode;
  narrow?: boolean;
}

export default function ContentPage({ title, subtitle, crumbs = [], children, narrow }: Props) {
  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <SiteHeader />

      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <nav className="text-xs text-stone-500">
            <Link to="/" className="hover:text-stone-900">Trang chủ</Link>
            {crumbs.map((c, i) => (
              <span key={i}>
                <span className="mx-2">/</span>
                {c.to ? <Link to={c.to} className="hover:text-stone-900">{c.label}</Link> : <span className="text-stone-900">{c.label}</span>}
              </span>
            ))}
          </nav>
        </div>
      </div>

      <main className={`mx-auto px-4 py-8 sm:px-6 lg:py-12 ${narrow ? "max-w-3xl" : "max-w-7xl"}`}>
        {(title || subtitle) && (
          <header className="mb-8">
            {title && <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>}
            {subtitle && <p className="mt-2 text-sm text-stone-500 sm:text-base">{subtitle}</p>}
          </header>
        )}
        {children}
      </main>

      <SiteFooter />
    </div>
  );
}
