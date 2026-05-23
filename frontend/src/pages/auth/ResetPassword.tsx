import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { AuthFormField } from "@/components/auth/AuthFormField";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import AuthLayout from "@/layouts/AuthLayout";
import { useResetPassword } from "@/hooks/useAuthMutations";
import { resetPasswordSchema, type ResetPasswordFormValues } from "@/schemas/auth";
import { wasApiConnectionNotified } from "@/lib/api";
import { applyApiErrors } from "@/lib/form-utils";
import type { ApiErrorResponse } from "@/types/auth";

type FormValues = ResetPasswordFormValues;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const email = params.get("email") ?? "";
  const resetPassword = useResetPassword();

  const { register, handleSubmit, setError, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      email,
      password: "",
      password_confirmation: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    resetPassword.mutate(data, {
      onSuccess: () => {
        toast.success("Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.");
        navigate("/auth/login", { replace: true });
      },
      onError: (error) => {
        if (wasApiConnectionNotified(error)) return;
        const err = error as AxiosError<ApiErrorResponse<FormValues>>;
        const fieldErrors = err.response?.data?.errors;

        if (applyApiErrors(fieldErrors, setError)) {
          if (fieldErrors?.token || fieldErrors?.email) {
            toast.error(err.response?.data?.message ?? "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.");
          }
          return;
        }

        toast.error(err.response?.data?.message ?? "Không thể đặt lại mật khẩu.");
      },
    });
  };

  if (!token || !email) {
    return (
      <AuthLayout
        title="Liên kết không hợp lệ"
        subtitle="Liên kết đặt lại mật khẩu thiếu thông tin cần thiết hoặc đã bị cắt ngắn."
        footer={<Link to="/auth/login" className="font-medium text-amber-700 hover:underline">Quay lại đăng nhập</Link>}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <p>Vui lòng yêu cầu một liên kết đặt lại mật khẩu mới để tiếp tục.</p>
          </div>
          <Button asChild className="h-11 w-full rounded-xl bg-stone-900 text-white hover:bg-stone-800">
            <Link to="/auth/forgot-password">Gửi lại liên kết</Link>
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Đặt lại mật khẩu"
      subtitle={`Chọn mật khẩu mới cho tài khoản ${email}.`}
      footer={<><Link to="/auth/login" className="font-medium text-amber-700 hover:underline">Quay lại đăng nhập</Link></>}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <input type="hidden" {...register("token")} />
        <input type="hidden" {...register("email")} />

        <AuthFormField
          id="password"
          label="Mật khẩu mới"
          type="password"
          autoComplete="new-password"
          placeholder="Ít nhất 6 ký tự"
          icon={LockKeyhole}
          registration={register("password")}
          error={errors.password?.message}
        />

        <AuthFormField
          id="password_confirmation"
          label="Xác nhận mật khẩu"
          type="password"
          autoComplete="new-password"
          placeholder="Nhập lại mật khẩu mới"
          icon={LockKeyhole}
          registration={register("password_confirmation")}
          error={errors.password_confirmation?.message}
          revealLabel="Hiện mật khẩu xác nhận"
          hideLabel="Ẩn mật khẩu xác nhận"
        />

        <AuthSubmitButton isPending={resetPassword.isPending} pendingText="Đang cập nhật...">
          Cập nhật mật khẩu
        </AuthSubmitButton>
      </form>
    </AuthLayout>
  );
}
