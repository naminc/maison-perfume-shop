import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import AccountLayout from "@/layouts/AccountLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useUpdateProfile } from "@/hooks/useAccount";

const schema = z.object({
  full_name: z.string().trim().min(2, "Tên quá ngắn").max(100),
  email:     z.string().trim().email("Email không hợp lệ").max(255),
  phone:     z.string().trim().max(15).nullable().optional(),
});
type FormValues = z.infer<typeof schema>;

interface ProfileErrorResponse {
  message?: string;
  errors?: Partial<Record<keyof FormValues, string[]>>;
}

export default function Profile() {
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();

  const { register, handleSubmit, reset, setError, formState: { errors, isDirty } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  // Pre-fill form khi user load xong
  useEffect(() => {
    if (user) {
      reset({
        full_name: user.full_name,
        email:     user.email,
        phone:     user.phone ?? '',
      });
    }
  }, [user, reset]);

  const onSubmit = (data: FormValues) => {
    updateProfile.mutate(
      { full_name: data.full_name, email: data.email, phone: data.phone || null },
      {
        onSuccess: () => toast.success('Đã cập nhật thông tin tài khoản.'),
        onError: (error) => {
          const err = error as AxiosError<ProfileErrorResponse>;
          const apiErrors = err.response?.data?.errors;
          if (apiErrors) {
            Object.entries(apiErrors).forEach(([field, messages]) => {
              setError(field as keyof FormValues, { message: (messages as string[])[0] });
            });
            return;
          }
          toast.error(err.response?.data?.message ?? 'Cập nhật thất bại.');
        },
      }
    );
  };

  const initials = user?.full_name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0].toUpperCase())
    .join('') ?? '';

  return (
    <AccountLayout title="Thông tin tài khoản" subtitle="Cập nhật thông tin cá nhân của bạn.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Avatar */}
        <section className="rounded-xl border border-stone-200 bg-white p-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="grid h-20 w-20 place-items-center rounded-full bg-stone-900 text-2xl font-semibold text-white">
                {initials}
              </div>
              <button type="button" className="absolute bottom-0 right-0 grid h-7 w-7 place-items-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-sm hover:bg-stone-50">
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>
            <div>
              <p className="font-semibold">{user?.full_name}</p>
              <p className="text-xs text-stone-500">JPG, PNG. Tối đa 2MB.</p>
            </div>
          </div>
        </section>

        {/* Personal info */}
        <section className="rounded-xl border border-stone-200 bg-white p-6">
          <h2 className="mb-5 text-lg font-semibold">Thông tin cá nhân</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Họ và tên" error={errors.full_name?.message} {...register("full_name")} />
            <Field label="Email" type="email" error={errors.email?.message} {...register("email")} />
            <Field label="Số điện thoại" error={errors.phone?.message} {...register("phone")} />
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" className="h-11 rounded-lg border-stone-300" onClick={() => reset()}>
            Huỷ
          </Button>
          <Button
            type="submit"
            className="h-11 rounded-lg bg-stone-900 px-6 text-white hover:bg-stone-800"
            disabled={updateProfile.isPending || !isDirty}
          >
            {updateProfile.isPending ? 'Đang lưu…' : 'Lưu thay đổi'}
          </Button>
        </div>
      </form>
    </AccountLayout>
  );
}

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

function Field({ label, error, ...props }: FieldProps) {
  return (
    <div>
      <Label className="mb-1.5 block text-sm font-medium text-stone-700">{label}</Label>
      <Input
        className="h-11 rounded-lg border-input bg-stone-50 focus-visible:ring-amber-500"
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
