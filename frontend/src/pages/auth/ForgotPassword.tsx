import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Mail, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { AuthFormField } from "@/components/auth/AuthFormField";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import AuthLayout from "@/layouts/AuthLayout";
import { useForgotPassword } from "@/hooks/useAuthMutations";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/schemas/auth";
import { wasApiConnectionNotified } from "@/lib/api";
import { applyApiErrors } from "@/lib/form-utils";
import type { ApiErrorResponse } from "@/types/auth";

type FormValues = ForgotPasswordFormValues;

export default function ForgotPassword() {
  const [sentEmail, setSentEmail] = useState<string | null>(null);
  const forgotPassword = useForgotPassword();
  const { register, handleSubmit, setError, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: FormValues) => {
    forgotPassword.mutate(data, {
      onSuccess: () => {
        setSentEmail(data.email);
        toast.success("Nếu email tồn tại, liên kết đặt lại mật khẩu đã được gửi.");
      },
      onError: (error) => {
        if (wasApiConnectionNotified(error)) return;
        const err = error as AxiosError<ApiErrorResponse<FormValues>>;
        if (applyApiErrors(err.response?.data?.errors, setError)) return;
        toast.error(err.response?.data?.message ?? "Không thể gửi email đặt lại mật khẩu.");
      },
    });
  };

  if (sentEmail) {
    return (
      <AuthLayout
        title="Kiểm tra email của bạn"
        subtitle={`Nếu ${sentEmail} tồn tại trong hệ thống, chúng tôi đã gửi liên kết đặt lại mật khẩu.`}
        footer={<Link to="/auth/login" className="font-medium text-amber-700 hover:underline">Quay lại đăng nhập</Link>}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-stone-700">
            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-700" />
            <p>
              Vui lòng kiểm tra hộp thư đến và thư mục spam. Liên kết sẽ hết hạn sau 15 phút.
            </p>
          </div>
          <Button
            type="button"
            className="h-11 w-full rounded-xl border border-stone-900 bg-stone-900 text-sm font-semibold text-white shadow-sm transition-all hover:bg-stone-800 hover:shadow-md active:scale-[0.99]"
            onClick={() => setSentEmail(null)}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Gửi lại email
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Quên mật khẩu?"
      subtitle="Nhập email tài khoản, chúng tôi sẽ gửi liên kết đặt lại mật khẩu cho bạn."
      footer={<>Nhớ mật khẩu rồi?{" "}<Link to="/auth/login" className="font-medium text-amber-700 hover:underline">Đăng nhập</Link></>}
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

        <AuthSubmitButton isPending={forgotPassword.isPending} pendingText="Đang gửi...">
          Gửi liên kết đặt lại
        </AuthSubmitButton>
      </form>
    </AuthLayout>
  );
}
