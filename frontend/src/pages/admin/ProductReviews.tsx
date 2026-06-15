import { useEffect, useMemo, useState } from "react";
import type { AxiosError } from "axios";
import { Check, MessageSquare, RefreshCw, Star, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  PRODUCT_REVIEW_PAGE_SIZE,
  PRODUCT_REVIEW_RATING_OPTIONS,
  PRODUCT_REVIEW_STATUS_BADGE_CLASS,
  PRODUCT_REVIEW_STATUS_FILTER_OPTIONS,
  PRODUCT_REVIEW_STATUS_LABELS,
} from "@/constants/product-review";
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
import {
  useAdminProductReviews,
  useApproveProductReview,
  useDeleteProductReview,
  useRejectProductReview,
} from "@/hooks/useProductReviews";
import { wasApiConnectionNotified } from "@/lib/api";
import { formatDateTime } from "@/lib/date-time";
import type { ApiErrorResponse } from "@/types/auth";
import type { ProductReview, ProductReviewListParams, ProductReviewRatingFilter, ProductReviewStatusFilter } from "@/types/product-review";

export default function AdminProductReviews() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<ProductReviewStatusFilter>("all");
  const [rating, setRating] = useState<ProductReviewRatingFilter>("all");
  const [page, setPage] = useState(1);
  const [rejectingReview, setRejectingReview] = useState<ProductReview | null>(null);
  const [deletingReview, setDeletingReview] = useState<ProductReview | null>(null);
  const [adminNote, setAdminNote] = useState("");

  const approveReview = useApproveProductReview();
  const rejectReview = useRejectProductReview();
  const deleteReview = useDeleteProductReview();

  const listParams = useMemo<ProductReviewListParams>(() => ({
    search: debouncedSearch,
    status,
    rating,
    page,
    per_page: PRODUCT_REVIEW_PAGE_SIZE,
  }), [debouncedSearch, page, rating, status]);

  const reviewsQuery = useAdminProductReviews(listParams);
  const reviews = reviewsQuery.data?.data ?? [];
  const pagination = reviewsQuery.data;
  const hasFilters = Boolean(debouncedSearch || status !== "all" || rating !== "all");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, rating, status]);

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setStatus("all");
    setRating("all");
  };

  const approve = (review: ProductReview) => {
    approveReview.mutate(review.id, {
      onSuccess: () => toast.success("Đã duyệt đánh giá."),
      onError: (error) => {
        if (wasApiConnectionNotified(error)) return;
        toast.error(getApiErrorMessage(error, "Duyệt đánh giá thất bại."));
      },
    });
  };

  const confirmReject = () => {
    if (!rejectingReview) return;

    rejectReview.mutate(
      { id: rejectingReview.id, admin_note: adminNote.trim() || null },
      {
        onSuccess: () => {
          toast.success("Đã từ chối đánh giá.");
          setRejectingReview(null);
          setAdminNote("");
        },
        onError: (error) => {
          if (wasApiConnectionNotified(error)) return;
          toast.error(getApiErrorMessage(error, "Từ chối đánh giá thất bại."));
        },
      },
    );
  };

  const confirmDelete = () => {
    if (!deletingReview) return;

    deleteReview.mutate(deletingReview.id, {
      onSuccess: () => {
        toast.success("Đã xoá đánh giá.");
        setDeletingReview(null);
      },
      onError: (error) => {
        if (wasApiConnectionNotified(error)) return;
        toast.error(getApiErrorMessage(error, "Xoá đánh giá thất bại."));
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Đánh giá</h1>
          <p className="text-sm text-muted-foreground">{pagination?.total ?? 0} đánh giá sản phẩm</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          disabled={reviewsQuery.isFetching}
          onClick={() => reviewsQuery.refetch()}
        >
          <RefreshCw className={`h-4 w-4 ${reviewsQuery.isFetching ? "animate-spin" : ""}`} />
          Làm mới
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-9 w-full rounded-md bg-white lg:w-72"
            placeholder="Tìm sản phẩm, khách hàng, nội dung..."
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as ProductReviewStatusFilter)}
            className="h-9 rounded-md border border-input bg-white px-3 text-sm"
          >
            {PRODUCT_REVIEW_STATUS_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <select
            value={rating}
            onChange={(event) => setRating((event.target.value === "all" ? "all" : Number(event.target.value)) as ProductReviewRatingFilter)}
            className="h-9 rounded-md border border-input bg-white px-3 text-sm"
          >
            {PRODUCT_REVIEW_RATING_OPTIONS.map((option) => (
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

      {reviewsQuery.isLoading ? (
        <div className="rounded-md border border-border bg-white p-4">
          <TableSkeleton rows={6} columns={8} />
        </div>
      ) : reviewsQuery.isError ? (
        <EmptyState
          icon={MessageSquare}
          title="Không thể tải đánh giá"
          description="Vui lòng thử lại sau."
          actionLabel="Thử lại"
          onAction={() => reviewsQuery.refetch()}
        />
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title={hasFilters ? "Không tìm thấy đánh giá" : "Chưa có đánh giá"}
          description={hasFilters ? "Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm." : "Đánh giá mới sẽ xuất hiện tại đây sau khi khách gửi."}
        />
      ) : (
        <div className="overflow-x-auto rounded-md border border-border bg-white">
          <Table className="min-w-[1050px] table-fixed">
            <colgroup>
              <col className="w-16" />
              <col className="w-[22%]" />
              <col className="w-[18%]" />
              <col className="w-28" />
              <col className="w-[28%]" />
              <col className="w-28" />
              <col className="w-40" />
              <col className="w-32" />
            </colgroup>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">STT</TableHead>
                <TableHead>Sản phẩm</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Nội dung</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày gửi</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map((review, index) => (
                <TableRow key={review.id}>
                  <TableCell className="text-center text-muted-foreground">
                    {((pagination?.current_page ?? page) - 1) * (pagination?.per_page ?? PRODUCT_REVIEW_PAGE_SIZE) + index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground">{review.product?.name ?? "Sản phẩm"}</div>
                    {review.order?.order_code && <div className="mt-1 text-xs text-muted-foreground">#{review.order.order_code}</div>}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground">{review.user?.full_name ?? "-"}</div>
                    <div className="mt-1 truncate text-xs text-muted-foreground">{review.user?.email ?? ""}</div>
                  </TableCell>
                  <TableCell><RatingStars rating={review.rating} /></TableCell>
                  <TableCell>
                    <div className="line-clamp-1 font-medium text-foreground">{review.title ?? "Không có tiêu đề"}</div>
                    <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{review.content ?? "-"}</div>
                    {review.admin_note && <div className="mt-1 line-clamp-1 text-xs text-red-600">Ghi chú: {review.admin_note}</div>}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${PRODUCT_REVIEW_STATUS_BADGE_CLASS[review.status]}`}>
                      {PRODUCT_REVIEW_STATUS_LABELS[review.status]}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDateTime(review.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-emerald-700"
                        disabled={approveReview.isPending || review.status === "approved"}
                        onClick={() => approve(review)}
                        aria-label="Duyệt đánh giá"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-amber-700"
                        disabled={rejectReview.isPending || review.status === "rejected"}
                        onClick={() => {
                          setRejectingReview(review);
                          setAdminNote(review.admin_note ?? "");
                        }}
                        aria-label="Từ chối đánh giá"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        disabled={deleteReview.isPending}
                        onClick={() => setDeletingReview(review)}
                        aria-label="Xoá đánh giá"
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

      <AlertDialog open={Boolean(rejectingReview)} onOpenChange={(open) => !open && setRejectingReview(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Từ chối đánh giá?</AlertDialogTitle>
            <AlertDialogDescription>
              Đánh giá sẽ không hiển thị ở trang sản phẩm. Bạn có thể thêm ghi chú nội bộ.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <textarea
            value={adminNote}
            onChange={(event) => setAdminNote(event.target.value)}
            className="min-h-24 rounded-md border border-input bg-white px-3 py-2 text-sm"
            placeholder="Ghi chú quản trị..."
            maxLength={1000}
          />
          <AlertDialogFooter>
            <AlertDialogCancel disabled={rejectReview.isPending}>Huỷ</AlertDialogCancel>
            <AlertDialogAction disabled={rejectReview.isPending} onClick={(event) => {
              event.preventDefault();
              confirmReject();
            }}>
              {rejectReview.isPending && <ButtonSpinner />}
              Từ chối
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={Boolean(deletingReview)} onOpenChange={(open) => !open && setDeletingReview(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá đánh giá?</AlertDialogTitle>
            <AlertDialogDescription>Hành động này không thể hoàn tác.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteReview.isPending}>Huỷ</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={deleteReview.isPending} onClick={(event) => {
              event.preventDefault();
              confirmDelete();
            }}>
              {deleteReview.isPending && <ButtonSpinner />}
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} sao`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3.5 w-3.5 ${star <= rating ? "fill-amber-500 text-amber-500" : "text-muted-foreground/40"}`}
        />
      ))}
    </span>
  );
}

function getApiErrorMessage(error: unknown, fallback: string) {
  const err = error as AxiosError<ApiErrorResponse>;
  const errors = err.response?.data?.errors as Record<string, string[]> | undefined;
  const firstError = errors ? Object.values(errors).flat().find(Boolean) : undefined;

  return firstError ?? err.response?.data?.message ?? err.message ?? fallback;
}
