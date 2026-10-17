import { useEffect, useMemo, useState } from "react";
import type { AxiosError } from "axios";
import { Newspaper, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
import { useAdminPosts, useCreatePost, useDeletePost, useUpdatePost } from "@/hooks/useAdminPosts";
import { wasApiConnectionNotified } from "@/lib/api";
import { formatDateTime } from "@/lib/date-time";
import type { ApiErrorResponse } from "@/types/auth";
import type { Post, PostPayload, PostStatus, PostStatusFilter } from "@/types/post";

const PAGE_SIZE = 10;

const STATUS_LABELS: Record<PostStatus, string> = {
  draft: "Bản nháp",
  published: "Đã xuất bản",
};

const STATUS_BADGE_CLASS: Record<PostStatus, string> = {
  draft: "bg-stone-100 text-stone-700",
  published: "bg-emerald-50 text-emerald-700",
};

interface PostFormValues {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  cover_image: string;
  content: string;
  status: PostStatus;
  read_minutes: string;
}

const EMPTY_FORM: PostFormValues = {
  title: "",
  slug: "",
  category: "",
  excerpt: "",
  cover_image: "",
  content: "",
  status: "draft",
  read_minutes: "",
};

export default function Posts() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<PostStatusFilter>("all");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [deletingPost, setDeletingPost] = useState<Post | null>(null);
  const [form, setForm] = useState<PostFormValues>(EMPTY_FORM);

  const createPost = useCreatePost();
  const updatePost = useUpdatePost();
  const deletePost = useDeletePost();
  const saving = createPost.isPending || updatePost.isPending;

  const listParams = useMemo(() => ({
    search: debouncedSearch,
    status,
    page,
    per_page: PAGE_SIZE,
  }), [debouncedSearch, page, status]);

  const postsQuery = useAdminPosts(listParams);
  const posts = postsQuery.data?.data ?? [];
  const pagination = postsQuery.data;
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

  const openCreate = () => {
    setEditingPost(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEdit = (post: Post) => {
    setEditingPost(post);
    setForm({
      title: post.title,
      slug: post.slug,
      category: post.category ?? "",
      excerpt: post.excerpt ?? "",
      cover_image: post.cover_image ?? "",
      content: post.content,
      status: post.status,
      read_minutes: post.read_minutes ? String(post.read_minutes) : "",
    });
    setFormOpen(true);
  };

  const setField = <K extends keyof PostFormValues>(field: K, value: PostFormValues[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submitForm = () => {
    const payload: PostPayload = {
      title: form.title.trim(),
      slug: form.slug.trim() || undefined,
      category: form.category.trim() || undefined,
      excerpt: form.excerpt.trim() || undefined,
      cover_image: form.cover_image.trim() || undefined,
      content: form.content,
      status: form.status,
      read_minutes: form.read_minutes ? Number(form.read_minutes) : undefined,
    };

    const handlers = {
      onSuccess: () => {
        toast.success(editingPost ? "Đã cập nhật bài viết." : "Đã tạo bài viết.");
        setFormOpen(false);
      },
      onError: (error: unknown) => {
        if (wasApiConnectionNotified(error)) return;
        toast.error(getApiErrorMessage(error, editingPost ? "Cập nhật bài viết thất bại." : "Tạo bài viết thất bại."));
      },
    };

    if (editingPost) {
      updatePost.mutate({ id: editingPost.id, payload }, handlers);
    } else {
      createPost.mutate(payload, handlers);
    }
  };

  const confirmDelete = () => {
    if (!deletingPost) return;

    deletePost.mutate(deletingPost.id, {
      onSuccess: () => {
        toast.success("Đã xoá bài viết.");
        setDeletingPost(null);
      },
      onError: (error) => {
        if (wasApiConnectionNotified(error)) return;
        toast.error(getApiErrorMessage(error, "Xoá bài viết thất bại."));
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Bài viết</h1>
          <p className="text-sm text-muted-foreground">{pagination?.total ?? 0} bài viết trên blog</p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={postsQuery.isFetching}
            onClick={() => postsQuery.refetch()}
          >
            <RefreshCw className={`h-4 w-4 ${postsQuery.isFetching ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
          <Button type="button" size="sm" className="gap-1.5" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Viết bài mới
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-9 w-full rounded-md bg-white lg:w-72"
            placeholder="Tìm theo tiêu đề, mô tả..."
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as PostStatusFilter)}
            className="h-9 rounded-md border border-input bg-white px-3 text-sm"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="published">{STATUS_LABELS.published}</option>
            <option value="draft">{STATUS_LABELS.draft}</option>
          </select>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setDebouncedSearch("");
                setStatus("all");
              }}
              className="text-muted-foreground"
            >
              Xoá lọc
            </Button>
          )}
        </div>
      </Card>

      {postsQuery.isLoading ? (
        <div className="rounded-md border border-border bg-white p-4">
          <TableSkeleton rows={6} columns={6} />
        </div>
      ) : postsQuery.isError ? (
        <EmptyState
          icon={Newspaper}
          title="Không thể tải bài viết"
          description="Vui lòng thử lại sau."
          actionLabel="Thử lại"
          onAction={() => postsQuery.refetch()}
        />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title={hasFilters ? "Không tìm thấy bài viết" : "Chưa có bài viết"}
          description={hasFilters ? "Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm." : "Nhấn \"Viết bài mới\" để tạo bài viết đầu tiên."}
          actionLabel={hasFilters ? undefined : "Viết bài mới"}
          onAction={hasFilters ? undefined : openCreate}
        />
      ) : (
        <div className="overflow-x-auto rounded-md border border-border bg-white">
          <Table className="min-w-[1000px] table-fixed">
            <colgroup>
              <col className="w-16" />
              <col className="w-[34%]" />
              <col className="w-32" />
              <col className="w-32" />
              <col className="w-44" />
              <col className="w-28" />
            </colgroup>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">STT</TableHead>
                <TableHead>Bài viết</TableHead>
                <TableHead>Chuyên mục</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Xuất bản</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post, index) => (
                <TableRow key={post.id}>
                  <TableCell className="text-center text-muted-foreground">
                    {((pagination?.current_page ?? page) - 1) * (pagination?.per_page ?? PAGE_SIZE) + index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="line-clamp-1 font-medium text-foreground">{post.title}</div>
                    <div className="mt-1 truncate text-xs text-muted-foreground">/blog/{post.slug}</div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{post.category ?? "-"}</TableCell>
                  <TableCell>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_BADGE_CLASS[post.status]}`}>
                      {STATUS_LABELS[post.status]}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {post.published_at ? formatDateTime(post.published_at) : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(post)}
                        aria-label="Sửa bài viết"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        disabled={deletePost.isPending}
                        onClick={() => setDeletingPost(post)}
                        aria-label="Xoá bài viết"
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

      <Dialog open={formOpen} onOpenChange={(open) => !saving && setFormOpen(open)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? "Sửa bài viết" : "Viết bài mới"}</DialogTitle>
            <DialogDescription>
              {editingPost ? `Đang chỉnh sửa: ${editingPost.title}` : "Nội dung hỗ trợ markdown đơn giản: \"## Tiêu đề\" và danh sách \"- \"."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <FormField label="Tiêu đề *" htmlFor="post-title">
              <Input
                id="post-title"
                value={form.title}
                onChange={(event) => setField("title", event.target.value)}
                className="h-9 bg-white"
                placeholder="Tiêu đề bài viết"
              />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Slug (để trống sẽ tự tạo)" htmlFor="post-slug">
                <Input
                  id="post-slug"
                  value={form.slug}
                  onChange={(event) => setField("slug", event.target.value)}
                  className="h-9 bg-white"
                  placeholder="vd: cach-chon-nuoc-hoa"
                />
              </FormField>
              <FormField label="Chuyên mục" htmlFor="post-category">
                <Input
                  id="post-category"
                  value={form.category}
                  onChange={(event) => setField("category", event.target.value)}
                  className="h-9 bg-white"
                  placeholder="vd: Hướng dẫn"
                />
              </FormField>
            </div>

            <FormField label="Mô tả ngắn" htmlFor="post-excerpt">
              <textarea
                id="post-excerpt"
                value={form.excerpt}
                onChange={(event) => setField("excerpt", event.target.value)}
                className="min-h-16 rounded-md border border-input bg-white px-3 py-2 text-sm"
                placeholder="Tóm tắt hiển thị ở danh sách bài viết..."
                maxLength={1000}
              />
            </FormField>

            <FormField label="Ảnh bìa (URL)" htmlFor="post-cover">
              <Input
                id="post-cover"
                value={form.cover_image}
                onChange={(event) => setField("cover_image", event.target.value)}
                className="h-9 bg-white"
                placeholder="https://example.com/cover.jpg"
              />
              {form.cover_image.trim() && (
                <img
                  src={form.cover_image.trim()}
                  alt="Xem trước ảnh bìa"
                  className="mt-2 aspect-[16/9] w-full rounded-md border border-border object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                  onLoad={(event) => {
                    event.currentTarget.style.display = "";
                  }}
                />
              )}
            </FormField>

            <FormField label="Nội dung (markdown) *" htmlFor="post-content">
              <textarea
                id="post-content"
                value={form.content}
                onChange={(event) => setField("content", event.target.value)}
                className="min-h-56 rounded-md border border-input bg-white px-3 py-2 font-mono text-sm"
                placeholder={"Đoạn mở đầu...\n\n## Tiêu đề mục\n\nNội dung...\n\n- Ý thứ nhất\n- Ý thứ hai"}
              />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Trạng thái" htmlFor="post-status">
                <select
                  id="post-status"
                  value={form.status}
                  onChange={(event) => setField("status", event.target.value as PostStatus)}
                  className="h-9 rounded-md border border-input bg-white px-3 text-sm"
                >
                  <option value="draft">{STATUS_LABELS.draft}</option>
                  <option value="published">{STATUS_LABELS.published}</option>
                </select>
              </FormField>
              <FormField label="Thời gian đọc (phút)" htmlFor="post-read-minutes">
                <Input
                  id="post-read-minutes"
                  type="number"
                  min={1}
                  max={120}
                  value={form.read_minutes}
                  onChange={(event) => setField("read_minutes", event.target.value)}
                  className="h-9 bg-white"
                  placeholder="vd: 5"
                />
              </FormField>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)} disabled={saving}>
              Huỷ
            </Button>
            <Button onClick={submitForm} disabled={saving || !form.title.trim() || !form.content.trim()}>
              {saving && <ButtonSpinner />}
              {editingPost ? "Lưu thay đổi" : "Tạo bài viết"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deletingPost)} onOpenChange={(open) => !open && setDeletingPost(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá bài viết?</AlertDialogTitle>
            <AlertDialogDescription>
              Bài viết "{deletingPost?.title}" sẽ bị xoá vĩnh viễn. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletePost.isPending}>Huỷ</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={deletePost.isPending} onClick={(event) => {
              event.preventDefault();
              confirmDelete();
            }}>
              {deletePost.isPending && <ButtonSpinner />}
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function FormField({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <label className="text-sm font-medium text-foreground" htmlFor={htmlFor}>{label}</label>
      {children}
    </div>
  );
}

function getApiErrorMessage(error: unknown, fallback: string) {
  const err = error as AxiosError<ApiErrorResponse>;
  const errors = err.response?.data?.errors as Record<string, string[]> | undefined;
  const firstError = errors ? Object.values(errors).flat().find(Boolean) : undefined;

  return firstError ?? err.response?.data?.message ?? err.message ?? fallback;
}
