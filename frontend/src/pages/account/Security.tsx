import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Smartphone, ShieldCheck, Lock, KeyRound, Eye, EyeOff, Monitor, Tablet, ChevronLeft, ChevronRight } from "lucide-react";
import type { AxiosError } from "axios";
import AccountLayout from "@/layouts/AccountLayout";
import { ButtonSpinner } from "@/components/shared/ButtonSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { changePasswordSchema, type ChangePasswordFormValues } from "@/schemas/account";
import { useChangePassword, useSessions } from "@/hooks/useAccount";
import { useAuth } from "@/contexts/AuthContext";
import { applyApiErrors } from "@/lib/form-utils";
import type { ApiErrorResponse } from "@/types/auth";

type FormValues = ChangePasswordFormValues;

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "Hoạt động vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  return new Date(dateStr).toLocaleDateString("vi-VN");
}

function getDeviceIcon(device: string) {
  const lower = device.toLowerCase();
  if (lower.includes("phone") || lower.includes("iphone") || lower.includes("android phone")) return Smartphone;
  if (lower.includes("tablet") || lower.includes("ipad")) return Tablet;
  return Monitor;
}

export default function Security() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(changePasswordSchema),
  });
  const changePassword = useChangePassword();
  const [sessionPage, setSessionPage] = useState(1);
  const { data: sessionsData, isLoading: sessionsLoading, isFetching: sessionsFetching } = useSessions(sessionPage);

  const onSubmit = (data: FormValues) => {
    changePassword.mutate(data, {
      onSuccess: async () => {
        toast.success("Đổi mật khẩu thành công. Vui lòng đăng nhập lại.");
        reset();
        await logout();
        navigate("/auth/login");
      },
      onError: (error) => {
        const err = error as AxiosError<ApiErrorResponse<FormValues>>;
        if (applyApiErrors(err.response?.data?.errors, setError)) return;
        toast.error(err.response?.data?.message ?? "Đổi mật khẩu thất bại.");
      },
    });
  };

  return (
    <AccountLayout title="Bảo mật" subtitle="Quản lý mật khẩu và phiên đăng nhập của bạn.">
      {/* Đổi mật khẩu */}
      <section className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-base font-semibold"><ShieldCheck className="h-4 w-4" /> Đổi mật khẩu</h2>
        <p className="mt-1 text-xs text-stone-500">Để bảo mật, hãy chọn mật khẩu mạnh và không trùng với mật khẩu cũ.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <PasswordField
              id="current_password"
              label="Mật khẩu hiện tại"
              placeholder="Nhập mật khẩu hiện tại"
              icon={Lock}
              registration={register("current_password")}
              error={errors.current_password?.message}
            />
          </div>
          <PasswordField
            id="new_password"
            label="Mật khẩu mới"
            placeholder="Tối thiểu 6 ký tự"
            icon={KeyRound}
            registration={register("new_password")}
            error={errors.new_password?.message}
          />
          <PasswordField
            id="new_password_confirmation"
            label="Xác nhận mật khẩu mới"
            placeholder="Nhập lại mật khẩu mới"
            icon={KeyRound}
            registration={register("new_password_confirmation")}
            error={errors.new_password_confirmation?.message}
          />
          <div className="sm:col-span-2 flex justify-end">
            <Button
              type="submit"
              disabled={changePassword.isPending}
              className="mt-1 h-11 rounded-lg bg-stone-900 px-6 text-white hover:bg-stone-800 flex items-center gap-2"
            >
              {changePassword.isPending ? <><ButtonSpinner /> Đang cập nhật...</> : "Cập nhật mật khẩu"}
            </Button>
          </div>
        </form>
      </section>

      {/* Phiên đăng nhập */}
      <section className="mt-5 rounded-xl border border-stone-200 bg-white p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-base font-semibold"><Smartphone className="h-4 w-4" /> Phiên đăng nhập</h2>
        <p className="mt-1 text-xs text-stone-500">Các thiết bị đã đăng nhập vào tài khoản của bạn.</p>

        {sessionsLoading ? (
          <div className="mt-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : sessionsData && sessionsData.items.length > 0 ? (
          <>
            <ul className={`mt-4 divide-y divide-stone-100 transition-opacity duration-150 ${sessionsFetching ? 'opacity-50' : 'opacity-100'}`}>
              {sessionsData.items.map((s) => {
                const DeviceIcon = getDeviceIcon(s.device ?? '');
                return (
                  <li key={s.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg bg-stone-100 text-stone-600">
                      <DeviceIcon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{s.device} · {s.browser}</span>
                        {s.is_current && (
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                            Thiết bị hiện tại
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 text-xs text-stone-500">
                        {s.platform}{s.ip_address ? ` · ${s.ip_address}` : ''} · {formatRelativeTime(s.last_active_at)}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {sessionsData.meta.last_page > 1 && (
              <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-4">
                <p className="text-xs text-stone-500">
                  Trang {sessionsData.meta.current_page}/{sessionsData.meta.last_page}
                  {' '}· {sessionsData.meta.total} phiên
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSessionPage((p) => p - 1)}
                    disabled={sessionsData.meta.current_page <= 1 || sessionsFetching}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Trang trước"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setSessionPage((p) => p + 1)}
                    disabled={sessionsData.meta.current_page >= sessionsData.meta.last_page || sessionsFetching}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Trang sau"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="mt-4 text-sm text-stone-500">Chưa có phiên đăng nhập nào.</p>
        )}
      </section>
    </AccountLayout>
  );
}

interface PasswordFieldProps {
  id: string;
  label: string;
  placeholder?: string;
  icon: React.ComponentType<{ className?: string }>;
  registration: ReturnType<ReturnType<typeof useForm>["register"]>;
  error?: string;
  hint?: string;
}

function PasswordField({ id, label, placeholder, icon: Icon, registration, error, hint }: PasswordFieldProps) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium text-stone-700">{label}</Label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <Input
          id={id}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          autoComplete="new-password"
          className="h-11 rounded-lg border-stone-200 bg-stone-50/60 pl-9 pr-10 text-sm placeholder:text-stone-400 focus-visible:border-stone-400 focus-visible:bg-white focus-visible:ring-0"
          {...registration}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-stone-400 hover:bg-stone-100 hover:text-stone-700"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {hint && !error && <p className="text-xs text-stone-500">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
