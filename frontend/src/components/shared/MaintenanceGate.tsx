import { Clock3, Mail, ShieldCheck, Wrench } from "lucide-react";
import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { PageLoader } from "@/components/shared/PageLoader";
import { useAuth } from "@/contexts/AuthContext";
import { getBrandParts } from "@/constants/site-settings";
import { usePublicSettings } from "@/hooks/usePublicSettings";

interface MaintenanceGateProps {
  children: ReactNode;
}

export function MaintenanceGate({ children }: MaintenanceGateProps) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const { isLoading: isAuthLoading } = useAuth();
  const publicSettingsQuery = usePublicSettings();
  const { settings } = publicSettingsQuery;
  const brand = getBrandParts(settings.store_name);
  const shouldCoverAuthBootstrap =
    location.pathname.startsWith("/auth") ||
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/forgot-password" ||
    location.pathname.startsWith("/account");

  if (isAdminRoute) {
    return children;
  }

  if (publicSettingsQuery.isLoading) {
    return (
      <>
        {children}
        <div className="fixed inset-0 z-[200] bg-[#faf8f5]">
          <PageLoader />
        </div>
      </>
    );
  }

  if (publicSettingsQuery.isError || !settings.maintenance.enabled) {
    const showBootOverlay = shouldCoverAuthBootstrap && isAuthLoading;

    return (
      <>
        {children}
        {showBootOverlay ? (
          <div className="fixed inset-0 z-[200] bg-[#faf8f5]">
            <PageLoader />
          </div>
        ) : null}
      </>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f2eb] px-4 py-6 text-stone-950 sm:px-6 lg:px-8">
      <section className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl items-center">
        <div className="grid w-full overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-[0_24px_80px_rgba(28,25,23,0.10)] lg:grid-cols-[0.92fr_1.08fr]">
          <aside className="flex min-h-[360px] flex-col justify-between bg-stone-950 p-8 text-white sm:p-10 lg:min-h-[560px]">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white text-base font-semibold text-stone-950">
                M
              </span>
              <span>
                <span className="block text-sm font-semibold tracking-[0.24em] uppercase">{brand.primary}</span>
                {brand.secondary && (
                  <span className="block text-[10px] tracking-[0.34em] text-stone-400 uppercase">{brand.secondary}</span>
                )}
              </span>
            </div>

            <div className="max-w-sm">
              <p className="mb-4 inline-flex rounded-full border border-white/15 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-stone-300">
                Maintenance
              </p>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                Website đang bảo trì.
              </h1>
              <p className="mt-5 text-sm leading-7 text-stone-300">
                Maison tạm dừng nhận truy cập trong thời gian ngắn để cập nhật hệ thống và tối ưu trải nghiệm mua sắm.
              </p>
            </div>

            <p className="text-xs text-stone-500">&copy; 2026 {settings.store_name}</p>
          </aside>

          <div className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-14">
            <div className="max-w-xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                <Wrench className="h-7 w-7" strokeWidth={1.8} />
              </div>

              <p className="mt-7 text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
                Đang nâng cấp hệ thống
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
                Maison sẽ quay lại sớm
              </h2>
              <p className="mt-4 text-base leading-8 text-stone-600">{settings.maintenance.message}</p>

              <div className="mt-8 space-y-3">
                <div className="flex gap-4 rounded-2xl border border-stone-200 bg-[#fbfaf8] p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-amber-700 shadow-sm">
                    <Clock3 className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-stone-900">Thời gian bảo trì ngắn</p>
                    <p className="mt-1 text-sm leading-6 text-stone-500">
                      Chúng tôi đang hoàn tất các cập nhật cuối cùng.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 rounded-2xl border border-stone-200 bg-[#fbfaf8] p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-emerald-700 shadow-sm">
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-stone-900">Dữ liệu của bạn vẫn an toàn</p>
                    <p className="mt-1 text-sm leading-6 text-stone-500">
                      Tài khoản, đơn hàng và giỏ hàng sẽ không bị ảnh hưởng.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 rounded-2xl border border-stone-200 bg-[#fbfaf8] p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-stone-700 shadow-sm">
                    <Mail className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-stone-900">Cần hỗ trợ?</p>
                    <p className="mt-1 text-sm leading-6 text-stone-500">
                      Liên hệ {settings.contact_email} nếu bạn cần hỗ trợ về đơn hàng.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
