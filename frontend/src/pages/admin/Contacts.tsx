import { useEffect, useMemo, useState } from "react";
import type { AxiosError } from "axios";
import { Eye, Mail, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  CONTACT_PAGE_SIZE,
  CONTACT_STATUS_BADGE_CLASS,
  CONTACT_STATUS_FILTER_OPTIONS,
  CONTACT_STATUS_LABELS,
  CONTACT_STATUS_OPTIONS,
} from "@/constants/contact";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/admin/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ButtonSpinner } from "@/components/shared/ButtonSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/skeletons/TableSkeleton";
import { useAdminContacts, useDeleteContact, useUpdateContact } from "@/hooks/useAdminContacts";
import { wasApiConnectionNotified } from "@/lib/api";
import { formatDateTime } from "@/lib/date-time";
import type { ApiErrorResponse } from "@/types/auth";
import type { Contact, ContactListParams, ContactStatus, ContactStatusFilter } from "@/types/contact";

export default function Contacts() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<ContactStatusFilter>("all");
  const [page, setPage] = useState(1);
  const [viewingContact, setViewingContact] = useState<Contact | null>(null);
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null);
  const [editStatus, setEditStatus] = useState<ContactStatus>("pending");
  const [adminNote, setAdminNote] = useState("");

  const updateContact = useUpdateContact();
  const deleteContact = useDeleteContact();

  const listParams = useMemo<ContactListParams>(() => ({
    search: debouncedSearch,
    status,
    page,
    per_page: CONTACT_PAGE_SIZE,
  }), [debouncedSearch, page, status]);

  const contactsQuery = useAdminContacts(listParams);
  const contacts = contactsQuery.data?.data ?? [];
  const pagination = contactsQuery.data;
  const hasFilters = Boolean(debouncedSearch || status !== "all");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setStatus("all");
  };

  const openDetail = (contact: Contact) => {
    setViewingContact(contact);
    setEditStatus(contact.status);
    setAdminNote(contact.admin_note ?? "");
  };

  const saveDetail = () => {
    if (!viewingContact) return;

    updateContact.mutate(
      { id: viewingContact.id, payload: { status: editStatus, admin_note: adminNote.trim() || null } },
      {
        onSuccess: () => {
          toast.success("Đã cập nhật liên hệ.");
          setViewingContact(null);
        },
        onError: (error) => {
          if (wasApiConnectionNotified(error)) return;
          toast.error(getApiErrorMessage(error, "Cập nhật liên hệ thất bại."));
        },
      },
    );
  };

  const confirmDelete = () => {
    if (!deletingContact) return;

    deleteContact.mutate(deletingContact.id, {
      onSuccess: () => {
        toast.success("Đã xoá liên hệ.");
        setDeletingContact(null);
      },
      onError: (error) => {
        if (wasApiConnectionNotified(error)) return;
        toast.error(getApiErrorMessage(error, "Xoá liên hệ thất bại."));
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Liên hệ</h1>
          <p className="text-sm text-muted-foreground">{pagination?.total ?? 0} yêu cầu liên hệ từ khách hàng</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          disabled={contactsQuery.isFetching}
          onClick={() => contactsQuery.refetch()}
        >
          <RefreshCw className={`h-4 w-4 ${contactsQuery.isFetching ? "animate-spin" : ""}`} />
          Làm mới
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-9 w-full rounded-md bg-white lg:w-72"
            placeholder="Tìm theo tên, email, tiêu đề..."
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as ContactStatusFilter)}
            className="h-9 rounded-md border border-input bg-white px-3 text-sm"
          >
            {CONTACT_STATUS_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
              Xoá lọc
            </Button>
          )}
        </div>
      </Card>

      {contactsQuery.isLoading ? (
        <div className="rounded-md border border-border bg-white p-4">
          <TableSkeleton rows={6} columns={6} />
        </div>
      ) : contactsQuery.isError ? (
        <EmptyState
          icon={Mail}
          title="Không thể tải danh sách liên hệ"
          description="Vui lòng thử lại sau."
          actionLabel="Thử lại"
          onAction={() => contactsQuery.refetch()}
        />
      ) : contacts.length === 0 ? (
        <EmptyState
          icon={Mail}
          title={hasFilters ? "Không tìm thấy liên hệ" : "Chưa có liên hệ"}
          description={hasFilters ? "Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm." : "Yêu cầu liên hệ mới sẽ xuất hiện tại đây."}
        />
      ) : (
        <div className="overflow-x-auto rounded-md border border-border bg-white">
          <Table className="min-w-[1000px] table-fixed">
            <colgroup>
              <col className="w-16" />
              <col className="w-[22%]" />
              <col className="w-[34%]" />
              <col className="w-32" />
              <col className="w-40" />
              <col className="w-28" />
            </colgroup>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">STT</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Nội dung</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày gửi</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact, index) => (
                <TableRow key={contact.id}>
                  <TableCell className="text-center text-muted-foreground">
                    {((pagination?.current_page ?? page) - 1) * (pagination?.per_page ?? CONTACT_PAGE_SIZE) + index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground">{contact.name}</div>
                    <div className="mt-1 truncate text-xs text-muted-foreground">{contact.email}</div>
                    {contact.phone && <div className="text-xs text-muted-foreground">{contact.phone}</div>}
                  </TableCell>
                  <TableCell>
                    <div className="line-clamp-1 font-medium text-foreground">{contact.subject ?? "Không có tiêu đề"}</div>
                    <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{contact.message}</div>
                    {contact.admin_note && <div className="mt-1 line-clamp-1 text-xs text-amber-700">Ghi chú: {contact.admin_note}</div>}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${CONTACT_STATUS_BADGE_CLASS[contact.status]}`}>
                      {CONTACT_STATUS_LABELS[contact.status]}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDateTime(contact.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openDetail(contact)}
                        aria-label="Xem chi tiết liên hệ"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        disabled={deleteContact.isPending}
                        onClick={() => setDeletingContact(contact)}
                        aria-label="Xoá liên hệ"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {pagination && pagination.last_page > 1 && (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
            Trước
          </Button>
          <Button variant="outline" size="sm" disabled={page >= pagination.last_page} onClick={() => setPage((current) => current + 1)}>
            Sau
          </Button>
        </div>
      )}

      <Dialog open={Boolean(viewingContact)} onOpenChange={(open) => !open && setViewingContact(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chi tiết liên hệ</DialogTitle>
            <DialogDescription>
              Gửi lúc {viewingContact ? formatDateTime(viewingContact.created_at) : ""}
            </DialogDescription>
          </DialogHeader>

          {viewingContact && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-stone-50 p-4 text-sm">
                <div className="font-medium text-foreground">{viewingContact.name}</div>
                <div className="mt-1 text-muted-foreground">
                  <a href={`mailto:${viewingContact.email}`} className="hover:text-amber-700">{viewingContact.email}</a>
                  {viewingContact.phone && <span> · {viewingContact.phone}</span>}
                </div>
                {viewingContact.subject && (
                  <div className="mt-3 font-medium text-foreground">{viewingContact.subject}</div>
                )}
                <p className="mt-2 whitespace-pre-wrap text-foreground">{viewingContact.message}</p>
              </div>

              <div className="grid gap-3">
                <label className="text-sm font-medium text-foreground" htmlFor="contact-status">
                  Trạng thái
                </label>
                <select
                  id="contact-status"
                  value={editStatus}
                  onChange={(event) => setEditStatus(event.target.value as ContactStatus)}
                  className="h-9 rounded-md border border-input bg-white px-3 text-sm"
                >
                  {CONTACT_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>

                <label className="text-sm font-medium text-foreground" htmlFor="contact-note">
                  Ghi chú nội bộ
                </label>
                <textarea
                  id="contact-note"
                  value={adminNote}
                  onChange={(event) => setAdminNote(event.target.value)}
                  className="min-h-24 rounded-md border border-input bg-white px-3 py-2 text-sm"
                  placeholder="Ghi chú xử lý (chỉ admin nhìn thấy)..."
                  maxLength={1000}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingContact(null)} disabled={updateContact.isPending}>
              Đóng
            </Button>
            <Button onClick={saveDetail} disabled={updateContact.isPending}>
              {updateContact.isPending && <ButtonSpinner />}
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deletingContact)} onOpenChange={(open) => !open && setDeletingContact(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá liên hệ?</AlertDialogTitle>
            <AlertDialogDescription>
              Liên hệ của {deletingContact?.name} sẽ bị xoá vĩnh viễn. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteContact.isPending}>Huỷ</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={deleteContact.isPending} onClick={(event) => {
              event.preventDefault();
              confirmDelete();
            }}>
              {deleteContact.isPending && <ButtonSpinner />}
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function getApiErrorMessage(error: unknown, fallback: string) {
  const err = error as AxiosError<ApiErrorResponse>;
  const errors = err.response?.data?.errors as Record<string, string[]> | undefined;
  const firstError = errors ? Object.values(errors).flat().find(Boolean) : undefined;

  return firstError ?? err.response?.data?.message ?? err.message ?? fallback;
}
