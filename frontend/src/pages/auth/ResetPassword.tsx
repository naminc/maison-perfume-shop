import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthLayout from "@/layouts/AuthLayout";

const schema = z
  .object({
    password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự").max(100),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Mật khẩu xác nhận không khớp" });

type FormValues = z.infer<typeof schema>;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (_d: FormValues) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    toast.success("Đặt lại mật khẩu thành công");
    navigate("/auth/login");
  };

  return (
    <AuthLayout
      title="Đặt lại mật khẩu"
      subtitle="Chọn mật khẩu mới cho tài khoản của bạn"
      footer={<>Quay về <Link to="/auth/login" className="font-medium text-amber-700 hover:underline">Đăng nhập</Link></>}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="password" className="text-stone-700">Mật khẩu mới</Label>
          <Input id="password" type="password" autoComplete="new-password" placeholder="Ít nhất 8 ký tự" className="h-11 rounded-lg border-input bg-white" {...register("password")} />
          {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm" className="text-stone-700">Xác nhận mật khẩu</Label>
          <Input id="confirm" type="password" autoComplete="new-password" placeholder="Nhập lại mật khẩu mới" className="h-11 rounded-lg border-input bg-white" {...register("confirm")} />
          {errors.confirm && <p className="text-xs text-red-600">{errors.confirm.message}</p>}
        </div>
        <Button type="submit" disabled={loading} className="h-11 w-full rounded-lg bg-stone-900 text-white hover:bg-stone-800">
          {loading ? "Đang lưu…" : "Cập nhật mật khẩu"}
        </Button>
      </form>
    </AuthLayout>
  );
}
