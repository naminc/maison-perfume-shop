import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { LockKeyhole, Mail } from "lucide-react";
import type { AxiosError } from "axios";
import { Checkbox } from "@/components/ui/checkbox";
import { AuthFormField } from "@/components/auth/AuthFormField";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import AuthLayout from "@/layouts/AuthLayout";
import { useLogin } from "@/hooks/useAuthMutations";

const schema = z.object({
  email: z.string().trim().email("Email không hợp lệ").max(255),
  password: z.string().min(6, "Tối thiểu 6 ký tự").max(100),
});
type FormValues = z.infer<typeof schema>;

interface AuthErrorResponse {
  message?: string;
}

export default function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const login = useLogin();

  const onSubmit = async (data: FormValues) => {
    login.mutate(data, {
      onSuccess: (res) => {
        toast.success(`Chào mừng, ${res.user.full_name}!`);
        const redirect = params.get("redirect");
        navigate(redirect?.startsWith("/admin") ? redirect : "/account");
      },
      onError: (error) => {
        const err = error as AxiosError<AuthErrorResponse>;
        const msg = err.response?.data?.message ?? "Đăng nhập thất bại.";
        toast.error(msg);
      },
    });
  };

  return (
    <AuthLayout
      title="Đăng nhập"
      subtitle="Chào mừng bạn quay lại Maison"
      footer={<>Chưa có tài khoản?{" "}<Link to="/auth/register" className="font-medium text-amber-700 hover:underline">Đăng ký ngay</Link></>}
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
