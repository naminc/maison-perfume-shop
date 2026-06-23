import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import type { AxiosError } from "axios";
import { BadgePercent, Download, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { adminCouponApi } from "@/api/admin/coupon";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { ButtonSpinner } from "@/components/shared/ButtonSpinner";
import {
  COUPON_PAGE_SIZE,
  COUPON_STATUS_LABELS,
  COUPON_STATUS_OPTIONS,
  COUPON_TYPE_LABELS,
  COUPON_TYPE_OPTIONS,
} from "@/constants/coupon";
import { useAdminCoupons, useCreateCoupon, useDeleteCoupon, useUpdateCoupon } from "@/hooks/useCoupons";
import { wasApiConnectionNotified } from "@/lib/api";
import { formatDateTime } from "@/lib/date-time";
import { exportExcel, type ExcelColumn } from "@/lib/export-excel";
import { formatVnd } from "@/lib/product-utils";
import type { ApiErrorResponse } from "@/types/auth";
import type {
  Coupon,
  CouponListParams,
  CouponListStatusFilter,
  CouponListTypeFilter,
  CouponPayload,
  CouponStatus,
  CouponType,
} from "@/types/coupon";

interface CouponFormState {
  code: string;
  name: string;
  description: string;
  type: CouponType;
  value: string;
  min_order_amount: string;
  max_discount_amount: string;
  usage_limit: string;
  per_user_limit: string;
  starts_at: string;
  expires_at: string;
  status: CouponStatus;
}

const EMPTY_FORM: CouponFormState = {
  code: "",
  name: "",
  description: "",
  type: "percent",
  value: "",
  min_order_amount: "0",
  max_discount_amount: "",
  usage_limit: "",
  per_user_limit: "",
  starts_at: "",
  expires_at: "",
  status: "active",
};

export default function Coupons() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<CouponListStatusFilter>("all");
  const [type, setType] = useState<CouponListTypeFilter>("all");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [form, setForm] = useState<CouponFormState>(EMPTY_FORM);
  const [deletingCoupon, setDeletingCoupon] = useState<Coupon | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();

  const listParams = useMemo<CouponListParams>(() => ({
    search: debouncedSearch,
    status,
    type,
    page,
    per_page: COUPON_PAGE_SIZE,
  }), [debouncedSearch, page, status, type]);

  const couponsQuery = useAdminCoupons(listParams);
  const coupons = couponsQuery.data?.data ?? [];
  const hasFilters = Boolean(debouncedSearch.trim()) || status !== "all" || type !== "all";
  const isSaving = createCoupon.isPending || updateCoupon.isPending;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, type]);

  const openCreate = () => {
    setEditingCoupon(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setForm(formFromCoupon(coupon));
    setDialogOpen(true);
  };

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setStatus("all");
    setType("all");
  };

  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = buildPayload(form);
    const options = {
      onSuccess: () => {
        toast.success(editingCoupon ? "Đã cập nhật mã giảm giá." : "Đã thêm mã giảm giá.");
        setDialogOpen(false);
        setEditingCoupon(null);
        setForm(EMPTY_FORM);
      },
      onError: (error: unknown) => {
        if (wasApiConnectionNotified(error)) return;
        toast.error(getApiErrorMessage(error, "Lưu mã giảm giá thất bại."));
      },
    };

    if (editingCoupon) {
      updateCoupon.mutate({ id: editingCoupon.id, payload }, options);
      return;
    }

    createCoupon.mutate(payload, options);
  };

  const confirmDelete = () => {
    if (!deletingCoupon) return;

    deleteCoupon.mutate(deletingCoupon.id, {
      onSuccess: () => {
        toast.success("Đã xoá mã giảm giá.");
        setDeletingCoupon(null);
        if (coupons.length === 1 && page > 1) {
          setPage((current) => current - 1);
        }
      },
      onError: (error) => {
        if (wasApiConnectionNotified(error)) return;
        toast.error(getApiErrorMessage(error, "Xoá mã giảm giá thất bại."));
      },
    });
  };

  const exportCoupons = async () => {
    setIsExporting(true);

    try {
      const response = await adminCouponApi.getCoupons({
        search: debouncedSearch,
        status,
        type,
        per_page: 100,
      });

      if (response.data.length === 0) {
        toast.error("Không có mã giảm giá để xuất.");
        return;
      }

      await exportExcel({
        rows: response.data,
        columns: COUPON_EXPORT_COLUMNS,
        filename: "maison-coupons",
        sheetName: "Mã giảm giá",
      });

      toast.success("Đã xuất file Excel mã giảm giá.");
    } catch (error) {
      if (wasApiConnectionNotified(error)) return;
      toast.error(getApiErrorMessage(error, "Xuất Excel thất bại."));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Mã giảm giá</h1>
          <p className="text-sm text-muted-foreground">
            {couponsQuery.data?.total ?? 0} mã
          </p>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <Button
            variant="outline"
            onClick={exportCoupons}
            disabled={isExporting || couponsQuery.isLoading}
            className="gap-1.5"
          >
            {isExporting ? <ButtonSpinner /> : <Download className="h-4 w-4" />}
            Xuất Excel
          </Button>
          <Button onClick={openCreate} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Thêm mã
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm mã, tên chương trình..."
            className="h-10 lg:max-w-sm"
          />
          <Select value={status} onValueChange={(value) => setStatus(value as CouponListStatusFilter)}>
            <SelectTrigger className="h-10 lg:w-44">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              {COUPON_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={type} onValueChange={(value) => setType(value as CouponListTypeFilter)}>
            <SelectTrigger className="h-10 lg:w-44">
              <SelectValue placeholder="Loại mã" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại mã</SelectItem>
              {COUPON_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2 lg:ml-auto">
            <Button type="button" variant="outline" onClick={clearFilters} disabled={!hasFilters}>
              Xoá lọc
            </Button>
            <Button type="button" variant="outline" onClick={() => couponsQuery.refetch()}>
              <RefreshCw className={`h-4 w-4 ${couponsQuery.isFetching ? "animate-spin" : ""}`} />
              Làm mới
            </Button>
          </div>
        </div>
      </Card>

      {couponsQuery.isError ? (
        <div className="flex flex-col items-center justify-center rounded-md border border-border bg-white px-4 py-14 text-center">
          <BadgePercent className="mb-3 h-10 w-10 text-muted-foreground/50" strokeWidth={1.5} />
          <h3 className="text-base font-semibold text-foreground">Không thể tải mã giảm giá</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {getApiErrorMessage(couponsQuery.error, "Vui lòng thử lại sau.")}
          </p>
          <Button className="mt-4" onClick={() => couponsQuery.refetch()}>
            <RefreshCw className="h-4 w-4" />
            Thử lại
          </Button>
        </div>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14 text-center">STT</TableHead>
                <TableHead>Mã</TableHead>
                <TableHead>Tên chương trình</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Giá trị</TableHead>
                <TableHead>Lượt dùng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thời hạn</TableHead>
                <TableHead>Ngày cập nhật</TableHead>
                <TableHead className="w-24 text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {couponsQuery.isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={10}>
                      <div className="h-8 animate-pulse rounded bg-muted" />
                    </TableCell>
                  </TableRow>
                ))
              ) : coupons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-32 text-center text-muted-foreground">
                    Không có mã giảm giá phù hợp.
                  </TableCell>
                </TableRow>
              ) : (
                coupons.map((coupon, index) => (
                  <TableRow key={coupon.id}>
                    <TableCell className="text-center text-muted-foreground">
                      {((couponsQuery.data?.current_page ?? 1) - 1) * (couponsQuery.data?.per_page ?? COUPON_PAGE_SIZE) + index + 1}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm font-semibold">{coupon.code}</span>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[280px]">
                        <p className="font-medium">{coupon.name}</p>
                        {coupon.description && <p className="line-clamp-1 text-xs text-muted-foreground">{coupon.description}</p>}
                      </div>
                    </TableCell>
                    <TableCell>{COUPON_TYPE_LABELS[coupon.type]}</TableCell>
                    <TableCell>{formatCouponValue(coupon)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {coupon.used_count}/{coupon.usage_limit ?? "∞"}
                      </div>
                      {coupon.per_user_limit && (
                        <div className="text-xs text-muted-foreground">Mỗi khách {coupon.per_user_limit}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={coupon.status === "active" ? "default" : "destructive"}
                        className={coupon.status === "active" ? "bg-emerald-600 hover:bg-emerald-600" : ""}
                      >
                        {COUPON_STATUS_LABELS[coupon.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <div>{coupon.starts_at ? formatDateTime(coupon.starts_at, "-") : "Không giới hạn"}</div>
                      <div>{coupon.expires_at ? formatDateTime(coupon.expires_at, "-") : "Không giới hạn"}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(coupon.updated_at, "-")}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button type="button" variant="ghost" size="icon" onClick={() => openEdit(coupon)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" onClick={() => setDeletingCoupon(coupon)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-muted-foreground">
            <span>
              Hiển thị {couponsQuery.data?.from ?? 0}-{couponsQuery.data?.to ?? 0} trong {couponsQuery.data?.total ?? 0} mã
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1 || couponsQuery.isFetching}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Trước
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= (couponsQuery.data?.last_page ?? 1) || couponsQuery.isFetching}
                onClick={() => setPage((current) => current + 1)}
              >
                Sau
              </Button>
            </div>
          </div>
        </Card>
      )}

      <CouponDialog
        open={dialogOpen}
        form={form}
        editingCoupon={editingCoupon}
        isSaving={isSaving}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingCoupon(null);
            setForm(EMPTY_FORM);
          }
        }}
        onFormChange={setForm}
        onSubmit={submitForm}
      />

      <AlertDialog open={Boolean(deletingCoupon)} onOpenChange={(open) => !open && setDeletingCoupon(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá mã {deletingCoupon?.code}?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Mã giảm giá sẽ bị xoá khỏi trang quản trị.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteCoupon.isPending}>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteCoupon.isPending}
              onClick={(event) => {
                event.preventDefault();
                confirmDelete();
              }}
            >
              {deleteCoupon.isPending && <ButtonSpinner />}
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <button
        type="button"
        onClick={openCreate}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 sm:hidden"
        aria-label="Thêm mã giảm giá"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}

function CouponDialog({
  open,
  form,
  editingCoupon,
  isSaving,
  onOpenChange,
  onFormChange,
  onSubmit,
}: {
  open: boolean;
  form: CouponFormState;
  editingCoupon: Coupon | null;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onFormChange: (form: CouponFormState) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const update = <K extends keyof CouponFormState>(key: K, value: CouponFormState[K]) => {
    onFormChange({ ...form, [key]: value });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingCoupon ? "Cập nhật mã giảm giá" : "Thêm mã giảm giá"}</DialogTitle>
          <DialogDescription>
            Thiết lập điều kiện áp dụng mã giảm giá cho checkout.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Mã giảm giá" required>
              <Input
                value={form.code}
                onChange={(event) => update("code", event.target.value.toUpperCase())}
                placeholder="WELCOME10"
              />
            </Field>
            <Field label="Tên chương trình" required>
              <Input
                value={form.name}
                onChange={(event) => update("name", event.target.value)}
                placeholder="Giảm 10% đơn đầu"
              />
            </Field>
            <Field label="Loại mã" required>
              <Select value={form.type} onValueChange={(value) => update("type", value as CouponType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại mã" />
                </SelectTrigger>
                <SelectContent>
                  {COUPON_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label={form.type === "percent" ? "Phần trăm giảm" : "Giá trị giảm"}>
              <Input
                type="number"
                min="0"
                step="1000"
                value={form.value}
                onChange={(event) => update("value", event.target.value)}
                disabled={form.type === "free_shipping"}
                placeholder={form.type === "percent" ? "10" : "100000"}
              />
            </Field>
            <Field label="Đơn tối thiểu">
              <Input
                type="number"
                min="0"
                step="1000"
                value={form.min_order_amount}
                onChange={(event) => update("min_order_amount", event.target.value)}
              />
            </Field>
            <Field label="Mức giảm tối đa">
              <Input
                type="number"
                min="0"
                step="1000"
                value={form.max_discount_amount}
                onChange={(event) => update("max_discount_amount", event.target.value)}
                disabled={form.type !== "percent"}
                placeholder="150000"
              />
            </Field>
            <Field label="Giới hạn lượt dùng">
              <Input
                type="number"
                min="1"
                value={form.usage_limit}
                onChange={(event) => update("usage_limit", event.target.value)}
                placeholder="Không giới hạn"
              />
            </Field>
            <Field label="Giới hạn mỗi khách">
              <Input
                type="number"
                min="1"
                value={form.per_user_limit}
                onChange={(event) => update("per_user_limit", event.target.value)}
                placeholder="Không giới hạn"
              />
            </Field>
            <Field label="Bắt đầu">
              <Input
                type="datetime-local"
                value={form.starts_at}
                onChange={(event) => update("starts_at", event.target.value)}
              />
            </Field>
            <Field label="Kết thúc">
              <Input
                type="datetime-local"
                value={form.expires_at}
                onChange={(event) => update("expires_at", event.target.value)}
              />
            </Field>
            <Field label="Trạng thái" required>
              <Select value={form.status} onValueChange={(value) => update("status", value as CouponStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {COUPON_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Mô tả">
            <Textarea
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
              placeholder="Điều kiện áp dụng ngắn gọn..."
            />
          </Field>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              Huỷ
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <ButtonSpinner />}
              Lưu
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}{required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
    </div>
  );
}

function formFromCoupon(coupon: Coupon): CouponFormState {
  return {
    code: coupon.code,
    name: coupon.name,
    description: coupon.description ?? "",
    type: coupon.type,
    value: coupon.value ? String(Number(coupon.value)) : "",
    min_order_amount: String(Number(coupon.min_order_amount ?? 0)),
    max_discount_amount: coupon.max_discount_amount ? String(Number(coupon.max_discount_amount)) : "",
    usage_limit: coupon.usage_limit ? String(coupon.usage_limit) : "",
    per_user_limit: coupon.per_user_limit ? String(coupon.per_user_limit) : "",
    starts_at: toDatetimeLocal(coupon.starts_at),
    expires_at: toDatetimeLocal(coupon.expires_at),
    status: coupon.status,
  };
}

function buildPayload(form: CouponFormState): CouponPayload {
  return {
    code: form.code.trim().toUpperCase(),
    name: form.name.trim(),
    description: form.description.trim() || null,
    type: form.type,
    value: form.type === "free_shipping" ? null : numberOrNull(form.value),
    min_order_amount: numberOrNull(form.min_order_amount) ?? 0,
    max_discount_amount: form.type === "percent" ? numberOrNull(form.max_discount_amount) : null,
    usage_limit: integerOrNull(form.usage_limit),
    per_user_limit: integerOrNull(form.per_user_limit),
    starts_at: form.starts_at || null,
    expires_at: form.expires_at || null,
    status: form.status,
  };
}

function formatCouponValue(coupon: Coupon) {
  if (coupon.type === "free_shipping") {
    return "Miễn phí ship";
  }

  if (coupon.type === "percent") {
    const cap = coupon.max_discount_amount ? `, tối đa ${formatVnd(coupon.max_discount_amount)}` : "";

    return `${Number(coupon.value ?? 0)}%${cap}`;
  }

  return formatVnd(coupon.value);
}

function numberOrNull(value: string) {
  if (value.trim() === "") return null;
  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

function integerOrNull(value: string) {
  const number = numberOrNull(value);

  return number === null ? null : Math.max(1, Math.floor(number));
}

function toDatetimeLocal(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (input: number) => String(input).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function getApiErrorMessage(error: unknown, fallback: string) {
  const err = error as AxiosError<ApiErrorResponse>;
  const errors = err.response?.data?.errors as Record<string, string[]> | undefined;
  const firstError = errors ? Object.values(errors).flat().find(Boolean) : undefined;

  return firstError ?? err.response?.data?.message ?? err.message ?? fallback;
}

const COUPON_EXPORT_COLUMNS: ExcelColumn<Coupon>[] = [
  {
    header: "STT",
    accessor: (_coupon, index) => index + 1,
  },
  {
    header: "Mã",
    accessor: (coupon) => coupon.code,
  },
  {
    header: "Tên chương trình",
    accessor: (coupon) => coupon.name,
  },
  {
    header: "Loại",
    accessor: (coupon) => COUPON_TYPE_LABELS[coupon.type],
  },
  {
    header: "Giá trị",
    accessor: (coupon) => formatCouponValue(coupon),
  },
  {
    header: "Đơn tối thiểu",
    accessor: (coupon) => formatVnd(coupon.min_order_amount),
  },
  {
    header: "Lượt đã dùng",
    accessor: (coupon) => coupon.used_count,
  },
  {
    header: "Giới hạn lượt",
    accessor: (coupon) => coupon.usage_limit ?? "",
  },
  {
    header: "Mỗi khách",
    accessor: (coupon) => coupon.per_user_limit ?? "",
  },
  {
    header: "Trạng thái",
    accessor: (coupon) => COUPON_STATUS_LABELS[coupon.status],
  },
  {
    header: "Bắt đầu",
    accessor: (coupon) => formatDateTime(coupon.starts_at, ""),
  },
  {
    header: "Kết thúc",
    accessor: (coupon) => formatDateTime(coupon.expires_at, ""),
  },
  {
    header: "Ngày cập nhật",
    accessor: (coupon) => formatDateTime(coupon.updated_at, ""),
  },
];
