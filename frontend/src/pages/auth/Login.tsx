import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { LockKeyhole, Mail } from "lucide-react";
import type { AxiosError } from "axios";
import { Checkbox } from "@/components/ui/checkbox";
import { AuthFormField } from "@/components/auth/AuthFormField";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import AuthLayout from "@/layouts/AuthLayout";
import { useLogin } from "@/hooks/useAuthMutations";
import { loginSchema, type LoginFormValues } from "@/schemas/auth";
import { wasApiConnectionNotified } from "@/lib/api";
import type { ApiErrorResponse } from "@/types/auth";

type FormValues = LoginFormValues;

export default function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(loginSchema) });
  const login = useLogin();

  const onSubmit = async (data: FormValues) => {
    login.mutate(data, {
      onSuccess: (res) => {
        toast.success(`Chào mừng, ${res.user.full_name}!`);
        const redirect = params.get("redirect");
        navigate(redirect?.startsWith("/admin") ? redirect : "/account");
      },
      onError: (error) => {
        if (wasApiConnectionNotified(error)) return;
        const err = error as AxiosError<ApiErrorResponse>;
        toast.error(err.response?.data?.message ?? "Đăng nhập thất bại.");
      },
    });
  };

  return (
    <AuthLayout
      title="Đăng nhập"
      subtitle="Chào mừng bạn quay lại Maison"
      footer={<>Chưa có tài khoản?{" "}<Link to="/auth/register" className="font-semibold text-amber-700 underline-offset-2 hover:underline">Đăng ký ngay</Link></>}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <AuthFormField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          icon={Mail}
          registration={register("email")}
          error={errors.email?.message}
        />

        <AuthFormField
          id="password"
          label="Mật khẩu"
          type="password"
          autoComplete="current-password"
          placeholder="Nhập mật khẩu"
          icon={LockKeyhole}
          registration={register("password")}
          error={errors.password?.message}
          labelAction={
            <Link to="/auth/forgot-password" className="text-xs font-medium text-amber-700 hover:underline">
              Quên mật khẩu?
            </Link>
          }
        />

        <div className="flex items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-stone-600">
            <Checkbox className="border-stone-300 data-[state=checked]:border-stone-900 data-[state=checked]:bg-stone-900" />
            Ghi nhớ đăng nhập
          </label>
          <span className="text-xs text-stone-400">Bảo mật SSL</span>
        </div>

        <AuthSubmitButton isPending={login.isPending} pendingText="Đang đăng nhập...">
          Đăng nhập
        </AuthSubmitButton>
      </form>
    </AuthLayout>
  );
}
