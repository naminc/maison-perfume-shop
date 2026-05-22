import { useState } from "react";
import { Plus, Pencil, Trash2, MapPin, Star } from "lucide-react";
import AccountLayout from "@/layouts/AccountLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Address {
  id: string;
  name: string;
  phone: string;
  city: string;
  district: string;
  detail: string;
  isDefault: boolean;
  label: string;
}

const INITIAL: Address[] = [
  { id: "1", name: "Nguyễn Văn A", phone: "0987 654 321", city: "TP. Hồ Chí Minh", district: "Quận 1", detail: "123 Lê Lợi, Phường Bến Nghé", isDefault: true, label: "Nhà riêng" },
  { id: "2", name: "Nguyễn Văn A", phone: "0987 654 321", city: "TP. Hồ Chí Minh", district: "Quận 3", detail: "Toà nhà ABC, 45 Võ Văn Tần", isDefault: false, label: "Văn phòng" },
  { id: "3", name: "Mẹ A", phone: "0912 345 678", city: "Hà Nội", district: "Cầu Giấy", detail: "Số 88 Trần Duy Hưng", isDefault: false, label: "Khác" },
];

const EMPTY: Omit<Address, "id" | "isDefault"> = { name: "", phone: "", city: "", district: "", detail: "", label: "Nhà riêng" };

export default function Addresses() {
  const [list, setList] = useState<Address[]>(INITIAL);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [form, setForm] = useState(EMPTY);

  const openNew = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (a: Address) => { setEditing(a); setForm(a); setOpen(true); };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      setList((prev) => prev.map((a) => (a.id === editing.id ? { ...editing, ...form } : a)));
      toast.success("Đã cập nhật địa chỉ");
    } else {
      setList((prev) => [...prev, { ...form, id: String(Date.now()), isDefault: prev.length === 0 }]);
      toast.success("Đã thêm địa chỉ");
    }
    setOpen(false);
  };

  const remove = (id: string) => {
    setList((prev) => prev.filter((a) => a.id !== id));
    toast.success("Đã xoá địa chỉ");
  };

  const setDefault = (id: string) => {
    setList((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
    toast.success("Đã đặt làm địa chỉ mặc định");
  };

  return (
    <AccountLayout title="Địa chỉ giao hàng" subtitle="Quản lý các địa chỉ nhận hàng của bạn.">
      <div className="flex justify-end">
        <Button onClick={openNew} className="h-11 rounded-lg bg-stone-900 px-5 text-white hover:bg-stone-800">
          <Plus className="mr-1.5 h-4 w-4" /> Thêm địa chỉ mới
        </Button>
      </div>

      {list.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-white py-16 text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-stone-100">
            <MapPin className="h-7 w-7 text-stone-400" />
          </div>
          <h2 className="text-lg font-medium">Chưa có địa chỉ nào</h2>
          <p className="mt-1 text-sm text-stone-500">Thêm địa chỉ để thanh toán nhanh hơn.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {list.map((a) => (
            <article key={a.id} className={`relative rounded-xl border bg-white p-5 ${a.isDefault ? "border-stone-900" : "border-stone-200"}`}>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700">{a.label}</span>
                  {a.isDefault && (
                    <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                      <Star className="h-3 w-3 fill-current" /> Mặc định
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(a)} className="grid h-8 w-8 place-items-center rounded-full text-stone-500 hover:bg-stone-100" aria-label="Sửa">
                    <Pencil className="h-4 w-4" />
                  </button>
                  {!a.isDefault && (
                    <button onClick={() => remove(a.id)} className="grid h-8 w-8 place-items-center rounded-full text-stone-500 hover:bg-stone-100 hover:text-red-600" aria-label="Xoá">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <p className="font-semibold">{a.name}</p>
              <p className="text-sm text-stone-500">{a.phone}</p>
              <p className="mt-2 text-sm text-stone-700">{a.detail}</p>
              <p className="text-sm text-stone-500">{a.district}, {a.city}</p>

              {!a.isDefault && (
                <button onClick={() => setDefault(a.id)} className="mt-4 text-xs font-medium text-amber-700 hover:underline">
                  Đặt làm địa chỉ mặc định
                </button>
              )}
            </article>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Họ và tên" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
              <Field label="Số điện thoại" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required />
              <Field label="Tỉnh / Thành phố" value={form.city} onChange={(v) => setForm({ ...form, city: v })} required />
              <Field label="Quận / Huyện" value={form.district} onChange={(v) => setForm({ ...form, district: v })} required />
            </div>
            <Field label="Địa chỉ cụ thể" value={form.detail} onChange={(v) => setForm({ ...form, detail: v })} required />
            <div>
              <Label className="mb-1.5 block text-sm font-medium text-stone-700">Loại địa chỉ</Label>
              <div className="flex gap-2">
                {["Nhà riêng", "Văn phòng", "Khác"].map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setForm({ ...form, label: l })}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
                      form.label === l ? "border-stone-900 bg-stone-900 text-white" : "border-stone-300 hover:border-stone-400"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Huỷ</Button>
              <Button type="submit" className="bg-stone-900 text-white hover:bg-stone-800">{editing ? "Lưu" : "Thêm"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AccountLayout>
  );
}

function Field({ label, value, onChange, required }: { label: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <div>
      <Label className="mb-1.5 block text-sm font-medium text-stone-700">{label}{required && <span className="text-red-500"> *</span>}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} required={required} className="h-11 rounded-lg border-input bg-stone-50 focus-visible:ring-amber-500" />
    </div>
  );
}
