import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/skeletons/TableSkeleton";
import { UserRoleBadge } from "@/components/admin/users/UserRoleBadge";
import { UserRowActionsMenu } from "@/components/admin/users/UserRowActionsMenu";
import { UserStatusBadge } from "@/components/admin/users/UserStatusBadge";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatDateTime } from "@/lib/date-time";
import { formatVietnamPhone } from "@/lib/phone";
import type { AdminUser, AdminUserListResponse } from "@/types/admin/user";

interface UserTableProps {
  users: AdminUser[];
  pagination?: AdminUserListResponse;
  isLoading?: boolean;
  hasFilters?: boolean;
  currentPage: number;
  currentUserId?: number;
  isFetching?: boolean;
  selectedIds?: Set<number>;
  onPageChange: (page: number) => void;
  onEdit: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
  onSelectedChange?: (selectedIds: Set<number>) => void;
}

export function UserTable({
  users,
  pagination,
  isLoading,
  hasFilters,
  currentPage,
  currentUserId,
  isFetching,
  selectedIds = EMPTY_SELECTED_IDS,
  onPageChange,
  onEdit,
  onDelete,
  onSelectedChange = noopSelectionChange,
}: UserTableProps) {
  const isMobile = useIsMobile();
  const selectableUsers = users.filter((user) => user.id !== currentUserId);
  const allSelected = selectableUsers.length > 0 && selectableUsers.every((user) => selectedIds.has(user.id));
  const someSelected = selectableUsers.some((user) => selectedIds.has(user.id));

  const toggleAll = (checked: boolean) => {
    const next = new Set(selectedIds);

    selectableUsers.forEach((user) => {
      if (checked) {
        next.add(user.id);
      } else {
        next.delete(user.id);
      }
    });

    onSelectedChange(next);
  };

  const toggleOne = (userId: number, checked: boolean) => {
    const next = new Set(selectedIds);

    if (checked) {
      next.add(userId);
    } else {
      next.delete(userId);
    }

    onSelectedChange(next);
  };

  if (isLoading) {
    return (
      <div className="rounded-md border border-border bg-white p-4">
        <TableSkeleton rows={6} columns={9} />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title={hasFilters ? "Không tìm thấy người dùng" : "Chưa có người dùng"}
        description={
          hasFilters
            ? "Thử thay đổi từ khoá tìm kiếm hoặc bộ lọc."
            : "Người dùng sẽ xuất hiện sau khi có tài khoản đăng ký."
        }
      />
    );
  }

  const paginationContent = (
    <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
      <span>
        Hiển thị {pagination?.from ?? 0}-{pagination?.to ?? 0} trong {pagination?.total ?? 0} người dùng
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1 || isFetching}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        >
          Trước
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!pagination || currentPage >= pagination.last_page || isFetching}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Sau
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div>
        <div className="space-y-3">
          {users.map((user) => {
            const isCurrentUser = user.id === currentUserId;

            return (
              <Card key={user.id} className="transition-colors hover:bg-muted/50">
                <CardHeader className="px-4 pb-2 pt-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <Checkbox
                        checked={selectedIds.has(user.id)}
                        disabled={isCurrentUser}
                        onCheckedChange={(checked) => toggleOne(user.id, checked === true)}
                        aria-label={`Chọn người dùng ${user.full_name}`}
                      />
                      <UserAvatar user={user} />
                      <div className="min-w-0">
                        <CardTitle className="truncate text-sm font-medium">{user.full_name}</CardTitle>
                        <p className="mt-1 truncate text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <UserStatusBadge status={user.status} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 px-4 pb-3 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Vai trò</span>
                    <UserRoleBadge role={user.role} />
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Số điện thoại</span>
                    <span>{formatVietnamPhone(user.phone) || "-"}</span>
                  </div>
                  <div className="flex justify-end pt-1">
                    <UserRowActionsMenu
                      user={user}
                      disableDelete={isCurrentUser}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        {paginationContent}
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-md border border-border bg-white">
        <Table className="min-w-[1240px] table-fixed">
          <colgroup>
            <col className="w-12" />
            <col className="w-16" />
            <col className="w-[28%]" />
            <col className="w-36" />
            <col className="w-36" />
            <col className="w-36" />
            <col className="w-40" />
            <col className="w-40" />
            <col className="w-12" />
          </colgroup>
          <TableHeader className="sticky top-0 bg-card">
            <TableRow>
              <TableHead className="pl-4">
                <Checkbox
                  checked={allSelected ? true : someSelected ? "indeterminate" : false}
                  onCheckedChange={(checked) => toggleAll(checked === true)}
                  aria-label="Chọn tất cả người dùng trên trang"
                />
              </TableHead>
              <TableHead className="text-center">STT</TableHead>
              <TableHead>Người dùng</TableHead>
              <TableHead>Số điện thoại</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Ngày cập nhật</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user, index) => {
              const isCurrentUser = user.id === currentUserId;

              return (
                <TableRow key={user.id} className={selectedIds.has(user.id) ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/50"}>
                  <TableCell className="pl-4" onClick={(event) => event.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.has(user.id)}
                      disabled={isCurrentUser}
                      onCheckedChange={(checked) => toggleOne(user.id, checked === true)}
                      aria-label={`Chọn người dùng ${user.full_name}`}
                    />
                  </TableCell>
                  <TableCell className="text-center font-mono text-xs text-muted-foreground">
                    {((pagination?.current_page ?? currentPage) - 1) * (pagination?.per_page ?? users.length) + index + 1}
                  </TableCell>
                  <TableCell className="min-w-0">
                    <div className="flex min-w-0 items-center gap-3">
                      <UserAvatar user={user} />
                      <div className="min-w-0">
                        <div className="truncate font-medium">
                          {user.full_name}
                          {isCurrentUser && <span className="ml-2 text-xs font-normal text-primary">(Bạn)</span>}
                        </div>
                        <div className="mt-1 truncate text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{formatVietnamPhone(user.phone) || "-"}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <UserRoleBadge role={user.role} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <UserStatusBadge status={user.status} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{formatDateTime(user.created_at)}</TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{formatDateTime(user.updated_at)}</TableCell>
                  <TableCell className="text-right" onClick={(event) => event.stopPropagation()}>
                    <UserRowActionsMenu
                      user={user}
                      disableDelete={isCurrentUser}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      {paginationContent}
    </div>
  );
}

const EMPTY_SELECTED_IDS = new Set<number>();
const noopSelectionChange = () => {};

function UserAvatar({ user }: { user: AdminUser }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sidebar text-sm font-semibold text-sidebar-primary-foreground">
      {getInitials(user.full_name)}
    </div>
  );
}

function getInitials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.charAt(0) ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";

  return `${first}${last}`.toUpperCase() || "U";
}
