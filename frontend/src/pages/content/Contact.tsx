import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Phone, Mail, MapPin, Clock, Facebook, Instagram } from "lucide-react";
import ContentPage from "@/components/site/ContentPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  name: z.string().trim().min(2, "Vui lòng nhập họ tên").max(100),
  email: z.string().trim().email("Email không hợp lệ").max(255),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Tin nhắn quá ngắn").max(1000),
});
type FormValues = z.infer<typeof schema>;

const INFO = [
  { icon: Phone, t: "Hotline", d: "0987 654 321", d2: "8:00 - 22:00 hàng ngày" },
  { icon: Mail, t: "Email", d: "hello@maison.vn", d2: "Phản hồi trong 24h" },
  { icon: MapPin, t: "Cửa hàng", d: "123 Nguyễn Huệ, Q.1, TP. HCM", d2: "Mở cửa 9:00 - 21:00" },
  { icon: Clock, t: "Giờ làm việc", d: "Thứ 2 - Chủ nhật", d2: "8:00 - 22:00" },
];

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (_d: FormValues) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    setLoading(false);
    toast.success("Cảm ơn bạn! Maison sẽ phản hồi trong vòng 24 giờ.");
    reset();
  };

  return (
    <ContentPage title="Liên hệ" subtitle="Chúng tôi luôn sẵn sàng lắng nghe bạn." crumbs={[{ label: "Liên hệ" }]}>
      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <section className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8">
          <h2 className="text-xl font-semibold">Gửi tin nhắn cho chúng tôi</h2>
          <p className="mt-1 text-sm text-stone-500">Điền form bên dưới, Maison sẽ phản hồi sớm nhất có thể.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Họ và tên *</Label>
              <Input id="name" className="h-11 rounded-lg border-input bg-stone-50" {...register("name")} />
              {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input id="phone" className="h-11 rounded-lg border-input bg-stone-50" {...register("phone")} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" className="h-11 rounded-lg border-input bg-stone-50" {...register("email")} />
              {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="message">Nội dung *</Label>
              <Textarea id="message" rows={5} className="rounded-lg border-input bg-stone-50" placeholder="Bạn cần tư vấn gì? ..." {...register("message")} />
              {errors.message && <p className="text-xs text-red-600">{errors.message.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={loading} className="h-11 w-full rounded-lg bg-stone-900 text-white hover:bg-stone-800 sm:w-auto sm:px-8">
                {loading ? "Đang gửi…" : "Gửi tin nhắn"}
              </Button>
            </div>
          </form>
        </section>

        <aside className="space-y-4">
          {INFO.map((i) => (
            <div key={i.t} className="rounded-xl border border-stone-200 bg-white p-5">
              <div className="flex gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber-50 text-amber-700">
                  <i.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{i.t}</div>
                  <div className="mt-0.5 text-sm text-stone-900">{i.d}</div>
                  <div className="text-xs text-stone-500">{i.d2}</div>
                </div>
              </div>
            </div>
          ))}
          <div className="rounded-xl border border-stone-200 bg-white p-5">
            <div className="text-sm font-semibold">Theo dõi Maison</div>
            <div className="mt-3 flex gap-2">
              <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" aria-label="Facebook Maison" className="grid h-10 w-10 place-items-center rounded-full border border-stone-200 hover:bg-stone-50"><Facebook className="h-4 w-4" /></a>
              <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram Maison" className="grid h-10 w-10 place-items-center rounded-full border border-stone-200 hover:bg-stone-50"><Instagram className="h-4 w-4" /></a>
            </div>
          </div>
        </aside>
      </div>
    </ContentPage>
  );
}
