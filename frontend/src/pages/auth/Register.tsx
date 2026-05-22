import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { LockKeyhole, Mail, User } from "lucide-react";
import type { AxiosError } from "axios";
import { AuthFormField } from "@/components/auth/AuthFormField";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import AuthLayout from "@/layouts/AuthLayout";
import { useRegister } from "@/hooks/useAuthMutations";
import { registerSchema, type RegisterFormValues } from "@/schemas/auth";
import { wasApiConnectionNotified } from "@/lib/api";
import { applyApiErrors } from "@/lib/form-utils";
import type { ApiErrorResponse } from "@/types/auth";

type FormValues = RegisterFormValues;

export default function Register() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, setError } = useForm<FormValues>({ resolver: zodResolver(registerSchema) });
  const registerMutation = useRegister();

  const onSubmit = (data: FormValues) => {
    registerMutation.mutate(data, {
      onSuccess: (res) => {
        toast.success(`Chào mừng đến với Maison, ${res.user.full_name}!`);
        navigate("/account");
      },
      onError: (error) => {
        if (wasApiConnectionNotified(error)) return;
        const err = error as AxiosError<ApiErrorResponse<FormValues>>;
        if (applyApiErrors(err.response?.data?.errors, setError)) return;
        toast.error(err.response?.data?.message ?? "Đăng ký thất bại.");
      },
    });
  };

  return (
    <AuthLayout
      title="Tạo tài khoản"
      subtitle="Gia nhập Maison để nhận ưu đãi riêng dành cho thành viên"
      footer={<>Đã có tài khoản?{" "}<Link to="/auth/login" className="font-semibold text-amber-700 underline-offset-2 hover:underline">Đăng nhập</Link></>}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AuthFormField
          id="full_name"
          label="Họ và tên"
          placeholder="Nguyễn Văn A"
          icon={User}
          registration={register("full_name")}
          error={errors.full_name?.message}
        />

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
          autoComplete="new-password"
          placeholder="Tối thiểu 6 ký tự"
          icon={LockKeyhole}
          registration={register("password")}
          error={errors.password?.message}
        />

        <AuthFormField
          id="password_confirmation"
          label="Xác nhận mật khẩu"
          type="password"
          autoComplete="new-password"
          placeholder="Nhập lại mật khẩu"
          icon={LockKeyhole}
          registration={register("password_confirmation")}
          error={errors.password_confirmation?.message}
          revealLabel="Hiện mật khẩu xác nhận"
          hideLabel="Ẩn mật khẩu xác nhận"
        />

        <AuthSubmitButton isPending={registerMutation.isPending} pendingText="Đang tạo...">
          Đăng ký
        </AuthSubmitButton>

        <p className="text-center text-xs text-stone-500">
          Bằng việc đăng ký, bạn đồng ý với{" "}
          <Link to="/terms" className="underline hover:text-stone-700">Điều khoản</Link> và{" "}
          <Link to="/privacy" className="underline hover:text-stone-700">Chính sách bảo mật</Link> của Maison.
        </p>
      </form>
    </AuthLayout>
  );
}
