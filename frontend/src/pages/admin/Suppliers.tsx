import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import type { AxiosError } from "axios";
import { Download, Pencil, Plus, RefreshCw, Trash2, Truck } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { adminSupplierApi } from "@/api/admin/supplier";
import { useCreateSupplier, useDeleteSupplier, useSuppliers, useUpdateSupplier } from "@/hooks/useSuppliers";
import { wasApiConnectionNotified } from "@/lib/api";
import { formatDateTime } from "@/lib/date-time";
import { exportExcel, type ExcelColumn } from "@/lib/export-excel";
import { supplierSchema } from "@/schemas/admin/supplier";
import type { ApiErrorResponse } from "@/types/auth";
import type { Supplier, SupplierPayload, SupplierStatus } from "@/types/supplier";

const EMPTY: SupplierPayload = { name: "", code: "", contact_name: "", phone: "", email: "", address: "", tax_code: "", note: "", status: "active" };

export default function Suppliers() {
  const [search, setSearch] = useState(""); const [debounced, setDebounced] = useState("");
  const [status, setStatus] = useState<SupplierStatus | "all">("all"); const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Supplier | null>(null); const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState<Supplier | null>(null); const [form, setForm] = useState<SupplierPayload>(EMPTY);
  const query = useSuppliers({ search: debounced, status, page, per_page: 10 });
  const create = useCreateSupplier(); const update = useUpdateSupplier(); const remove = useDeleteSupplier();
  useEffect(() => { const id = window.setTimeout(() => setDebounced(search.trim()), 300); return () => window.clearTimeout(id); }, [search]);
  useEffect(() => setPage(1), [debounced, status]);

  const submit = (event: FormEvent) => {
    event.preventDefault(); const parsed = supplierSchema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.");
    const payload = clean(form); const options = { onSuccess: () => { toast.success(editing ? "Đã cập nhật nhà cung cấp." : "Đã thêm nhà cung cấp."); setOpen(false); }, onError: errorToast };
    if (editing) update.mutate({ id: editing.id, payload }, options);
    else create.mutate(payload, options);
  };
  const showCreate = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
  const showEdit = (item: Supplier) => { setEditing(item); setForm({ name: item.name, code: item.code, contact_name: item.contact_name ?? "", phone: item.phone ?? "", email: item.email ?? "", address: item.address ?? "", tax_code: item.tax_code ?? "", note: item.note ?? "", status: item.status }); setOpen(true); };
  const exportRows = async () => { const result = await adminSupplierApi.list({ search: debounced, status, per_page: 100 }); await exportExcel({ rows: result.data, columns: COLUMNS, filename: "maison-suppliers", sheetName: "Nhà cung cấp" }); toast.success("Đã xuất danh sách nhà cung cấp."); };
  const saving = create.isPending || update.isPending;

  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-semibold">Nhà cung cấp</h1><p className="text-sm text-muted-foreground">{query.data?.total ?? 0} nhà cung cấp</p></div><div className="flex gap-2"><Button variant="outline" onClick={exportRows}><Download className="h-4 w-4"/>Xuất Excel</Button><Button onClick={showCreate}><Plus className="h-4 w-4"/>Thêm nhà cung cấp</Button></div></div>
    <Card className="flex flex-col gap-3 p-4 sm:flex-row"><Input placeholder="Tìm tên, mã, điện thoại, email..." value={search} onChange={(e) => setSearch(e.target.value)} className="sm:max-w-sm"/><Select value={status} onValueChange={(v) => setStatus(v as SupplierStatus | "all")}><SelectTrigger className="sm:w-48"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">Tất cả trạng thái</SelectItem><SelectItem value="active">Đang hoạt động</SelectItem><SelectItem value="inactive">Tạm ngưng</SelectItem></SelectContent></Select><Button variant="outline" className="sm:ml-auto" onClick={() => query.refetch()}><RefreshCw className={`h-4 w-4 ${query.isFetching ? "animate-spin" : ""}`}/>Làm mới</Button></Card>
    <Card className="overflow-hidden"><Table><TableHeader><TableRow><TableHead className="w-14">STT</TableHead><TableHead>Mã</TableHead><TableHead>Nhà cung cấp</TableHead><TableHead>Người liên hệ</TableHead><TableHead>Điện thoại</TableHead><TableHead>Email</TableHead><TableHead>Trạng thái</TableHead><TableHead>Cập nhật</TableHead><TableHead className="text-right">Thao tác</TableHead></TableRow></TableHeader><TableBody>
      {query.isLoading ? <TableRow><TableCell colSpan={9} className="h-28 text-center">Đang tải...</TableCell></TableRow> : (query.data?.data ?? []).length === 0 ? <TableRow><TableCell colSpan={9} className="h-28 text-center text-muted-foreground"><Truck className="mx-auto mb-2 h-6 w-6"/>Không có nhà cung cấp.</TableCell></TableRow> : query.data!.data.map((item, index) => <TableRow key={item.id}><TableCell>{(page - 1) * 10 + index + 1}</TableCell><TableCell className="font-mono text-xs">{item.code}</TableCell><TableCell className="font-medium">{item.name}</TableCell><TableCell>{item.contact_name ?? "-"}</TableCell><TableCell>{item.phone ?? "-"}</TableCell><TableCell>{item.email ?? "-"}</TableCell><TableCell><Badge variant={item.status === "active" ? "default" : "destructive"}>{item.status === "active" ? "Hoạt động" : "Tạm ngưng"}</Badge></TableCell><TableCell className="whitespace-nowrap">{formatDateTime(item.updated_at)}</TableCell><TableCell><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" title="Sửa" onClick={() => showEdit(item)}><Pencil className="h-4 w-4"/></Button><Button variant="ghost" size="icon" title="Xoá" onClick={() => setDeleting(item)}><Trash2 className="h-4 w-4 text-destructive"/></Button></div></TableCell></TableRow>)}
    </TableBody></Table><Pagination page={page} last={query.data?.last_page ?? 1} setPage={setPage}/></Card>

    <Sheet open={open} onOpenChange={setOpen}><SheetContent className="w-full overflow-y-auto sm:max-w-lg"><SheetHeader><SheetTitle>{editing ? "Sửa nhà cung cấp" : "Thêm nhà cung cấp"}</SheetTitle><SheetDescription>Thông tin liên hệ và trạng thái nhà cung cấp.</SheetDescription></SheetHeader><form onSubmit={submit} className="mt-6 space-y-4"><Field label="Tên nhà cung cấp *"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}/></Field><div className="grid grid-cols-2 gap-3"><Field label="Mã"><Input value={form.code ?? ""} placeholder="Tự động nếu để trống" onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}/></Field><Field label="Trạng thái"><Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as SupplierStatus })}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="active">Hoạt động</SelectItem><SelectItem value="inactive">Tạm ngưng</SelectItem></SelectContent></Select></Field></div><Field label="Người liên hệ"><Input value={form.contact_name ?? ""} onChange={(e) => setForm({ ...form, contact_name: e.target.value })}/></Field><div className="grid grid-cols-2 gap-3"><Field label="Điện thoại"><Input value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })}/></Field><Field label="Email"><Input type="email" value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })}/></Field></div><Field label="Mã số thuế"><Input value={form.tax_code ?? ""} onChange={(e) => setForm({ ...form, tax_code: e.target.value })}/></Field><Field label="Địa chỉ"><Input value={form.address ?? ""} onChange={(e) => setForm({ ...form, address: e.target.value })}/></Field><Field label="Ghi chú"><Textarea value={form.note ?? ""} onChange={(e) => setForm({ ...form, note: e.target.value })}/></Field><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Huỷ</Button><Button disabled={saving}>{saving ? "Đang lưu..." : "Lưu"}</Button></div></form></SheetContent></Sheet>
    <AlertDialog open={Boolean(deleting)} onOpenChange={(v) => !v && setDeleting(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Xoá nhà cung cấp?</AlertDialogTitle><AlertDialogDescription>Nhà cung cấp sẽ được ẩn nhưng lịch sử phiếu nhập vẫn được giữ.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Huỷ</AlertDialogCancel><AlertDialogAction onClick={() => deleting && remove.mutate(deleting.id, { onSuccess: () => { toast.success("Đã xoá nhà cung cấp."); setDeleting(null); }, onError: errorToast })}>Xoá</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>;
}

function Field({ label, children }: { label: string; children: ReactNode }) { return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>; }
function Pagination({ page, last, setPage }: { page: number; last: number; setPage: (value: number) => void }) { return <div className="flex justify-end gap-2 border-t p-3"><Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Trước</Button><Button size="sm" variant="outline" disabled={page >= last} onClick={() => setPage(page + 1)}>Sau</Button></div>; }
function clean(form: SupplierPayload): SupplierPayload { const optional = (v?: string | null) => v?.trim() || null; return { ...form, name: form.name.trim(), code: optional(form.code), contact_name: optional(form.contact_name), phone: optional(form.phone), email: optional(form.email), address: optional(form.address), tax_code: optional(form.tax_code), note: optional(form.note) }; }
function errorToast(error: unknown) { if (wasApiConnectionNotified(error)) return; const e = error as AxiosError<ApiErrorResponse>; const errors = e.response?.data?.errors as Record<string, string[]> | undefined; toast.error((errors && Object.values(errors).flat()[0]) || e.response?.data?.message || "Thao tác thất bại."); }
const COLUMNS: ExcelColumn<Supplier>[] = [{ header: "Mã", accessor: (r) => r.code }, { header: "Nhà cung cấp", accessor: (r) => r.name }, { header: "Người liên hệ", accessor: (r) => r.contact_name }, { header: "Điện thoại", accessor: (r) => r.phone }, { header: "Email", accessor: (r) => r.email }, { header: "Trạng thái", accessor: (r) => r.status === "active" ? "Hoạt động" : "Tạm ngưng" }];
