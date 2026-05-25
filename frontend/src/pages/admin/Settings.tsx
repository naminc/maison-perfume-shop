import { useEffect } from "react";
import { useForm, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/admin/ui/textarea";
import { ButtonSpinner } from "@/components/shared/ButtonSpinner";
import { ADMIN_SETTING_FIELDS, ADMIN_SETTINGS_DEFAULTS, ADMIN_SETTINGS_TABS } from "@/constants/admin-settings";
import { useAdminSettings, useUpdateAdminSettings } from "@/hooks/useAdminSettings";
import { applyApiErrors } from "@/lib/form-utils";
import { wasApiConnectionNotified } from "@/lib/api";
import { adminSettingsSchema, type AdminSettingsFormValues } from "@/schemas/admin/setting";
import type { AdminSettingKey, AdminSettingsGrouped, UpdateAdminSettingsPayload } from "@/types/admin/setting";
import type { ApiErrorResponse } from "@/types/auth";

export default function Settings() {
  const settingsQuery = useAdminSettings();
  const updateSettings = useUpdateAdminSettings();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<AdminSettingsFormValues>({
    resolver: zodResolver(adminSettingsSchema),
    defaultValues: ADMIN_SETTINGS_DEFAULTS,
  });

  useEffect(() => {
    if (settingsQuery.data) {
      reset(mapGroupedSettingsToForm(settingsQuery.data));
    }
  }, [settingsQuery.data, reset]);

  const onSubmit = (values: AdminSettingsFormValues) => {
    updateSettings.mutate(toSettingsPayload(values), {
      onSuccess: (data) => {
        reset(mapGroupedSettingsToForm(data));
        toast.success("Đã cập nhật cài đặt hệ thống.");
      },
      onError: (error) => {
        if (wasApiConnectionNotified(error)) return;
        const err = error as AxiosError<ApiErrorResponse<AdminSettingsFormValues>>;
        if (applyApiErrors(err.response?.data?.errors, setError)) return;
        toast.error(err.response?.data?.message ?? "Cập nhật cài đặt thất bại.");
      },
    });
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Cài đặt</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý thông tin shop, mạng xã hội và SEO cho hệ thống Maison.
          </p>
        </div>
      </div>

      {settingsQuery.isLoading ? (
        <SettingsSkeleton />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto">
              {ADMIN_SETTINGS_TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {ADMIN_SETTINGS_TABS.map((tab) => (
              <TabsContent key={tab.value} value={tab.value} className="mt-5">
                <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {tab.fields.map((field) => (
                      <SettingField
                        key={field}
                        name={field}
                        register={register}
                        error={errors[field]?.message}
                      />
                    ))}
                  </div>
                </section>
              </TabsContent>
            ))}
          </Tabs>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={updateSettings.isPending || !isDirty}
              className="h-10 bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-primary/70 disabled:text-primary-foreground disabled:opacity-60"
            >
              {updateSettings.isPending ? (
                <>
                  <ButtonSpinner /> Đang lưu...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Lưu cài đặt
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

function SettingField({
  name,
  register,
  error,
}: {
  name: AdminSettingKey;
  register: UseFormRegister<AdminSettingsFormValues>;
  error?: string;
}) {
  const field = ADMIN_SETTING_FIELDS[name];
  const isMultiline = "multiline" in field && field.multiline;
  const inputType = "type" in field ? field.type : "text";
  const className = "rounded-lg bg-white";

  return (
    <div className={isMultiline ? "space-y-1.5 sm:col-span-2" : "space-y-1.5"}>
      <Label htmlFor={name} className="text-sm font-medium text-stone-700">
        {field.label}
      </Label>
      {isMultiline ? (
        <Textarea
          id={name}
          rows={name === "meta_description" ? 4 : 3}
          placeholder={field.placeholder}
          className={className}
          {...register(name)}
        />
      ) : (
        <Input
          id={name}
          type={inputType}
          placeholder={field.placeholder}
          className={`h-10 ${className}`}
          {...register(name)}
        />
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-9 w-72 rounded-lg" />
      <section className="rounded-xl border border-stone-200 bg-white p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function mapGroupedSettingsToForm(settings: AdminSettingsGrouped): AdminSettingsFormValues {
  const values: AdminSettingsFormValues = { ...ADMIN_SETTINGS_DEFAULTS };

  Object.values(settings).forEach((group) => {
    if (!group) return;

    Object.entries(group).forEach(([key, value]) => {
      if (key in values) {
        values[key as AdminSettingKey] = value ?? "";
      }
    });
  });

  return values;
}

function toSettingsPayload(values: AdminSettingsFormValues): UpdateAdminSettingsPayload {
  const payload = {} as UpdateAdminSettingsPayload;

  (Object.keys(ADMIN_SETTINGS_DEFAULTS) as AdminSettingKey[]).forEach((key) => {
    const value = values[key]?.trim() ?? "";
    payload[key] = value === "" ? null : value;
  });

  return payload;
}
