import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";
import { LockKeyhole, Mail, Package } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/ui/label";
import { ButtonSpinner } from "@/components/shared/ButtonSpinner";
import { useLogin } from "@/hooks/useAuthMutations";
import { wasApiConnectionNotified } from "@/lib/api";
import { getSafeRedirectPath } from "@/routes/redirect";
import { loginSchema, type LoginFormValues } from "@/schemas/auth";
import type { ApiErrorResponse } from "@/types/auth";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (values: LoginFormValues) => {
    login.mutate(values, {
      onSuccess: (res) => {
        if (res.user.role !== "admin") {
          toast.error("Tài khoản này không có quyền truy cập trang quản trị.");
          navigate("/account", { replace: true });
          return;
        }

        toast.success(`Chào mừng quản trị viên, ${res.user.full_name}!`);
        const redirect = getSafeRedirectPath(params.get("redirect"));
        navigate(redirect?.startsWith("/admin") ? redirect : "/admin/dashboard", { replace: true });
      },
      onError: (error) => {
        if (wasApiConnectionNotified(error)) return;
        const err = error as AxiosError<ApiErrorResponse>;
        toast.error(err.response?.data?.message ?? "Đăng nhập quản trị thất bại.");
      },
    });
  };

  return (
    <main className="flex min-h-screen bg-stone-50">
      <section className="hidden w-1/2 flex-col justify-between bg-sidebar p-10 text-sidebar-foreground lg:flex">
        <Link to="/" className="inline-flex items-center gap-2 text-lg font-semibold text-sidebar-primary-foreground">
          <Package className="h-5 w-5 text-sidebar-primary" />
          Maison Admin
        </Link>
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-sidebar-foreground/50">Quản trị hệ thống</p>
          <h1 className="mt-4 max-w-md text-4xl font-semibold leading-tight text-sidebar-primary-foreground">
            Đăng nhập khu vực quản lý cửa hàng.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-sidebar-foreground/70">
            Vui lòng đăng nhập với tài khoản quản trị để truy cập khu vực quản trị.
          </p>
        </div>
        <p className="text-xs text-sidebar-foreground/50">Maison Perfume Shop</p>
      </section>

      <section className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Package className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-semibold text-stone-950">Đăng nhập</h2>
            <p className="mt-1 text-sm text-stone-500">Sử dụng tài khoản quản trị để tiếp tục.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <AdminLoginField
              id="email"
              label="Email"
              type="email"
              icon={Mail}
              placeholder="admin@example.com"
              registration={register("email")}
              error={errors.email?.message}
            />
            <AdminLoginField
              id="password"
              label="Mật khẩu"
              type="password"
              icon={LockKeyhole}
              placeholder="Nhập mật khẩu"
              registration={register("password")}
              error={errors.password?.message}
            />

            <Button type="submit" disabled={login.isPending} className="h-10 w-full bg-primary text-primary-foreground hover:bg-primary/90">
              {login.isPending && <ButtonSpinner />}
              {login.isPending ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>

          <div className="mt-5 text-center">
            <Link to="/" className="text-sm font-medium text-stone-500 hover:text-stone-950">
              Quay lại cửa hàng
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function AdminLoginField({
  id,
  label,
  type,
  icon: Icon,
  placeholder,
  registration,
  error,
}: {
  id: string;
  label: string;
  type: string;
  icon: typeof Mail;
  placeholder: string;
  registration: UseFormRegisterReturn;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium text-stone-700">
        {label}
      </Label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <Input id={id} type={type} placeholder={placeholder} className="h-10 rounded-lg bg-white pl-9" {...registration} />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
