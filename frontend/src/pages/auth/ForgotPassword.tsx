import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthLayout from "@/layouts/AuthLayout";

const schema = z.object({
  email: z.string().trim().email("Email không hợp lệ").max(255),
});
type FormValues = z.infer<typeof schema>;

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors }, getValues } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (_data: FormValues) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    setSent(true);
  };

  if (sent) {
    return (
      <AuthLayout
        title="Kiểm tra email của bạn"
        subtitle={`Chúng tôi đã gửi liên kết đặt lại mật khẩu đến ${getValues("email")}.`}
        footer={<Link to="/auth/login" className="font-medium text-amber-700 hover:underline">← Quay lại đăng nhập</Link>}
      >
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-stone-700">
          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-700" />
          <p>Vui lòng kiểm tra hộp thư đến và thư mục spam. Liên kết sẽ hết hạn sau 30 phút.</p>
        </div>
        <Button variant="outline" className="h-11 w-full rounded-lg border-stone-300" onClick={() => setSent(false)}>
          Gửi lại email
        </Button>
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
        <div className="space-y-2">
          <Label htmlFor="email" className="text-stone-700">Email</Label>
          <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" className="h-11 rounded-lg border-input bg-white" {...register("email")} />
          {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <Button type="submit" className="h-11 w-full rounded-lg bg-stone-900 text-white hover:bg-stone-800" disabled={loading}>
          {loading ? "Đang gửi…" : "Gửi liên kết đặt lại"}
        </Button>
      </form>
    </AuthLayout>
  );
}
