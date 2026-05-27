import { useEffect, useMemo, useState } from "react";
import type { AxiosError } from "axios";
import { Download, RefreshCw, Users as UsersIcon } from "lucide-react";
import { toast } from "sonner";
import { adminUserApi } from "@/api/admin/user";
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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserFilters } from "@/components/admin/users/UserFilters";
import { UserFormSheet } from "@/components/admin/users/UserFormSheet";
import { UserTable } from "@/components/admin/users/UserTable";
import { AdminBulkActionBar } from "@/components/admin/shared/AdminBulkActionBar";
import { ButtonSpinner } from "@/components/shared/ButtonSpinner";
import { USER_PAGE_SIZE, USER_ROLE_LABELS, USER_STATUS_LABELS } from "@/constants/admin-users";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminUsers, useDeleteUser } from "@/hooks/useAdminUsers";
import { wasApiConnectionNotified } from "@/lib/api";
import { exportExcel, type ExcelColumn } from "@/lib/export-excel";
import type { ApiErrorResponse } from "@/types/auth";
import type {
  AdminUser,
  AdminUserListParams,
  AdminUserRoleFilter,
  AdminUserStatusFilter,
} from "@/types/admin/user";

export default function Users() {
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [role, setRole] = useState<AdminUserRoleFilter>("all");
  const [status, setStatus] = useState<AdminUserStatusFilter>("all");
  const [page, setPage] = useState(1);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const deleteUser = useDeleteUser();

  const listParams = useMemo<AdminUserListParams>(() => ({
    search: debouncedSearch,
    role,
    status,
    page,
    per_page: USER_PAGE_SIZE,
  }), [debouncedSearch, page, role, status]);

  const usersQuery = useAdminUsers(listParams);

  const users = usersQuery.data?.data ?? [];
  const currentUserId = currentUser?.id;
  const hasFilters = Boolean(debouncedSearch.trim()) || role !== "all" || status !== "all";

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    setPage(1);
    setSelectedUserIds(new Set());
  }, [debouncedSearch, role, status]);

  const openEdit = (user: AdminUser) => {
    setEditingUser(user);
    setSheetOpen(true);
  };

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setRole("all");
    setStatus("all");
  };

  const confirmDelete = () => {
    if (!deletingUser) return;

    deleteUser.mutate(deletingUser.id, {
      onSuccess: () => {
        toast.success("Đã xoá người dùng.");
        setDeletingUser(null);
        setSelectedUserIds((current) => {
          const next = new Set(current);
          next.delete(deletingUser.id);
          return next;
        });
        if (users.length === 1 && page > 1) {
          setPage((current) => current - 1);
        }
      },
      onError: (error) => {
        if (wasApiConnectionNotified(error)) return;
        toast.error(getApiErrorMessage(error, "Xoá người dùng thất bại."));
      },
    });
  };

  const confirmBulkDelete = async () => {
    const ids = Array.from(selectedUserIds).filter((id) => id !== currentUserId);
    if (ids.length === 0) return;

    try {
      await Promise.all(ids.map((id) => deleteUser.mutateAsync(id)));
      toast.success(`Đã xoá ${ids.length} người dùng.`);
      setSelectedUserIds(new Set());
      setBulkDeleteOpen(false);
      if (ids.length >= users.length && page > 1) {
        setPage((current) => current - 1);
      }
    } catch (error) {
      if (wasApiConnectionNotified(error)) return;
      toast.error(getApiErrorMessage(error, "Xoá người dùng đã chọn thất bại."));
    }
  };

  const exportUsers = async () => {
    setIsExporting(true);

    try {
      const response = await adminUserApi.getUsers({
        search: debouncedSearch,
        role,
        status,
        per_page: 100,
      });

      if (response.data.length === 0) {
        toast.error("Không có người dùng để xuất.");
        return;
      }

      await exportExcel({
        rows: response.data,
        columns: USER_EXPORT_COLUMNS,
        filename: "maison-users",
        sheetName: "Người dùng",
      });

      toast.success("Đã xuất file Excel người dùng.");
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
          <h1 className="text-2xl font-semibold text-foreground">Người dùng</h1>
          <p className="text-sm text-muted-foreground">
            {usersQuery.data?.total ?? 0} người dùng
          </p>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <Button
            variant="outline"
            onClick={exportUsers}
            disabled={isExporting || usersQuery.isLoading}
            className="gap-1.5"
          >
            {isExporting ? <ButtonSpinner /> : <Download className="h-4 w-4" />}
            Xuất Excel
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <UserFilters
          search={search}
          role={role}
          status={status}
          isFetching={usersQuery.isFetching}
          onSearchChange={setSearch}
          onRoleChange={setRole}
          onStatusChange={setStatus}
          onClear={clearFilters}
          onRefresh={() => usersQuery.refetch()}
        />
      </Card>

      {usersQuery.isError ? (
        <div className="flex flex-col items-center justify-center rounded-md border border-border bg-white px-4 py-14 text-center">
          <UsersIcon className="mb-3 h-10 w-10 text-muted-foreground/50" strokeWidth={1.5} />
          <h3 className="text-base font-semibold text-foreground">Không thể tải người dùng</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {getApiErrorMessage(usersQuery.error, "Vui lòng thử lại sau.")}
          </p>
          <Button className="mt-4" onClick={() => usersQuery.refetch()}>
            <RefreshCw className="h-4 w-4" />
            Thử lại
          </Button>
        </div>
      ) : (
        <UserTable
          users={users}
          pagination={usersQuery.data}
          isLoading={usersQuery.isLoading}
          hasFilters={hasFilters}
          currentPage={page}
          currentUserId={currentUserId}
          isFetching={usersQuery.isFetching}
          selectedIds={selectedUserIds}
          onPageChange={(nextPage) => {
            setSelectedUserIds(new Set());
            setPage(nextPage);
          }}
          onEdit={openEdit}
          onDelete={setDeletingUser}
          onSelectedChange={setSelectedUserIds}
        />
      )}

      <UserFormSheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) setEditingUser(null);
        }}
        user={editingUser}
      />

      <AlertDialog open={Boolean(deletingUser)} onOpenChange={(open) => !open && setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá người dùng {deletingUser?.full_name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Người dùng sẽ bị xoá khỏi hệ thống quản trị.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteUser.isPending}>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteUser.isPending}
              onClick={(event) => {
                event.preventDefault();
                confirmDelete();
              }}
            >
              {deleteUser.isPending && <ButtonSpinner />}
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá {selectedUserIds.size} người dùng đã chọn?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Các người dùng đã chọn sẽ bị xoá khỏi hệ thống quản trị.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteUser.isPending}>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteUser.isPending}
              onClick={(event) => {
                event.preventDefault();
                confirmBulkDelete();
              }}
            >
              {deleteUser.isPending && <ButtonSpinner />}
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AdminBulkActionBar
        selectedCount={selectedUserIds.size}
        itemLabel="người dùng"
        isDeleting={deleteUser.isPending}
        onDeleteSelected={() => setBulkDeleteOpen(true)}
        onDeselectAll={() => setSelectedUserIds(new Set())}
      />
    </div>
  );
}

function getApiErrorMessage(error: unknown, fallback: string) {
  const err = error as AxiosError<ApiErrorResponse>;
  return err.response?.data?.message ?? err.message ?? fallback;
}

const USER_EXPORT_COLUMNS: ExcelColumn<AdminUser>[] = [
  {
    header: "STT",
    accessor: (_user, index) => index + 1,
  },
  {
    header: "Tên",
    accessor: (user) => user.full_name,
  },
  {
    header: "Email",
    accessor: (user) => user.email,
  },
  {
    header: "Số điện thoại",
    accessor: (user) => user.phone,
  },
  {
    header: "Vai trò",
    accessor: (user) => USER_ROLE_LABELS[user.role],
  },
  {
    header: "Trạng thái",
    accessor: (user) => USER_STATUS_LABELS[user.status],
  },
  {
    header: "Ngày tạo",
    accessor: (user) => formatDate(user.created_at),
  },
  {
    header: "Ngày cập nhật",
    accessor: (user) => formatDate(user.updated_at),
  },
];

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}
