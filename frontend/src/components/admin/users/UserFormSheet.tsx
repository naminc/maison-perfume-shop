import { useEffect, type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ButtonSpinner } from "@/components/shared/ButtonSpinner";
import { USER_ROLE_OPTIONS, USER_STATUS_OPTIONS } from "@/constants/admin-users";
import { useUpdateUser } from "@/hooks/useAdminUsers";
import { wasApiConnectionNotified } from "@/lib/api";
import { applyApiErrors } from "@/lib/form-utils";
import { cn } from "@/lib/utils";
import { adminUserSchema, type AdminUserFormInput, type AdminUserFormValues } from "@/schemas/admin/user";
import type { ApiErrorResponse } from "@/types/auth";
import type { AdminUser, AdminUserPayload } from "@/types/admin/user";

interface UserFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: AdminUser | null;
}

export function UserFormSheet({
  open,
  onOpenChange,
  user,
}: UserFormSheetProps) {
  const updateUser = useUpdateUser();
  const isSubmitting = updateUser.isPending;

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<AdminUserFormInput, unknown, AdminUserFormValues>({
    resolver: zodResolver(adminUserSchema),
    defaultValues: getDefaultValues(user),
  });

  useEffect(() => {
    if (open) {
      reset(getDefaultValues(user));
    }
  }, [open, reset, user]);

  const onSubmit = (values: AdminUserFormValues) => {
    if (!user) return;

    const payload = toPayload(values);

    updateUser.mutate({ id: user.id, payload }, {
      onSuccess: () => {
        toast.success("Đã cập nhật người dùng.");
        onOpenChange(false);
      },
      onError: (error: unknown) => {
        if (wasApiConnectionNotified(error)) return;
        const err = error as AxiosError<ApiErrorResponse<AdminUserFormInput>>;
        if (applyApiErrors(err.response?.data?.errors, setError)) return;
        toast.error(err.response?.data?.message ?? "Lưu người dùng thất bại.");
      },
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-[480px]">
        <SheetHeader>
          <SheetTitle>Thông tin người dùng</SheetTitle>
          <SheetDescription>
            Cập nhật hồ sơ, vai trò và trạng thái tài khoản.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
          <fieldset className="space-y-3">
            <legend className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Thông tin cơ bản</legend>
            <Field error={errors.full_name?.message} label="Họ tên *" htmlFor="full_name">
              <Input id="full_name" className="h-9" placeholder="Nguyễn Văn A" {...register("full_name")} />
            </Field>
            <Field error={errors.email?.message} label="Email *" htmlFor="email">
              <Input id="email" type="email" className="h-9" placeholder="customer@example.com" {...register("email")} />
            </Field>
            <Field error={errors.phone?.message} label="Số điện thoại" htmlFor="phone">
              <Input id="phone" className="h-9" placeholder="0987654321" {...register("phone")} />
            </Field>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Phân quyền</legend>
            <Field error={errors.role?.message} label="Vai trò" htmlFor="role">
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="role" className="h-9 focus:border-primary focus:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {USER_ROLE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field error={errors.status?.message} label="Trạng thái" htmlFor="status">
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="status" className="h-9 focus:border-primary focus:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {USER_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          </fieldset>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={isSubmitting || !user}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting && <ButtonSpinner />}
              {isSubmitting ? "Đang lưu..." : "Lưu"}
            </Button>
            <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => onOpenChange(false)} className="flex-1">
              Huỷ
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function Field({
  children,
  className,
  error,
  htmlFor,
  label,
}: {
  children: ReactNode;
  className?: string;
  error?: string;
  htmlFor: string;
  label: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function getDefaultValues(user?: AdminUser | null): AdminUserFormInput {
  return {
    full_name: user?.full_name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    role: user?.role ?? "user",
    status: user?.status ?? "active",
  };
}

function toPayload(values: AdminUserFormValues): AdminUserPayload {
  return {
    full_name: values.full_name.trim(),
    email: values.email.trim(),
    phone: normalizeOptionalString(values.phone),
    role: values.role,
    status: values.status,
  };
}

function normalizeOptionalString(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed === "" ? null : trimmed;
}
