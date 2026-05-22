import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Smartphone, Trash2, ShieldCheck, Lock, KeyRound, Eye, EyeOff } from "lucide-react";
import AccountLayout from "@/layouts/AccountLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z
  .object({
    current: z.string().min(1, "Bắt buộc"),
    next: z.string().min(8, "Tối thiểu 8 ký tự").max(100),
    confirm: z.string(),
  })
  .refine((d) => d.next === d.confirm, { path: ["confirm"], message: "Mật khẩu xác nhận không khớp" });

type FormValues = z.infer<typeof schema>;

const SESSIONS = [
  { id: "s1", device: "iPhone 15 · Safari", location: "TP. HCM, VN", current: true, last: "Hoạt động vừa xong" },
  { id: "s2", device: "MacBook Pro · Chrome", location: "TP. HCM, VN", current: false, last: "2 giờ trước" },
  { id: "s3", device: "Windows · Edge", location: "Hà Nội, VN", current: false, last: "3 ngày trước" },
];

export default function Security() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const [sessions, setSessions] = useState(SESSIONS);

  const onSubmit = async (_d: FormValues) => {
    await new Promise((r) => setTimeout(r, 400));
    toast.success("Đã cập nhật mật khẩu");
    reset();
  };

  const revoke = (id: string) => {
    setSessions((p) => p.filter((s) => s.id !== id));
    toast.success("Đã đăng xuất thiết bị");
  };

  return (
    <AccountLayout title="Bảo mật" subtitle="Quản lý mật khẩu và phiên đăng nhập của bạn.">
      <section className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-base font-semibold"><ShieldCheck className="h-4 w-4" /> Đổi mật khẩu</h2>
        <p className="mt-1 text-xs text-stone-500">Để bảo mật, hãy chọn mật khẩu mạnh và không trùng với mật khẩu cũ.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field id="current" label="Mật khẩu hiện tại" placeholder="Nhập mật khẩu hiện tại" icon={Lock} reg={register("current")} err={errors.current?.message} />
          </div>
          <Field id="next" label="Mật khẩu mới" placeholder="Tối thiểu 8 ký tự" icon={KeyRound} reg={register("next")} err={errors.next?.message} hint="Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt." />
          <Field id="confirm" label="Xác nhận mật khẩu mới" placeholder="Nhập lại mật khẩu mới" icon={KeyRound} reg={register("confirm")} err={errors.confirm?.message} />
          <div className="sm:col-span-2 flex justify-end">
            <Button type="submit" className="mt-1 h-11 rounded-lg bg-stone-900 px-6 text-white hover:bg-stone-800">
              Cập nhật mật khẩu
            </Button>
          </div>
        </form>


      </section>

      <section className="mt-5 rounded-xl border border-stone-200 bg-white p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-base font-semibold"><Smartphone className="h-4 w-4" /> Phiên đăng nhập</h2>
        <p className="mt-1 text-xs text-stone-500">Đăng xuất khỏi các thiết bị bạn không nhận ra.</p>

        <ul className="mt-4 divide-y divide-stone-100">
          {sessions.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{s.device}</span>
                  {s.current && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Thiết bị hiện tại</span>}
                </div>
                <div className="mt-0.5 text-xs text-stone-500">{s.location} · {s.last}</div>
              </div>
              {!s.current && (
                <button onClick={() => revoke(s.id)} aria-label="Đăng xuất" className="grid h-9 w-9 place-items-center rounded-lg border border-stone-200 text-stone-500 hover:bg-red-50 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>
    </AccountLayout>
  );
}

function Field({ id, label, placeholder, icon: Icon, reg, err, hint }: { id: string; label: string; placeholder?: string; icon: React.ComponentType<{ className?: string }>; reg: ReturnType<ReturnType<typeof useForm>["register"]>; err?: string; hint?: string }) {
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
          {...reg}
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
      {hint && !err && <p className="text-xs text-stone-500">{hint}</p>}
      {err && <p className="text-xs text-red-600">{err}</p>}
    </div>
  );
}

